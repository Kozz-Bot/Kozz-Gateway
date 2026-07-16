import styled from '@emotion/styled';

export const Shell = styled.div`
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	overflow: hidden;
	font-size: 13px;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	min-width: 0;

	.cm-editor {
		max-width: 100%;
	}

	.cm-scroller {
		overflow-x: hidden;
	}
`;
