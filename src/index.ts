import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';
const io = new Server(4521, {
	maxHttpBufferSize: 1e8,
	cors: {
		origin: '*',
	},
});

io.on('connection', socket => {
	registerSocketEventHandlers(socket);
});
