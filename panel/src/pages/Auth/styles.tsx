import styled from '@emotion/styled';

export const Card = styled.div`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 16px;
	display: grid;
	gap: 12px;
`;

export const Label = styled.div`
	color: ${props => props.theme.colors.textMuted};
	font-size: 13px;
`;

export const Code = styled.code`
	background: ${props => props.theme.colors.codeBackground};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 6px;
	padding: 8px;
	overflow-wrap: anywhere;
`;

export const Button = styled.button`
	width: max-content;
	border: 1px solid ${props => props.theme.colors.danger};
	background: transparent;
	color: ${props => props.theme.colors.danger};
	border-radius: 6px;
	padding: 8px 10px;
	cursor: pointer;
`;
