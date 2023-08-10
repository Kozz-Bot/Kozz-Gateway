import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';

const megabyte = 1e6;

const io = new Server(4521, {
	//Basically unlimited payload size :v
	maxHttpBufferSize: megabyte * 10000,
	cors: {
		origin: '*',
	},
});

io.on('connection', socket => {
	registerSocketEventHandlers(socket);
});
