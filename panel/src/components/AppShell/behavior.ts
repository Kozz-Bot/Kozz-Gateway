import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, History, KeyRound, Radio, Send, Settings } from 'lucide-react';
import { AppModel } from '@/App/behavior';
import { OverviewPage } from '@/pages/Overview';
import { EntitiesPage } from '@/pages/Entities';
import { ResourcesPage } from '@/pages/Resources';
import { DispatchPage } from '@/pages/Dispatch';
import { HistoryPage } from '@/pages/History';
import { AuthPage } from '@/pages/Auth';
import { SettingsPage } from '@/pages/Settings';

const publicBasePath = '/kozz/web';
const localBasePath = '/web';

const routes = [
	{ path: publicBasePath, label: 'Overview', icon: Activity, page: OverviewPage },
	{ path: `${publicBasePath}/entities`, label: 'Entities', icon: Radio, page: EntitiesPage },
	{ path: `${publicBasePath}/resources`, label: 'Resources', icon: Database, page: ResourcesPage },
	{ path: `${publicBasePath}/dispatch`, label: 'Dispatch', icon: Send, page: DispatchPage },
	{ path: `${publicBasePath}/history`, label: 'History', icon: History, page: HistoryPage },
	{ path: `${publicBasePath}/auth`, label: 'Auth', icon: KeyRound, page: AuthPage },
	{ path: `${publicBasePath}/settings`, label: 'Settings', icon: Settings, page: SettingsPage },
];

const normalizePathname = (pathname: string) => {
	const withoutTrailingSlash = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

	if (withoutTrailingSlash === localBasePath) {
		return publicBasePath;
	}

	if (withoutTrailingSlash.startsWith(`${localBasePath}/`)) {
		return `${publicBasePath}${withoutTrailingSlash.slice(localBasePath.length)}`;
	}

	return withoutTrailingSlash || publicBasePath;
};

export const useAppShellBehavior = (model: AppModel) => {
	const [pathname, setPathname] = useState(window.location.pathname);
	const normalizedPathname = normalizePathname(pathname);
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
