import { useEffect, useMemo, useState } from 'react';
import { createPanelSocket, PanelSocket } from '@/lib/panelSocket';
import { createHistoryStore, HistoryEntry } from '@/lib/historyStore';
import { darkTheme, lightTheme } from '@/styles/theme';

export type ThemeMode = 'light' | 'dark';

const AUTH_KEY = 'kozz-gw-panel-auth';
const THEME_KEY = 'kozz-gw-panel-theme';

export type PanelAuth = {
	signature: string;
	setSignature: (signature: string) => void;
	clearSignature: () => void;
};

export type AppModel = ReturnType<typeof useAppBehavior>;

export const useAppBehavior = () => {
	const [signature, setSignatureState] = useState(
		() => localStorage.getItem(AUTH_KEY) || ''
	);
	const [themeMode, setThemeMode] = useState<ThemeMode>(
		() => (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light'
	);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const historyStore = useMemo(() => createHistoryStore(), []);
	const socket = useMemo<PanelSocket>(() => createPanelSocket(historyStore), [
		historyStore,
	]);

	useEffect(() => {
		historyStore.list().then(setHistory);
	}, [historyStore]);

	useEffect(() => {
		const unsubscribe = historyStore.subscribe(setHistory);
		return unsubscribe;
	}, [historyStore]);

	useEffect(() => {
		if (signature) {
			socket.connect(signature);
		}

		return () => socket.disconnect();
	}, [signature, socket]);

	const setSignature = (nextSignature: string) => {
		const trimmed = nextSignature.trim();
		localStorage.setItem(AUTH_KEY, trimmed);
		setSignatureState(trimmed);
	};

	const clearSignature = () => {
		localStorage.removeItem(AUTH_KEY);
		setSignatureState('');
		socket.disconnect();
	};

	const toggleTheme = () => {
		const nextTheme = themeMode === 'light' ? 'dark' : 'light';
		localStorage.setItem(THEME_KEY, nextTheme);
		setThemeMode(nextTheme);
	};

	const flushHistory = async () => {
		await historyStore.clear();
	};

	return {
		auth: {
			signature,
			setSignature,
			clearSignature,
		},
		history,
		flushHistory,
		socket,
		theme: themeMode === 'light' ? lightTheme : darkTheme,
		themeMode,
		toggleTheme,
	};
};
