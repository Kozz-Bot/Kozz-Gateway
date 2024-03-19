import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';

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

createServer({
	bufferSizeInMB: 256,
	port: 4521,
});
