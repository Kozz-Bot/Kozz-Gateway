import styled from '@emotion/styled';

export const Stack = styled.div`
	display: grid;
	gap: 14px;
`;

export const Presets = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const PresetButton = styled.button`
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 8px 10px;
	cursor: pointer;
`;
