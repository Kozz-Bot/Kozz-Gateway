import { ThemeToggle } from '@/components/ThemeToggle';
import { AppModel } from '@/App/behavior';
import { useAppShellBehavior } from './behavior';
import * as S from './styles';

export const AppShell = ({ model }: { model: AppModel }) => {
	const view = useAppShellBehavior(model);

	return (
		<S.Layout>
			<S.Sidebar>
				<S.Brand>Kozz Gateway</S.Brand>
				<S.Nav>
					{view.navItems.map(item => (
						<S.NavButton key={item.path} active={item.active} onClick={item.onClick}>
							<item.icon size={16} />
							<span>{item.label}</span>
						</S.NavButton>
					))}
				</S.Nav>
			</S.Sidebar>
			<S.Main>
				<S.Header>
					<S.Title>{view.activeRoute.label}</S.Title>
					<S.HeaderActions>
						<ThemeToggle mode={view.themeMode} onToggle={view.toggleTheme} />
					</S.HeaderActions>
				</S.Header>
				<view.Page model={view} />
			</S.Main>
		</S.Layout>
	);
};
