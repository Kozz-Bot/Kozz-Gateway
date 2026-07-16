import { ThemeMode } from '@/App/behavior';
import { useThemeToggleBehavior } from './behavior';
import * as S from './styles';

export const ThemeToggle = ({
	mode,
	onToggle,
}: {
	mode: ThemeMode;
	onToggle: () => void;
}) => {
	const view = useThemeToggleBehavior({ mode, onToggle });

	return (
		<S.Button onClick={view.onToggle} type="button">
			<view.Icon size={16} />
			<span>{view.label}</span>
		</S.Button>
	);
};
