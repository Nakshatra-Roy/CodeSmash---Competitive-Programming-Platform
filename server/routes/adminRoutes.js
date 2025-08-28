import express from 'express';
const router = express.Router();
import {
    getStats,
    getAllAdmins,
} from '../controllers/adminController.js';

router.get('/stats', getStats);
router.get('/all-admins', getAllAdmins);

export default router;