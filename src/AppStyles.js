import styled from 'styled-components';

export const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 5px;
  font-family: ${props => props.theme.fonts.main};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  min-height: 100vh;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: transparent;
`;

export const Logo = styled.img`
  height: 60px;
  margin-right: 10px;
  background: transparent;
`;

export const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #00b7ff, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const ProfileContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

export const ProfileIcon = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.buttonBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: ${props => props.theme.colors.buttonHover};
  }
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: #fff;
  border-radius: ${props => props.theme.radii.small};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

export const DropdownItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  padding: 10px 20px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-family: ${props => props.theme.fonts.main};
  &:hover {
    background: ${props => props.theme.colors.buttonBackground};
  }
`;

export const UsageText = styled.div`
  position: absolute;
  top: 20px;
  right: 70px;
  color: ${props => props.theme.colors.secondaryText};
  font-size: 12px;
  font-family: ${props => props.theme.fonts.main};
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
`;

export const DividerLine = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const DividerText = styled.span`
  font-family: ${props => props.theme.fonts.main};
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.secondaryText};
  padding: 0 15px;
`;