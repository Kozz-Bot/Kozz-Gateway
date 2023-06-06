import { Introduction } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import boundaries, { isBoundary, addBoundary } from 'src/Boundaries';
import handlers, { isHandler, addHandler } from 'src/Handlers';
import { addDisconnectHandlers } from '../Disconnect';
import { removeSignatureFromPayload, verifyPayload } from 'src/Util';

export const introduction = (socket: Socket) => (introduction: Introduction) => {
	addDisconnectHandlers(socket, introduction);

	if (isBoundary(introduction)) {
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The boundary ${introduction.id} didn't provided a correct signature in the introduction payload`
			);
		}

		addBoundary(introduction.id || socket.id, socket, introduction);

		console.log(
			`Connecting boundary with ID ${
				introduction.id
			}. Total boundaries: ${Object.keys(boundaries)}`
		);
	}
	if (isHandler(introduction)) {
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The handler ${introduction.name} didn't provided a correct signature in the introduction payload`
			);
		}

		addHandler(introduction.name, socket, introduction);

		console.log(
			`Connecting Handler with ID ${introduction.name} and methods ${
				introduction.methods
			}. Total handlers: ${Object.keys(handlers)}`
		);
	}
};
