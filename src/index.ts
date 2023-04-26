import { Server } from 'socket.io';
const io = new Server(4521, {});
import { registerHandlers } from './Events/Handling';
import { parse } from './Parser';

io.on('connection', socket => {
	console.log(socket.id);

	registerHandlers(socket);
});

const string =
	'/yt download https://yt.com/video?v=ajk2c --this-is --but-that-is false';

console.log(JSON.stringify(parse(string), undefined, '  '));
