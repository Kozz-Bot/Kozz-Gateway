import styled from '@emotion/styled';

export const Layout = styled.div`
	min-height: 100vh;
	display: grid;
	grid-template-columns: 240px minmax(0, 1fr);
	background: ${props => props.theme.colors.background};

	@media (max-width: 820px) {
		grid-template-columns: 1fr;
	}
`;

export const Sidebar = styled.aside`
	border-right: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.surface};
	padding: 20px 14px;

	@media (max-width: 820px) {
		border-right: 0;
		border-bottom: 1px solid ${props => props.theme.colors.border};
		padding: 12px;
	}
`;

export const Brand = styled.div`
	font-size: 17px;
	font-weight: 700;
	margin: 0 0 18px;
`;

export const Nav = styled.nav`
	display: grid;
	gap: 4px;

	@media (max-width: 820px) {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		overflow-x: auto;
	}
`;

export const NavButton = styled.button<{ active: boolean }>`
	display: flex;
	align-items: center;
	gap: 9px;
	border: 1px solid
		${props => (props.active ? props.theme.colors.primary : 'transparent')};
	background: ${props =>
		props.active ? props.theme.colors.surfaceMuted : 'transparent'};
	color: ${props => props.theme.colors.text};
	border-radius: 6px;
	padding: 9px 10px;
	cursor: pointer;
	text-align: left;
	font-size: 14px;
`;

export const Main = styled.main`
	min-width: 0;
	padding: 22px;

	@media (max-width: 820px) {
		padding: 14px;
	}
`;

export const Header = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 18px;
`;

export const Title = styled.h1`
	font-size: 22px;
	margin: 0;
`;

export const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;
