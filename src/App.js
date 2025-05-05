import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import SignIn from './components/SignIn';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import styled, { StyleSheetManager } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import { signOut } from 'firebase/auth';

const AppContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 0px;
  padding-top: 25px;
  font-family: 'Inter', sans-serif;
  background-color: #F5F5F5;
  color: #1F2937;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  margin-left: 10px;
  background: transparent;
`;

const Logo = styled.img`
  height: 60px;
  margin-right: 10px;
  background: transparent !important;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(90deg,rgb(51, 104, 250),rgb(102, 65, 188));
  -webkit-background-clip: text;
  color: transparent;
`;

const ProfileContainer = styled.div`
  position: absolute;
  top: 35px;
  right: 20px;
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #D1D5DB;
  }
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ProfileInitials = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
`;

const Dropdown = styled.div`
  position: absolute;
  width: 125px;
  top: 50px;
  right: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  color: #1F2937;
  padding: 10px 8px;
  margin: auto;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  &:hover {
    background: #E5E7EB;
  }
`;

const UsageText = styled.div`
  position: absolute;
  top: 50px;
  right: 75px;
  color: #6B7280;
  font-size: 10px;
  font-family: 'Inter', sans-serif;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const DividerLine = styled.hr`
  flex: 1;
  border: none;
  border-top: 1px solid #E5E7EB;
`;

const DividerText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  padding: 0 15px;
`;

const shouldForwardProp = (prop) => prop !== 'isOpen';

function App() {
  const [user, setUser] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [, setResponse] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'signed in' : 'signed out');
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    console.log('Signing out...');
    signOut(auth)
      .then(() => {
        console.log('Signed out successfully');
        setIsDropdownOpen(false);
      })
      .catch((error) => {
        console.error('Sign-out error:', error);
      });
  };

  const handleSignIn = () => {
    setIsDropdownOpen(false);
  };

  const getInitials = (user) => {
    if (!user) return '';
    if (user.displayName) {
      const names = user.displayName.split(' ');
      return names.map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '';
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {user ? (
          <>
            <ProfileContainer>
              <ProfileIcon onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Profile options">
                {user.photoURL ? (
                  <img src={user.photoURL || '/default-profile.png'} alt="Profile" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <ProfileInitials>{getInitials(user)}</ProfileInitials>
                )}
              </ProfileIcon>
              <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                <Dropdown isOpen={isDropdownOpen}>
                  <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
                  <DropdownItem onClick={handleSignIn}>Sign In</DropdownItem>
                </Dropdown>
              </StyleSheetManager>
            </ProfileContainer>
            <UsageText>Prompts Used: {usageCount}</UsageText>
            <LogoContainer>
              <Logo src="/web-app-manifest-512x512.png" alt="Logo" />
              <Title>Neurastack</Title>
            </LogoContainer>
            <ChatInput userId={user.uid} setResponse={setResponse} />
            <Divider>
              <DividerLine />
              <DividerText>Chat History Below</DividerText>
              <DividerLine />
            </Divider>
            <ChatHistory userId={user.uid} setUsageCount={setUsageCount} />
          </>
        ) : (
          <SignIn />
        )}
      </AppContainer>
    </>
  );
}

export default App;