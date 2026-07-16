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
	min-width: 0;
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

export const Textarea = styled.textarea`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	padding: 9px 10px;
	min-height: 92px;
	resize: vertical;
`;

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	padding: 9px 12px;
	cursor: pointer;

	:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
`;

export const ActionRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const Status = styled.div`
	min-height: 20px;
	margin-top: 10px;
	color: ${props => props.theme.colors.success};
	font-size: 13px;
`;

export const SectionTitle = styled.div`
	font-weight: 700;
	margin: 14px 0 10px;
`;

export const MethodList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const MethodButton = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
	padding: 7px 9px;
	cursor: pointer;
	font-size: 12px;
`;

export const Timeline = styled.div`
	display: grid;
	gap: 10px;
`;

export const TimelineItem = styled.article<{ tone: string }>`
	background: ${props => props.theme.colors.background};
	border: 1px solid
		${props =>
			props.tone === 'error' ? props.theme.colors.danger : props.theme.colors.border};
	border-radius: 8px;
	padding: 12px;
	min-width: 0;
`;

export const TimelineMeta = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	color: ${props => props.theme.colors.textMuted};
	font-size: 12px;
	margin-bottom: 8px;
`;

export const TimelineBody = styled.div`
	font-size: 14px;
	line-height: 1.45;
	margin-bottom: 6px;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
`;

export const TimelineSubtitle = styled.div`
	color: ${props => props.theme.colors.textMuted};
	font-size: 12px;
	margin-bottom: 10px;
	overflow-wrap: anywhere;
`;

export const DetailsButton = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	padding: 7px 9px;
	cursor: pointer;
	font-size: 12px;
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
