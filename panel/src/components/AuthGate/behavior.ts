import { ReactNode, useState } from 'react';
import { PanelAuth } from '@/App/behavior';
import { PanelSocket } from '@/lib/panelSocket';
import { signatureSchema } from '@/lib/schemas';

export const useAuthGateBehavior = ({
	auth,
	children,
}: {
	auth: PanelAuth;
	socket: PanelSocket;
	children: ReactNode;
}) => {
	const [value, setValue] = useState(auth.signature);
	const result = signatureSchema.safeParse(value.trim());
	const signedIn = Boolean(auth.signature);

	const submit = () => {
		if (result.success) {
			auth.setSignature(value);
		}
	};

	return {
		children,
		error: result.success ? '' : 'Paste a valid RSA signature to continue.',
		loginActive: !signedIn,
		onChange: setValue,
		submit,
		contentActive: signedIn,
		value,
	};
};
