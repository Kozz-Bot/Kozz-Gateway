import styled from '@emotion/styled';

export const Grid = styled.div`
	display: grid;
	grid-template-columns: minmax(220px, 340px) minmax(0, 1fr);
	gap: 14px;

	@media (max-width: 900px) {
		grid-template-columns: 1fr;
	}
`;

export const Panel = styled.div`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 14px;
	box-shadow: ${props => props.theme.shadow};
`;

export const Field = styled.label`
	display: grid;
	gap: 6px;
	font-size: 13px;
	color: ${props => props.theme.colors.textMuted};
	margin-bottom: 12px;
`;

export const Input = styled.input`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 9px 10px;
`;

export const ErrorText = styled.div`
	color: ${props => props.theme.colors.danger};
	font-size: 13px;
	min-height: 20px;
	margin-top: 10px;
`;

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.primary};
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.primaryText};
	border-radius: 6px;
	padding: 9px 12px;
	cursor: pointer;
`;
