import styled from '@emotion/styled';

export const Stack = styled.div`
	display: grid;
	gap: 16px;
`;

export const ResourceList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const TemplateButton = styled.button<{ active: boolean }>`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props =>
		props.active ? props.theme.colors.surfaceMuted : props.theme.colors.surface};
	padding: 7px 9px;
	font-size: 12px;
	color: ${props => props.theme.colors.text};
	cursor: pointer;
`;

export const Pre = styled.pre`
	overflow: auto;
	margin: 0;
	background: ${props => props.theme.colors.codeBackground};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 12px;
	font-size: 12px;
`;
