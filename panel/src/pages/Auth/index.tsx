import { AppModel } from '@/App/behavior';
import { useAuthBehavior } from './behavior';
import * as S from './styles';

export const AuthPage = ({ model }: { model: AppModel }) => {
	const view = useAuthBehavior({ model });

	return (
		<S.Card>
			<S.Label>Current admin signature</S.Label>
			<S.Code>{view.signaturePreview}</S.Code>
			<S.Button onClick={view.clearSignature} type="button">
				Log out
			</S.Button>
		</S.Card>
	);
};
