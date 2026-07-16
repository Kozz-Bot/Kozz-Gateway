import express from 'express';
import login from './Login';
import { getGatewayAdminSnapshot } from './AdminSnapshot';

const router = express.Router();

router.use('/login', login);

router.get('/gateway/status', (_req, res) => {
	res.send(getGatewayAdminSnapshot().status);
});

router.get('/gateway/snapshot', (_req, res) => {
	res.send(getGatewayAdminSnapshot());
});

export default router;
