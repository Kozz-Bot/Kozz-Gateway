import { ReactNode } from 'react';
import { PanelAuth } from '@/App/behavior';
import { PanelSocket } from '@/lib/panelSocket';
import { useAuthGateBehavior } from './behavior';
import * as S from './styles';

export const AuthGate = ({
	auth,
	socket,
	children,
}: {
	auth: PanelAuth;
	socket: PanelSocket;
	children: ReactNode;
}) => {
	const view = useAuthGateBehavior({ auth, socket, children });

	return (
		<>
			<S.ContentWrap active={view.contentActive}>{view.children}</S.ContentWrap>
			<S.LoginWrap active={view.loginActive}>
				<S.Center>
					<S.Card>
						<S.Title>Gateway Panel Authentication</S.Title>
						<S.Text>
							Generate an admin signature with npm run panel:sign and paste the
							signature value here.
						</S.Text>
						<S.TextArea value={view.value} onChange={event => view.onChange(event.target.value)} />
						<S.ErrorText>{view.error}</S.ErrorText>
						<S.Button onClick={view.submit} type="button">
							Connect panel
						</S.Button>
					</S.Card>
				</S.Center>
			</S.LoginWrap>
		</>
	);
};
