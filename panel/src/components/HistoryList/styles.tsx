import styled from '@emotion/styled';

export const Toolbar = styled.div`
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
`;

export const Input = styled.input`
	flex: 1;
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 9px 10px;
`;

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 9px 10px;
	cursor: pointer;

	:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
`;

export const List = styled.div`
	display: grid;
	gap: 10px;
`;

export const Item = styled.article`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 12px;
`;

export const Meta = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	color: ${props => props.theme.colors.textMuted};
	font-size: 12px;
	margin-bottom: 8px;
`;

export const Title = styled.div`
	font-weight: 700;
	margin-bottom: 8px;
`;

export const Pre = styled.pre`
	overflow: auto;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	margin: 0;
	background: ${props => props.theme.colors.codeBackground};
	border-radius: 6px;
	padding: 10px;
	font-size: 12px;
`;

export const Footer = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 14px;
`;
