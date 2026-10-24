import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';
import keytar from 'keytar';
import { exec } from 'child_process';
import express from 'express';
import router from './API/Router';
import fs from 'fs';
import crypto from 'crypto';
import { checkApiKey } from './API/Middlewares';
import cors from 'cors';
import path from 'path';

type InitServerOptions = {
	bufferSizeInMB: number;
	port: number;
};

export const createServer = ({ bufferSizeInMB, port }: InitServerOptions) => {
	const megabyte = 1e6;

	const io = new Server(port, {
		maxHttpBufferSize: megabyte * bufferSizeInMB,
		cors: {
			origin: '*',
		},
	});

	io.on('connection', socket => {
		registerSocketEventHandlers(socket);
	});

	return io;
};

const generateRandomAPIKey = () => {
	const randomString = crypto.randomBytes(256).toString('hex');
	fs.access('./keys/api_key.txt', fs.constants.F_OK, err => {
		if (err) {
			fs.writeFileSync('./keys/api_key.txt', randomString);
		}
	});
};

generateRandomAPIKey();

const WebsiteServer = express();
WebsiteServer.use('/web', express.static('./public', { redirect: false }));
WebsiteServer.get('/web', (_req, res) => {
	res.sendFile(path.resolve('./public/index.html'));
});
WebsiteServer.get('/web/*', (_req, res) => {
	res.sendFile(path.resolve('./public/index.html'));
});

const runBoundarySignatureScript = () => {
	exec(
		'node ./scripts/module_signature.js kozz-iwac',
		async (error, stdout, stderr) => {
			if (error) {
				console.warn(`Error executing script: ${error.message}`);
				return;
			}
			if (stderr) {
				console.warn(`Script stderr: ${stderr}`);
				return;
			}

			console.log('Adding introduction payload to keychain');

			keytar.setPassword('kozz-iwac', 'introduction', stdout).catch(err => {
				console.warn(
					'Could not set password with keytar. Is this project running without a desktop environment?'
				);
			});
		}
	);
};

runBoundarySignatureScript();

const readPort = (envName: string, fallback: number) => {
	const raw = process.env[envName];
	if (!raw) {
		return fallback;
	}

	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`${envName} must be a positive integer. Received: ${raw}`);
	}

	return parsed;
};

const gatewayPort = readPort('GATEWAY_PORT', 4521);
const gatewayPanelPort = readPort('GATEWAY_PANEL_PORT', 3878);

createServer({
	bufferSizeInMB: 256,
	port: gatewayPort,
});

console.log(`Gateway ready on port ${gatewayPort}`);

WebsiteServer.use('/api', cors());
WebsiteServer.use('/api', checkApiKey);
WebsiteServer.use('/api', router);

WebsiteServer.listen(gatewayPanelPort);
