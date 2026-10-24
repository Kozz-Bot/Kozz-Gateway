import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { addBoundary, removeBoundary } from './Boundaries';
import { addHandler, removeHandler } from './Handlers';
import { message, reply_with_text } from './Events/Handling/messageHandler';

vi.mock('./Proxies', () => ({ useProxy: vi.fn() }));

const socket = (id: string) => ({ id, emit: vi.fn(), on: vi.fn() });
let boundary: ReturnType<typeof socket>;
let handler: ReturnType<typeof socket>;
let other: ReturnType<typeof socket>;
const incoming = (interactiveResponse?: any) => ({
	id: 'click', body: '!dangerous', santizedBody: '!dangerous', from: 'clicker@lid',
	chatId: 'group@g.us', to: 'group@g.us', contact: { id: 'clicker@lid' },
	taggedContacts: [], messageType: 'TEXT', timestamp: Date.now(), interactiveResponse,
} as any);

beforeEach(() => {
	boundary = socket('button-boundary'); handler = socket('button-handler'); other = socket('other-handler');
	addBoundary(boundary as any, { name: 'buttons', namespace: 'buttons-a', role: 'boundary', platform: 'Baileys', OS: 'linux', signature: 'test' });
	addHandler(handler as any, { name: 'ping', namespace: 'buttons-a', role: 'handler', methods: ['default'], aliases: [{ name: 'testarping', target: { method: 'default' } }], signature: 'test' });
	addHandler(other as any, { name: 'ping', namespace: 'buttons-b', role: 'handler', methods: ['default'], signature: 'test' });
});
afterEach(() => {
	removeBoundary(boundary.id); removeHandler(handler.id); removeHandler(other.id); vi.clearAllMocks();
});

it('routes accepted button commands through alias and namespace resolution with the actual clicker', () => {
	message(boundary as any)(incoming({ type: 'reply', id: 'option', status: 'accepted', command: '!testarping' }));
	expect(handler.emit).toHaveBeenCalledWith('command', expect.objectContaining({
		module: 'ping', method: 'default', namespace: 'buttons-a',
		message: expect.objectContaining({ from: 'clicker@lid', body: '!dangerous', chatId: 'group@g.us' }),
	}));
	expect(other.emit).not.toHaveBeenCalled();
});

it('never interprets an unvalidated button label as a command', () => {
	for (const status of [undefined, 'expired', 'unrecognized', 'duplicate', 'wrong_sender']) {
		message(boundary as any)({ ...incoming({ type: 'reply', status, command: '!ping' }), body: '!ping', santizedBody: '!ping' });
	}
	message(boundary as any)(incoming({ type: 'reply', status: 'accepted' }));
	expect(handler.emit).not.toHaveBeenCalled();
});

it('keeps ordinary text commands working', () => {
	message(boundary as any)({ ...incoming(), body: '!ping', santizedBody: '!ping' });
	expect(handler.emit).toHaveBeenCalledWith('command', expect.objectContaining({ module: 'ping' }));
});

it('preserves button metadata on the existing reply event', () => {
	const payload = { boundaryId: boundary.id, chatId: 'group@g.us', body: 'Menu', interactive: { type: 'buttons', buttons: [{ id: 'ping', label: 'Ping', command: '!ping' }] } };
	reply_with_text(handler as any)(payload as any);
	expect(boundary.emit).toHaveBeenCalledWith('reply_with_text', payload);
});
