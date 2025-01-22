import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';
import { timedDelay } from './Util/index';

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

console.log("Gateway ready")

/*
timedDelay({
    hours:12,
    minutes:0,
    seconds:0,
    miliseconds:0
})
	*/