import { Router } from 'express';
import {
  updateProfile,
  uploadProfilePicture,
  getUserById,
  searchUsers,
  toggleFollow,
  getFollowers,
  getFollowing,
  deleteAccount,
  getUserStats,
} from '../controllers/userController';
import {
  authenticate,
  optionalAuthenticate,
} from '../middleware/auth';
import {
  validateBody,
  validateQuery,
  validateParams,
  userSchemas,
  commonSchemas,
} from '../middleware/validation';
import {
  rateLimiter,
  searchRateLimiter,
  strictRateLimiter,
} from '../middleware/rateLimiter';
import {
  avatarUpload,
  validateFile,
  cleanupFiles,
} from '../middleware/upload';

const router = Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  rateLimiter,
  validateBody(userSchemas.updateProfile),
  updateProfile
);

/**
 * @route   POST /api/users/profile/picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post(
  '/profile/picture',
  authenticate,
  rateLimiter,
  cleanupFiles,
  ...avatarUpload,
  validateFile({ required: true, maxFiles: 1 }),
  uploadProfilePicture
);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private
 */
router.get(
  '/search',
  authenticate,
  searchRateLimiter,
  validateQuery(commonSchemas.search),
  searchUsers
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (public profile)
 * @access  Public (with optional auth)
 */
router.get(
  '/:userId',
  optionalAuthenticate,
  rateLimiter,
  validateParams(commonSchemas.idParam),
  getUserById
);

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow/Unfollow user
 * @access  Private
 */
router.post(
  '/:userId/follow',
  authenticate,
  rateLimiter,
  validateParams(commonSchemas.idParam),
  toggleFollow
);

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user followers
 * @access  Public (with optional auth)
 */
router.get(
  '/:userId/followers',
  optionalAuthenticate,
  rateLimiter,
  validateParams(commonSchemas.idParam),
  validateQuery(commonSchemas.pagination),
  getFollowers
);

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get user following
 * @access  Public (with optional auth)
 */
router.get(
  '/:userId/following',
  optionalAuthenticate,
  rateLimiter,
  validateParams(commonSchemas.idParam),
  validateQuery(commonSchemas.pagination),
  getFollowing
);

/**
 * @route   GET /api/users/:userId/stats
 * @desc    Get user statistics
 * @access  Public (with optional auth)
 */
router.get(
  '/:userId/stats',
  optionalAuthenticate,
  rateLimiter,
  validateParams(commonSchemas.idParam),
  getUserStats
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  authenticate,
  strictRateLimiter,
  validateBody(userSchemas.deleteAccount),
  deleteAccount
);

export default router;