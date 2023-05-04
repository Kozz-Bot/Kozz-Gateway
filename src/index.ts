import { Server } from 'socket.io';
import { registerSocketEventHandlers } from './Events/Handling';
const io = new Server(4521, {});

io.on('connection', socket => {
	console.log(socket.id);

	registerSocketEventHandlers(socket);
});
