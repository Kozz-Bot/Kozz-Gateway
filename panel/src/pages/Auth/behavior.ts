import { AppModel } from '@/App/behavior';

export const useAuthBehavior = ({ model }: { model: AppModel }) => ({
	clearSignature: model.auth.clearSignature,
	signaturePreview: `${model.auth.signature.slice(0, 24)}...`,
});
