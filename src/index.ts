import { Server } from 'socket.io';
const io = new Server(4521, {});
import { registerHandlers } from './Events/Handling';
import { parse } from './Parser';

io.on('connection', socket => {
	console.log(socket.id);

	registerHandlers(socket);
});

const string = '!google image minecraft --amount 15';

console.log(JSON.stringify(parse(string), undefined, '  '));
