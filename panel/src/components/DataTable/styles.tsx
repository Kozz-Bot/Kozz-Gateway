import styled from '@emotion/styled';

export const Wrap = styled.div`
	overflow-x: auto;
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	border-radius: 8px;
`;

export const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;
`;

export const HeadCell = styled.th`
	text-align: left;
	color: ${props => props.theme.colors.textMuted};
	font-weight: 600;
	padding: 11px;
	border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const Cell = styled.td`
	padding: 11px;
	border-bottom: 1px solid ${props => props.theme.colors.border};
	white-space: nowrap;
`;
