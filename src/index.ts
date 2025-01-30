import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';
import keytar from 'keytar';
import { exec } from 'child_process';

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

const runBoundarySignatureScript = () => {
	exec(
		'node ./scripts/boundary_signature.js kozz-baileys',
		(error, stdout, stderr) => {
			if (error) {
				console.warn(`Error executing script: ${error.message}`);
				return;
			}
			if (stderr) {
				console.warn(`Script stderr: ${stderr}`);
				return;
			}

			console.log('Adding introduction payload to keychain');

			keytar.setPassword('kozz-iwac', 'introduction', stdout);
		}
	);
};

runBoundarySignatureScript();

createServer({
	bufferSizeInMB: 256,
	port: 4521,
});

console.log('Gateway ready');
