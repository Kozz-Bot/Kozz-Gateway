import styled from '@emotion/styled';

export const Center = styled.div`
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 18px;
	background: ${props => props.theme.colors.background};
`;

export const ContentWrap = styled.div<{ active: boolean }>`
	display: ${props => (props.active ? 'block' : 'none')};
`;

export const LoginWrap = styled.div<{ active: boolean }>`
	display: ${props => (props.active ? 'block' : 'none')};
`;

export const Card = styled.div`
	width: min(620px, 100%);
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.border};
	border-radius: 8px;
	box-shadow: ${props => props.theme.shadow};
	padding: 22px;
`;

export const Title = styled.h1`
	font-size: 22px;
	margin: 0 0 8px;
`;

export const Text = styled.p`
	color: ${props => props.theme.colors.textMuted};
	margin: 0 0 16px;
	line-height: 1.5;
`;

export const TextArea = styled.textarea`
	width: 100%;
	min-height: 150px;
	resize: vertical;
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.codeBackground};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 10px;
	font-size: 13px;
`;

export const ErrorText = styled.div`
	color: ${props => props.theme.colors.danger};
	font-size: 13px;
	margin-top: 8px;
`;

export const Button = styled.button`
	margin-top: 14px;
	border: 1px solid ${props => props.theme.colors.primary};
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.primaryText};
	border-radius: 6px;
	padding: 9px 12px;
	cursor: pointer;
`;
