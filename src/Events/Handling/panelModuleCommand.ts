import { Command, MessageReceivedByGateway } from 'kozz-types';
import { Socket } from 'socket.io';
import { getHandlerByName } from 'src/Handlers';
import { createPanelSession } from 'src/PanelSessions';
import { parse } from 'src/Parser';

type PanelModuleCommandPayload = {
	moduleName: string;
	commandText: string;
};

const PANEL_CONTACT = {
	hostAdded: true,
	id: 'kozz-gw-panel',
	isBlocked: false,
	isGroup: false,
	isHostAccount: true,
	privateName: 'Kozz Gateway Panel',
	publicName: 'Kozz Gateway Panel',
};

const createPanelMessage = ({
	body,
	boundaryId,
}: {
	body: string;
	boundaryId: string;
}): MessageReceivedByGateway => ({
	body,
	boundaryId,
	boundaryName: 'kozz-gw-panel',
	chatId: 'kozz-gw-panel',
	contact: PANEL_CONTACT,
	from: 'kozz-gw-panel',
	fromHostAccount: true,
	groupName: undefined,
	id: `panel-message:${Date.now()}`,
	isViewOnce: false,
	messageType: 'TEXT',
	platform: 'other',
	quotedMessage: undefined,
	santizedBody: body,
	taggedConctactFriendlyBody: body,
	taggedContacts: [],
	timestamp: Date.now(),
	to: 'kozz-gw-panel',
});

export const panel_module_command =
	(socket: Socket) =>
	({ moduleName, commandText }: PanelModuleCommandPayload) => {
		const handler = getHandlerByName(moduleName);
		if (!handler) {
			socket.emit('panel_module_error', {
				moduleName,
				message: `Module ${moduleName} is not connected`,
			});
			return;
		}

		const commandBody = commandText.trim().match(/^[!/]/)
			? commandText.trim()
			: `!${moduleName} ${commandText.trim()}`.trim();
		const parsed = parse(commandBody);
		if (parsed.isError) {
			socket.emit('panel_module_error', {
				commandText,
				moduleName,
				message: 'Command could not be parsed',
				parserContext: parsed.stringLeft,
			});
			return;
		}

		const boundaryId = createPanelSession(socket);
		const message = createPanelMessage({
			body: commandBody,
			boundaryId,
		});
		const { method, immediateArg, namedArgs, query } = parsed.result;
		const command: Command = {
			boundaryId,
			boundaryName: 'kozz-gw-panel',
			immediateArg,
			message,
			method,
			module: moduleName,
			namedArgs,
			query,
			taggedContacts: [],
		};

		socket.emit('panel_module_command_dispatched', {
			command,
			moduleName,
		});
		handler.socket.emit('command', command);
	};
