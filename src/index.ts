import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
	/* options */
});

io.on('connection', socket => {
	console.log(socket.id);
	io.emit('response', 'valeu');

	socket.on('message', message => {
		console.log(message);
	});
});

httpServer.listen(4521);
