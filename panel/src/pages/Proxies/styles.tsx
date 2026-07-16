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

export const ProxyList = styled.div`
	display: grid;
	gap: 8px;
	max-height: 60vh;
	overflow: auto;
`;

export const ProxyButton = styled.button<{ active: boolean }>`
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

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	padding: 9px 12px;
	cursor: pointer;
`;

export const SectionTitle = styled.div`
	font-weight: 700;
	margin: 14px 0 10px;
`;

export const Timeline = styled.div`
	display: grid;
	gap: 10px;
`;

export const TimelineItem = styled.article`
	background: ${props => props.theme.colors.background};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 12px;
	min-width: 0;
`;

export const TimelineMeta = styled.div`
	color: ${props => props.theme.colors.textMuted};
	font-size: 12px;
	margin-bottom: 8px;
	overflow-wrap: anywhere;
`;

export const TimelineBody = styled.div`
	font-size: 14px;
	line-height: 1.45;
	margin-bottom: 10px;
	white-space: pre-wrap;
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
