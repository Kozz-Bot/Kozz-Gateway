import { useEffect, useMemo, useState } from 'react';
import { AppModel } from '@/App/behavior';
import { formatJson } from '@/lib/json';

type BoundaryRecord = {
	id?: string;
	boundary?: {
		name?: string;
		platform?: string;
		OS?: string;
	};
};

type ChatRecord = Record<string, unknown>;
type ChatOption = {
	id: string;
	label: string;
	subtitle: string;
};

const getBoundaryName = (boundary: BoundaryRecord) =>
	boundary.boundary?.name || boundary.id || '';

const getChatId = (chat: ChatRecord) => String(chat.id || '');

const getContact = (chat: ChatRecord) =>
	typeof chat.contact === 'object' && chat.contact !== null
		? (chat.contact as ChatRecord)
		: {};

const isJidLike = (value: unknown) =>
	typeof value === 'string' &&
	/@(lid|s\.whatsapp\.net|g\.us)$/.test(value);

const getReadableLabel = (...values: unknown[]) =>
	String(
		values.find(value => typeof value === 'string' && value && !isJidLike(value)) ||
			''
	);

const getChatTitle = (chat: ChatRecord) => {
	const contact = getContact(chat);
	return (
		getReadableLabel(
			contact.privateName,
			contact.publicName,
			chat.name,
			chat.displayName,
			chat.privateName,
			chat.publicName,
			chat.subject,
			chat.pushName,
			chat.notify
		) || 'Unknown contact'
	);
};

const getChatSubtitle = (chat: ChatRecord) => {
	const id = getChatId(chat);
	if (id.includes('@g.us')) {
		const participants = Array.isArray(chat.participants)
			? `${chat.participants.length} members`
			: 'group';
		return `${participants} · ${id}`;
	}

	return `private · ${id}`;
};

export const useBoundariesBehavior = ({ model }: { model: AppModel }) => {
	const [boundaries, setBoundaries] = useState<BoundaryRecord[]>([]);
	const [boundaryId, setBoundaryId] = useState('');
	const [groups, setGroups] = useState<ChatRecord[]>([]);
	const [privateChats, setPrivateChats] = useState<ChatRecord[]>([]);
	const [chatId, setChatId] = useState('');
	const [chatSearch, setChatSearch] = useState('');
	const [details, setDetails] = useState<unknown>({});
	const [groupInfo, setGroupInfo] = useState<unknown>({});
	const [selectedContact, setSelectedContact] = useState<ChatRecord>({});
	const [profilePicUrl, setProfilePicUrl] = useState('');
	const [messageBody, setMessageBody] = useState('');
	const [sendStatus, setSendStatus] = useState('');

	useEffect(() => {
		model.socket.askGateway('all_boundaries').then(response => {
			const nextBoundaries = (response.response as BoundaryRecord[]) || [];
			setBoundaries(nextBoundaries);
			setBoundaryId(current => current || getBoundaryName(nextBoundaries[0] || {}));
		});
	}, [model.socket]);

	useEffect(() => {
		if (!boundaryId) {
			return;
		}

		Promise.all([
			model.socket.askResource({ id: boundaryId, type: 'Boundary' }, 'all_groups'),
			model.socket.askResource(
				{ id: boundaryId, type: 'Boundary' },
				'all_private_chats'
			),
		]).then(([groupResponse, privateResponse]) => {
			const nextGroups = (groupResponse.response as ChatRecord[]) || [];
			const nextPrivateChats = (privateResponse.response as ChatRecord[]) || [];
			setGroups(nextGroups);
			setPrivateChats(nextPrivateChats);
			setChatId(
				current => current || getChatId(nextGroups[0] || nextPrivateChats[0] || {})
			);
		});
	}, [boundaryId, model.socket]);

	useEffect(() => {
		if (!boundaryId || !chatId) {
			return;
		}

		const target = { id: boundaryId, type: 'Boundary' as const };
		const requests = [
			model.socket.askResource(target, 'chat_details', { id: chatId }),
			model.socket.askResource(target, 'contact_profile_pic', { id: chatId }),
		];

		if (chatId.includes('@g.us')) {
			requests.push(model.socket.askResource(target, 'group_chat_info', { id: chatId }));
			setSelectedContact({});
		} else {
			requests.push(model.socket.askResource(target, 'contact_info', { id: chatId }));
		}

		Promise.all(requests).then(([detailsResponse, picResponse, extraResponse]) => {
			setDetails(detailsResponse);
			setProfilePicUrl(String(picResponse.response || ''));
			if (chatId.includes('@g.us')) {
				setGroupInfo(extraResponse || {});
			} else {
				setGroupInfo({});
				setSelectedContact((extraResponse?.response as ChatRecord | null) || {});
			}
		});
	}, [boundaryId, chatId, model.socket]);

	const chatOptions = useMemo<ChatOption[]>(
		() => [
			...groups.map(chat => ({
				id: getChatId(chat),
				label: getChatTitle(chat),
				subtitle: getChatSubtitle(chat),
			})),
			...privateChats.map(chat => ({
				id: getChatId(chat),
				label: getChatTitle(chat),
				subtitle: getChatSubtitle(chat),
			})),
		],
		[groups, privateChats]
	);

	const filteredChatOptions = useMemo(() => {
		const query = chatSearch.trim().toLowerCase();
		if (!query) {
			return chatOptions;
		}

		return chatOptions.filter(chat =>
			[chat.label, chat.subtitle, chat.id].some(value =>
				value.toLowerCase().includes(query)
			)
		);
	}, [chatOptions, chatSearch]);

	const selectedChat = useMemo(
		() => {
			const chat = chatOptions.find(chat => chat.id === chatId);
			if (!chat || chat.id.includes('@g.us')) {
				return chat;
			}

			const contactLabel = getChatTitle(selectedContact);
			return {
				...chat,
				label: contactLabel || chat.label,
			};
		},
		[chatId, chatOptions, selectedContact]
	);

	const sendMessage = () => {
		const trimmed = messageBody.trim();
		if (!boundaryId || !chatId || !trimmed) {
			return;
		}

		model.socket.sendTextMessage({
			body: trimmed,
			boundaryId,
			chatId,
		});
		setSendStatus('Message dispatched');
		setMessageBody('');
	};

	return {
		boundaries: boundaries.map(boundary => ({
			label: getBoundaryName(boundary),
			value: getBoundaryName(boundary),
		})),
		boundaryId,
		canSend: Boolean(boundaryId && chatId && messageBody.trim()),
		chatId,
		chatOptions: filteredChatOptions,
		chatSearch,
		detailsText: formatJson(details),
		groupInfoText: formatJson(groupInfo),
		messageBody,
		profilePicUrl,
		selectedContactText: formatJson(selectedContact),
		selectedChat,
		sendMessage,
		sendStatus,
		setBoundaryId,
		setChatId,
		setChatSearch,
		setMessageBody,
	};
};
