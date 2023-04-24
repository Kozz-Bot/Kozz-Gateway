import { Server } from 'socket.io';
const io = new Server(4521, {});
import { MessageReceived, SendMessagePayload } from 'kozz-types';

io.on('connection', socket => {
	console.log(socket.id);

	socket.on('message', (message: MessageReceived) => {
		if (message.body === '!ping') {
			const reply: SendMessagePayload = {
				body: 'pong',
				chatId: message.to,
				platform: 'WA',
				timestamp: new Date().getTime(),
				quoteId: message.id,
			};

			socket.emit('reply_message', reply);
		}
	});
});
