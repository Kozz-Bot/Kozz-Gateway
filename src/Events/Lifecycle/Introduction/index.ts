import { Introduction } from 'kozz-types/dist';
import { Socket } from 'socket.io';
import boundaries, { isBoundary, addBoundary } from 'src/Boundaries';
import handlers, { isHandler, addHandler } from 'src/Handlers';
import { addDisconnectHandlers } from '../Disconnect';
import { removeSignatureFromPayload, verifyPayload } from 'src/Util';
import {
	markBoundaryProxyOnline,
	markSubscriberProxyOnline,
} from 'src/Proxies';
import { normalizeNamespace } from 'src/Entities';

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
	addDisconnectHandlers(socket, introduction);

	if (introduction.role === 'Dashboard') {
		return;
	}

	if (isBoundary(introduction)) {
		const namespace = normalizeNamespace(introduction.namespace);
		const scopedIntroduction = {
			...introduction,
			namespace,
		};
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The boundary ${introduction.name} didn't provided a correct signature in the introduction payload`
			);
		}

		addBoundary(socket, scopedIntroduction);
		markBoundaryProxyOnline(introduction.name, namespace);

		console.log(`Connecting boundary with name ${introduction.name} in namespace ${namespace}`);
		socket.emit('introduction_ack', {
			success: true,
		} as Introduction_Ack);
	} else if (isHandler(introduction)) {
		const namespace = normalizeNamespace(introduction.namespace);
		const scopedIntroduction = {
			...introduction,
			namespace,
		};
		const payloadValid = verifyPayload(
			removeSignatureFromPayload(introduction),
			introduction.signature
		);

		if (!payloadValid) {
			return console.warn(
				`The handler ${introduction.name} didn't provided a correct signature in the introduction payload`
			);
		}

		addHandler(socket, scopedIntroduction);
		markSubscriberProxyOnline(introduction.name, namespace);

		console.log(
			`Connecting Handler with ID ${introduction.name} in namespace ${namespace} and methods ${introduction.methods}`
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
