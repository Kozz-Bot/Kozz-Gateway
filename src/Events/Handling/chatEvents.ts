import { Socket } from 'socket.io';
import { forwardEventToListeners } from 'src/EventForwarder';

export const chat_react_message = (socket: Socket) => (payload: any) => {
	forwardEventToListeners('chat_react_message', payload);
};

export const chat_edit_message = (socket: Socket) => (payload: any) => {
	forwardEventToListeners('chat_edit_message', payload);
};

export const postman_debug = (socket: Socket) => (payload: any) => {
	forwardEventToListeners('postman_debug', payload);
};
