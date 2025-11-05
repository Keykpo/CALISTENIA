import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { generateToken, generateRefreshToken, verifyRefreshToken, blacklistToken } from '../middleware/auth';
import { redisService } from '../config/redis';
import { config } from '../config';
import { logInfo, logError, logSecurityEvent } from '../config/logger';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, dateOfBirth, gender } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError('User with this email already exists', 400);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      emailVerificationToken,
      emailVerificationExpires,
      profile: {
        create: {
          fitnessLevel: 'BEGINNER',
          goals: [],
          preferences: {},
        },
      },
    },
    include: {
      profile: true,
    },
  });

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: 'email-verification',
      data: {
        firstName,
        verificationUrl: `${config.app.frontendUrl}/verify-email?token=${emailVerificationToken}`,
      },
    });
  } catch (error) {
    logError('Failed to send verification email', error as Error, { userId: user.id });
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in Redis
  await redisService.set(
    `refresh_token:${user.id}`,
    refreshToken,
    config.jwt.refreshExpiresIn
  );

  logInfo('User registered successfully', { userId: user.id, email });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        profile: user.profile,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
    message: 'User registered successfully. Please check your email to verify your account.',
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe = false } = req.body;

  // Find user with profile
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  });

  if (!user) {
    logSecurityEvent('Login attempt with non-existent email', undefined, req.ip, { email });
    throw new ApiError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    const lockTimeRemaining = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
    logSecurityEvent('Login attempt on locked account', user.id, req.ip, { email });
    throw new ApiError(`Account is locked. Try again in ${lockTimeRemaining} minutes.`, 423);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment failed login attempts
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const maxAttempts = 5;
    
    let updateData: any = {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: new Date(),
    };

    // Lock account if too many failed attempts
    if (failedAttempts >= maxAttempts) {
      updateData.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      logSecurityEvent('Account locked due to failed login attempts', user.id, req.ip, { 
        email, 
        failedAttempts 
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    logSecurityEvent('Failed login attempt', user.id, req.ip, { email, failedAttempts });
    throw new ApiError('Invalid email or password', 401);
  }

  // Reset failed login attempts on successful login
  if (user.failedLoginAttempts > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        accountLockedUntil: null,
      },
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
    },
  });

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const expiresIn = rememberMe ? config.jwt.refreshExpiresIn : config.jwt.expiresIn;

  // Store refresh token in Redis
  await redisService.set(
    `refresh_token:${user.id}`,
    refreshToken,
    expiresIn
  );

  logInfo('User logged in successfully', { userId: user.id, email });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        profile: user.profile,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
    message: 'Login successful',
  });
});

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const userId = req.user?.id;

  if (userId) {
    // Remove refresh token from Redis
    await redisService.del(`refresh_token:${userId}`);
    
    // Blacklist current access token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await blacklistToken(token);
    }
  }

  if (refreshToken) {
    // Blacklist refresh token
    await blacklistToken(refreshToken);
  }

  logInfo('User logged out successfully', { userId });

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Refresh access token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.userId;

  // Check if refresh token exists in Redis
  const storedToken = await redisService.get(`refresh_token:${userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw new ApiError('Invalid refresh token', 401);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Generate new tokens
  const newAccessToken = generateToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  // Update refresh token in Redis
  await redisService.set(
    `refresh_token:${userId}`,
    newRefreshToken,
    config.jwt.refreshExpiresIn
  );

  // Blacklist old refresh token
  await blacklistToken(refreshToken);

  res.json({
    success: true,
    data: {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    },
    message: 'Token refreshed successfully',
  });
});

// Verify email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError('Verification token is required', 400);
  }

  // Find user with verification token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError('Invalid or expired verification token', 400);
  }

  // Update user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  logInfo('Email verified successfully', { userId: user.id });

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

// Resend verification email
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new ApiError('Email is already verified', 400);
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    template: 'email-verification',
    data: {
      firstName: user.firstName,
      verificationUrl: `${config.app.frontendUrl}/verify-email?token=${emailVerificationToken}`,
    },
  });

  res.json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires,
    },
  });

  // Send reset email
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl: `${config.app.frontendUrl}/reset-password?token=${resetToken}`,
      },
    });
  } catch (error) {
    logError('Failed to send password reset email', error as Error, { userId: user.id });
  }

  logInfo('Password reset requested', { userId: user.id });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError('Token and password are required', 400);
  }

  // Find user with reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    },
  });

  // Invalidate all existing tokens for this user
  await redisService.del(`refresh_token:${user.id}`);

  logInfo('Password reset successfully', { userId: user.id });
  logSecurityEvent('Password reset completed', user.id, req.ip);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

// Change password (authenticated)
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new ApiError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  // Invalidate all existing refresh tokens
  await redisService.del(`refresh_token:${userId}`);

  logInfo('Password changed successfully', { userId });
  logSecurityEvent('Password changed', userId, req.ip);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
      },
    },
  });
});

export default {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
};