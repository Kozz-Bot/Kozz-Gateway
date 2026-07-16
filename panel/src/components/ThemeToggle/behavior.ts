import { Moon, Sun } from 'lucide-react';
import { ThemeMode } from '@/App/behavior';

export const useThemeToggleBehavior = ({
	mode,
	onToggle,
}: {
	mode: ThemeMode;
	onToggle: () => void;
}) => ({
	Icon: mode === 'light' ? Moon : Sun,
	label: mode === 'light' ? 'Dark' : 'Light',
	onToggle,
});
