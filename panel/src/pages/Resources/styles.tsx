import styled from '@emotion/styled';

export const Stack = styled.div`
	display: grid;
	gap: 16px;
`;

export const Grid = styled.div`
	display: grid;
	grid-template-columns: minmax(240px, 360px) minmax(0, 1fr);
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
`;

export const Field = styled.label<{ hidden?: boolean }>`
	display: ${props => (props.hidden ? 'none' : 'grid')};
	gap: 6px;
	font-size: 13px;
	color: ${props => props.theme.colors.textMuted};
	margin-bottom: 12px;
`;

export const Select = styled.select`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	padding: 9px 10px;
`;

export const Input = styled.input`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	padding: 9px 10px;
`;

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.primary};
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.primaryText};
	padding: 9px 12px;
	cursor: pointer;

	:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
`;

export const ErrorText = styled.div`
	color: ${props => props.theme.colors.danger};
	font-size: 13px;
	min-height: 20px;
	margin-top: 10px;
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
