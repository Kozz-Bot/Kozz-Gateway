import { Server } from 'socket.io';
const io = new Server(4521, {});
import { registerHandlers } from './Events/Handling';

io.on('connection', socket => {
	console.log(socket.id);

	registerHandlers(socket);
});
