import express from 'express';
const router = express.Router();

import { register, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router;
