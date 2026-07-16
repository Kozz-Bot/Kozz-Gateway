import styled from '@emotion/styled';
import CodeMirror from '@uiw/react-codemirror';

export const Editor = styled(CodeMirror)`
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	overflow: hidden;
	font-size: 13px;
`;
