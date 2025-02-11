import express from 'express';
import login from './Login';

const router = express.Router();

router.use('/login', login);

export default router;
