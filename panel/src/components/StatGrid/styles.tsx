import styled from '@emotion/styled';

export const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	gap: 12px;
`;

export const Card = styled.div`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 14px;
	box-shadow: ${props => props.theme.shadow};
`;

export const Label = styled.div`
	font-size: 12px;
	color: ${props => props.theme.colors.textMuted};
	margin-bottom: 8px;
`;

export const Value = styled.div`
	font-size: 24px;
	font-weight: 700;
`;

export const Detail = styled.div`
	margin-top: 8px;
	font-size: 12px;
	color: ${props => props.theme.colors.textMuted};
`;
