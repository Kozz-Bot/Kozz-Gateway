import { ThemeProvider } from '@emotion/react';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { useAppBehavior } from './behavior';
import { GlobalStyles } from './styles';

export const App = () => {
	const model = useAppBehavior();

	return (
		<ThemeProvider theme={model.theme}>
			<GlobalStyles theme={model.theme} />
			<AuthGate auth={model.auth} socket={model.socket}>
				<AppShell model={model} />
			</AuthGate>
		</ThemeProvider>
	);
};
