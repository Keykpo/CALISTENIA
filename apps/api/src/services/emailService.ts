import nodemailer from 'nodemailer';
import { config } from '../config';
import { logInfo, logError } from '../config/logger';

// Email template interface
export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  if (config.email.service === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  return nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

// Email templates
const templates = {
  'email-verification': {
    subject: 'Verify your email address',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Calisthenics Platform!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Thank you for signing up for Calisthenics Platform. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${data.verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Calisthenics Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'password-reset': {
    subject: 'Password Reset Request',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>We received a request to reset your password for your Calisthenics Platform account.</p>
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #e74c3c;">${data.resetUrl}</p>
            <div class="warning">
              <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Calisthenics Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'welcome': {
    subject: 'Welcome to Calisthenics Platform!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Calisthenics Platform!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Congratulations! Your email has been verified and your account is now active.</p>
            
            <h3>What you can do now:</h3>
            
            <div class="feature">
              <h4>🏋️ Create Custom Workouts</h4>
              <p>Design personalized calisthenics routines tailored to your fitness level and goals.</p>
            </div>
            
            <div class="feature">
              <h4>📚 Access Training Courses</h4>
              <p>Learn from expert-designed courses covering everything from basics to advanced techniques.</p>
            </div>
            
            <div class="feature">
              <h4>📊 Track Your Progress</h4>
              <p>Monitor your improvements with detailed analytics and progress tracking.</p>
            </div>
            
            <div class="feature">
              <h4>👥 Join the Community</h4>
              <p>Connect with fellow athletes, share your journey, and get motivated.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.dashboardUrl}" class="button">Get Started</a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Calisthenics Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'subscription-confirmation': {
    subject: 'Subscription Confirmed - Welcome to Premium!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .premium-feature { background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); padding: 20px; margin: 15px 0; border-radius: 5px; border: 2px solid #f39c12; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Premium!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Thank you for subscribing to Calisthenics Platform Premium! Your subscription is now active.</p>
            
            <h3>Your Premium Benefits:</h3>
            
            <div class="premium-feature">
              <h4>🔓 Unlimited Access</h4>
              <p>Access to all premium courses, advanced workouts, and exclusive content.</p>
            </div>
            
            <div class="premium-feature">
              <h4>📱 Mobile App</h4>
              <p>Full access to our mobile app with offline workout capabilities.</p>
            </div>
            
            <div class="premium-feature">
              <h4>👨‍🏫 Personal Coaching</h4>
              <p>Get personalized workout recommendations and form corrections.</p>
            </div>
            
            <div class="premium-feature">
              <h4>📈 Advanced Analytics</h4>
              <p>Detailed progress tracking, performance insights, and goal setting tools.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.premiumDashboardUrl}" class="button">Explore Premium Features</a>
            </div>
            
            <p><strong>Subscription Details:</strong></p>
            <ul>
              <li>Plan: ${data.planName}</li>
              <li>Amount: $${data.amount}</li>
              <li>Next billing: ${data.nextBilling}</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; 2024 Calisthenics Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// Send email function
export const sendEmail = async (emailData: EmailTemplate): Promise<void> => {
  try {
    const transporter = createTransporter();
    const template = templates[emailData.template as keyof typeof templates];

    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`);
    }

    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to: emailData.to,
      subject: emailData.subject || template.subject,
      html: template.html(emailData.data),
    };

    const info = await transporter.sendMail(mailOptions);

    logInfo('Email sent successfully', {
      to: emailData.to,
      subject: mailOptions.subject,
      template: emailData.template,
      messageId: info.messageId,
    });
  } catch (error) {
    logError('Failed to send email', error as Error, {
      to: emailData.to,
      template: emailData.template,
    });
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails: EmailTemplate[]): Promise<void> => {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  const failed = results.filter(result => result.status === 'rejected');
  
  if (failed.length > 0) {
    logError('Some bulk emails failed to send', new Error('Bulk email failures'), {
      totalEmails: emails.length,
      failedCount: failed.length,
    });
  }

  logInfo('Bulk emails processed', {
    totalEmails: emails.length,
    successCount: results.length - failed.length,
    failedCount: failed.length,
  });
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logInfo('Email configuration verified successfully');
    return true;
  } catch (error) {
    logError('Email configuration verification failed', error as Error);
    return false;
  }
};

export default {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
};