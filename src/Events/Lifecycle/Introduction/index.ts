import { Introduction } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import boundaries, { isBoundary, addBoundary } from 'src/Boundaries';
import handlers, { isHandler, addHandler } from 'src/Handlers';
import { addDisconnectHandlers } from '../Disconnect';
import { removeSignatureFromPayload, verifyPayload } from 'src/Util';

//[TODO]: Move Introduction ACK to kozz-types
type Introduction_Ack =
	| {
			success: true;
	  }
	| {
			success: false;
			error: string;
	  };

export const introduction = (socket: Socket) => (introduction: Introduction) => {
	console.log({ introduction });

	addDisconnectHandlers(socket, introduction);

	if (isBoundary(introduction)) {
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The boundary ${introduction.name} didn't provided a correct signature in the introduction payload`
			);
		}

		addBoundary(socket, introduction);

		console.log(`Connecting boundary with name ${introduction.name}`);
		socket.emit('introduction_ack', {
			success: true,
		} as Introduction_Ack);
	} else if (isHandler(introduction)) {
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The handler ${introduction.name} didn't provided a correct signature in the introduction payload`
			);
		}

		addHandler(socket, introduction);

		console.log(
			`Connecting Handler with ID ${introduction.name} and methods ${introduction.methods}`
		);
		socket.emit('introduction_ack', {
			success: true,
		} as Introduction_Ack);
	} else {
		socket.emit('introduction_ack', {
			success: false,
			error: 'could not determine role of entity',
		} as Introduction_Ack);
	}
};
