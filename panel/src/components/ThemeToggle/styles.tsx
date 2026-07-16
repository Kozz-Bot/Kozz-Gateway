import styled from '@emotion/styled';

export const Button = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 8px 10px;
	cursor: pointer;
	font-size: 14px;
`;
