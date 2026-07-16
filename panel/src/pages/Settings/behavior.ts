import { AppModel } from '@/App/behavior';

export const useSettingsBehavior = ({ model }: { model: AppModel }) => ({
	flushHistory: model.flushHistory,
	historyCount: model.history.length,
	themeMode: model.themeMode,
	toggleTheme: model.toggleTheme,
});
