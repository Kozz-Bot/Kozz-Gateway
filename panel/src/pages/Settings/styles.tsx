import styled from '@emotion/styled';

export const Stack = styled.div`
	display: grid;
	gap: 12px;
`;

export const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	padding: 14px;
`;

export const Label = styled.div`
	font-weight: 700;
`;

export const Detail = styled.div`
	color: ${props => props.theme.colors.textMuted};
	font-size: 13px;
	margin-top: 4px;
`;

export const Button = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surfaceMuted};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 8px 10px;
	cursor: pointer;
`;
