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

export const Pill = styled.span`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	border-radius: 999px;
	padding: 5px 9px;
	font-size: 12px;
	color: ${props => props.theme.colors.textMuted};
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
