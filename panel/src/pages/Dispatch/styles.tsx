import styled from '@emotion/styled';

export const Stack = styled.div`
	display: grid;
	gap: 14px;
`;

export const Presets = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const TemplateButton = styled.button<{ active: boolean }>`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props =>
		props.active ? props.theme.colors.surfaceMuted : props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	padding: 8px 10px;
	cursor: pointer;
`;
