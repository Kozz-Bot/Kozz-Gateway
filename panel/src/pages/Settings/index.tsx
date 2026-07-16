import { AppModel } from '@/App/behavior';
import { useSettingsBehavior } from './behavior';
import * as S from './styles';

export const SettingsPage = ({ model }: { model: AppModel }) => {
	const view = useSettingsBehavior({ model });

	return (
		<S.Stack>
			<S.Row>
				<div>
					<S.Label>Theme</S.Label>
					<S.Detail>{view.themeMode}</S.Detail>
				</div>
				<S.Button onClick={view.toggleTheme} type="button">
					Toggle
				</S.Button>
			</S.Row>
			<S.Row>
				<div>
					<S.Label>Local history</S.Label>
					<S.Detail>{view.historyCount} entries stored in IndexedDB</S.Detail>
				</div>
				<S.Button onClick={view.flushHistory} type="button">
					Flush
				</S.Button>
			</S.Row>
		</S.Stack>
	);
};
