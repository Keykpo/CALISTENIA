import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logInfo, logError } from '../config/logger';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { redisService } from '../config/redis';

const prisma = new PrismaClient();

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bio,
    location,
    timezone,
    language,
    fitnessLevel,
    goals,
    preferences,
    height,
    weight,
    bodyFatPercentage,
    isPublic,
  } = req.body;

  // Update user basic info
  const userUpdateData: any = {};
  if (firstName !== undefined) userUpdateData.firstName = firstName;
  if (lastName !== undefined) userUpdateData.lastName = lastName;
  if (dateOfBirth !== undefined) userUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (gender !== undefined) userUpdateData.gender = gender;
  if (bio !== undefined) userUpdateData.bio = bio;
  if (location !== undefined) userUpdateData.location = location;
  if (timezone !== undefined) userUpdateData.timezone = timezone;
  if (language !== undefined) userUpdateData.language = language;

  // Update profile data
  const profileUpdateData: any = {};
  if (fitnessLevel !== undefined) profileUpdateData.fitnessLevel = fitnessLevel;
  if (goals !== undefined) profileUpdateData.goals = goals;
  if (preferences !== undefined) profileUpdateData.preferences = preferences;
  if (height !== undefined) profileUpdateData.height = height;
  if (weight !== undefined) profileUpdateData.weight = weight;
  if (bodyFatPercentage !== undefined) profileUpdateData.bodyFatPercentage = bodyFatPercentage;
  if (isPublic !== undefined) profileUpdateData.isPublic = isPublic;

  // Update user and profile in transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user if there's data to update
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Update profile if there's data to update
    if (Object.keys(profileUpdateData).length > 0) {
      await tx.userProfile.upsert({
        where: { userId },
        update: profileUpdateData,
        create: {
          userId,
          ...profileUpdateData,
        },
      });
    }

    // Return updated user with profile
    return tx.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });
  });

  // Clear user cache
  await redisService.del(`user:${userId}`);

  logInfo('User profile updated', { userId });

  res.json({
    success: true,
    data: {
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        dateOfBirth: updatedUser!.dateOfBirth,
        gender: updatedUser!.gender,
        bio: updatedUser!.bio,
        location: updatedUser!.location,
        timezone: updatedUser!.timezone,
        language: updatedUser!.language,
        isEmailVerified: updatedUser!.isEmailVerified,
        role: updatedUser!.role,
        subscriptionStatus: updatedUser!.subscriptionStatus,
        profile: updatedUser!.profile,
      },
    },
    message: 'Profile updated successfully',
  });
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    throw new ApiError('No file uploaded', 400);
  }

  // Update user profile picture
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePicture: file.path,
    },
    include: {
      profile: true,
    },
  });

  // Clear user cache
  await redisService.del(`user:${userId}`);

  logInfo('Profile picture updated', { userId, filename: file.filename });

  res.json({
    success: true,
    data: {
      profilePicture: updatedUser.profilePicture,
    },
    message: 'Profile picture updated successfully',
  });
});

// Get user by ID (public profile)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user?.id;

  // Try to get from cache first
  const cacheKey = `user:${userId}`;
  const cachedUser = await redisService.get(cacheKey);
  
  if (cachedUser) {
    const user = JSON.parse(cachedUser);
    return res.json({
      success: true,
      data: { user },
    });
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      _count: {
        select: {
          workouts: true,
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Check if profile is public or if it's the current user
  if (!user.profile?.isPublic && currentUserId !== userId) {
    throw new ApiError('This profile is private', 403);
  }

  // Prepare public user data
  const publicUserData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    location: user.location,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    profile: user.profile ? {
      fitnessLevel: user.profile.fitnessLevel,
      goals: user.profile.goals,
      isPublic: user.profile.isPublic,
    } : null,
    stats: {
      workoutsCount: user._count.workouts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
    },
  };

  // Cache for 5 minutes
  await redisService.set(cacheKey, JSON.stringify(publicUserData), 300);

  res.json({
    success: true,
    data: {
      user: publicUserData,
    },
  });
});

