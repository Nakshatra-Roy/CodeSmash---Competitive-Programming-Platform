import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { getUserSubmissions} from '../controllers/userController.js';


router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:userId/submissions', getUserSubmissions);
router.put('/:id', userController.updateUser);
export default router;