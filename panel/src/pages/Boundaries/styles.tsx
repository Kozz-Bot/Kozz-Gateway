import styled from '@emotion/styled';

export const Grid = styled.div`
	display: grid;
	grid-template-columns: minmax(260px, 380px) minmax(0, 1fr);
	gap: 14px;

	@media (max-width: 900px) {
		grid-template-columns: 1fr;
	}
`;

export const Main = styled.div`
	display: grid;
	gap: 14px;
`;

export const Panel = styled.div`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 14px;
`;

export const Field = styled.label`
	display: grid;
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

export const ChatList = styled.div`
	display: grid;
	gap: 8px;
	max-height: 70vh;
	overflow: auto;
`;

export const ChatButton = styled.button<{ active: boolean }>`
	display: grid;
	gap: 4px;
	text-align: left;
	border: 1px solid
		${props => (props.active ? props.theme.colors.primary : props.theme.colors.border)};
	background: ${props =>
		props.active ? props.theme.colors.surfaceMuted : props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	padding: 10px;
	cursor: pointer;

	span {
		color: ${props => props.theme.colors.textMuted};
		font-size: 12px;
		overflow-wrap: anywhere;
	}
`;

export const HeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	align-items: center;
	margin-bottom: 14px;
`;

export const Title = styled.div`
	font-size: 18px;
	font-weight: 700;
`;

export const Subtitle = styled.div`
	color: ${props => props.theme.colors.textMuted};
	font-size: 13px;
	margin-top: 4px;
	overflow-wrap: anywhere;
`;

export const Avatar = styled.img`
	width: 56px;
	height: 56px;
	object-fit: cover;
	border: 1px solid ${props => props.theme.colors.border};
`;

export const Textarea = styled.textarea`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	padding: 9px 10px;
	min-height: 96px;
	resize: vertical;
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

export const Status = styled.div`
	min-height: 20px;
	margin-top: 10px;
	color: ${props => props.theme.colors.success};
	font-size: 13px;
`;

export const SectionTitle = styled.div`
	font-weight: 700;
	margin-bottom: 10px;
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
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 12px;
	font-size: 12px;
`;