// Search users
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 20 } = req.query;
  const currentUserId = req.user?.id;

  if (!q || typeof q !== 'string') {
    throw new ApiError('Search query is required', 400);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        {
          profile: {
            isPublic: true,
          },
        },
        {
          id: { not: currentUserId }, // Exclude current user
        },
      ],
    },
    include: {
      profile: {
        select: {
          fitnessLevel: true,
          isPublic: true,
        },
      },
      _count: {
        select: {
          followers: true,
          workouts: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
  });

  const total = await prisma.user.count({
    where: {
      AND: [
        {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        {
          profile: {
            isPublic: true,
          },
        },
        {
          id: { not: currentUserId },
        },
      ],
    },
  });

  const usersData = users.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
    profile: user.profile,
    stats: {
      followersCount: user._count.followers,
      workoutsCount: user._count.workouts,
    },
  }));

  res.json({
    success: true,
    data: {
      users: usersData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Follow/Unfollow user
export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user!.id;

  if (userId === currentUserId) {
    throw new ApiError('You cannot follow yourself', 400);
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new ApiError('User not found', 404);
  }

  // Check if already following
  const existingFollow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userId,
      },
    },
  });

  let isFollowing: boolean;

  if (existingFollow) {
    // Unfollow
    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });
    isFollowing = false;
    logInfo('User unfollowed', { followerId: currentUserId, followingId: userId });
  } else {
    // Follow
    await prisma.userFollow.create({
      data: {
        followerId: currentUserId,
        followingId: userId,
      },
    });
    isFollowing = true;
    logInfo('User followed', { followerId: currentUserId, followingId: userId });
  }

  // Clear cache for both users
  await Promise.all([
    redisService.del(`user:${currentUserId}`),
    redisService.del(`user:${userId}`),
  ]);

  res.json({
    success: true,
    data: {
      isFollowing,
    },
    message: isFollowing ? 'User followed successfully' : 'User unfollowed successfully',
  });
});

// Get user followers
export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const followers = await prisma.userFollow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          profile: {
            select: {
              fitnessLevel: true,
            },
          },
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.userFollow.count({
    where: { followingId: userId },
  });

  const followersData = followers.map(follow => follow.follower);

  res.json({
    success: true,
    data: {
      followers: followersData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get user following
export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const following = await prisma.userFollow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          profile: {
            select: {
              fitnessLevel: true,
            },
          },
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.userFollow.count({
    where: { followerId: userId },
  });

  const followingData = following.map(follow => follow.following);

  res.json({
    success: true,
    data: {
      following: followingData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Delete user account
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { password, confirmDelete } = req.body;

  if (!password || confirmDelete !== 'DELETE') {
    throw new ApiError('Password and confirmation are required', 400);
  }

  // Get user and verify password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError('Invalid password', 400);
  }

  // Delete user and all related data (cascade delete should handle most)
  await prisma.user.delete({
    where: { id: userId },
  });

  // Clear all user-related cache
  await Promise.all([
    redisService.del(`user:${userId}`),
    redisService.del(`refresh_token:${userId}`),
  ]);

  logInfo('User account deleted', { userId });

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user?.id;

  // Check if user exists and profile is accessible
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!user.profile?.isPublic && currentUserId !== userId) {
    throw new ApiError('This profile is private', 403);
  }

  // Get comprehensive stats
  const [
    workoutStats,
    followStats,
    communityStats,
    progressStats,
  ] = await Promise.all([
    // Workout statistics
    prisma.workout.aggregate({
      where: { createdBy: userId },
      _count: { id: true },
      _avg: { duration: true },
    }),
    
    // Follow statistics
    prisma.$transaction([
      prisma.userFollow.count({ where: { followerId: userId } }),
      prisma.userFollow.count({ where: { followingId: userId } }),
    ]),
    
    // Community statistics
    prisma.$transaction([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { userId } }),
    ]),
    
    // Progress statistics
    prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 1,
    }),
  ]);

  const stats = {
    workouts: {
      total: workoutStats._count.id,
      averageDuration: workoutStats._avg.duration || 0,
    },
    social: {
      following: followStats[0],
      followers: followStats[1],
    },
    community: {
      posts: communityStats[0],
      comments: communityStats[1],
      likes: communityStats[2],
    },
    progress: {
      latestWeight: progressStats[0]?.weight || null,
      latestBodyFat: progressStats[0]?.bodyFatPercentage || null,
      lastUpdated: progressStats[0]?.date || null,
    },
  };

  res.json({
    success: true,
    data: { stats },
  });
});

export default {
  updateProfile,
  uploadProfilePicture,
  getUserById,
  searchUsers,
  toggleFollow,
  getFollowers,
  getFollowing,
  deleteAccount,
  getUserStats,
};