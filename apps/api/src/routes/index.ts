import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
// Import other route modules as they are created
// import workoutRoutes from './workoutRoutes';
// import exerciseRoutes from './exerciseRoutes';
// import courseRoutes from './courseRoutes';
// import communityRoutes from './communityRoutes';
// import progressRoutes from './progressRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    success: true,
    data: {
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Mount other routes as they are created
// router.use('/workouts', workoutRoutes);
// router.use('/exercises', exerciseRoutes);
// router.use('/courses', courseRoutes);
// router.use('/community', communityRoutes);
// router.use('/progress', progressRoutes);

export default router;