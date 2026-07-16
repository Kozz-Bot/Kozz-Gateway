import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, FileJson, History, KeyRound, Radio, Send, Settings } from 'lucide-react';
import { AppModel } from '@/App/behavior';
import { OverviewPage } from '@/pages/Overview';
import { EntitiesPage } from '@/pages/Entities';
import { ResourcesPage } from '@/pages/Resources';
import { DispatchPage } from '@/pages/Dispatch';
import { HistoryPage } from '@/pages/History';
import { AuthPage } from '@/pages/Auth';
import { SettingsPage } from '@/pages/Settings';

const routes = [
	{ path: '/web', label: 'Overview', icon: Activity, page: OverviewPage },
	{ path: '/web/entities', label: 'Entities', icon: Radio, page: EntitiesPage },
	{ path: '/web/resources', label: 'Resources', icon: Database, page: ResourcesPage },
	{ path: '/web/dispatch', label: 'Dispatch', icon: Send, page: DispatchPage },
	{ path: '/web/history', label: 'History', icon: History, page: HistoryPage },
	{ path: '/web/auth', label: 'Auth', icon: KeyRound, page: AuthPage },
	{ path: '/web/settings', label: 'Settings', icon: Settings, page: SettingsPage },
	{ path: '/web/raw', label: 'Raw JSON', icon: FileJson, page: DispatchPage },
];

export const useAppShellBehavior = (model: AppModel) => {
	const [pathname, setPathname] = useState(window.location.pathname);
	const normalizedPathname = pathname === '/web/' ? '/web' : pathname;
	const activeRoute = useMemo(
		() => routes.find(route => route.path === normalizedPathname) || routes[0],
		[normalizedPathname]
	);
	const Page = activeRoute.page;

	useEffect(() => {
		const onPopState = () => setPathname(window.location.pathname);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, []);

	const navigate = (path: string) => {
		window.history.pushState({}, '', path);
		setPathname(path);
	};

	const navItems = routes.map(route => ({
		...route,
		active: route.path === activeRoute.path,
		onClick: () => navigate(route.path),
	}));

	return {
		...model,
		activeRoute,
		navItems,
		Page,
	};
};
