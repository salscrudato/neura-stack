import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import SignIn from './components/SignIn';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import styled from 'styled-components';
import GlobalStyle from './GlobalStyle';
import { signOut } from 'firebase/auth';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Orbitron', sans-serif;
  background-color: #121212;
  color: #ffffff;
  position: relative;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Logo = styled.img`
  height: 50px;
  margin-right: 10px;
`;

const Subtitle = styled.span`
  font-size: 1rem;
  color: #aaa;
`;

const ProfileContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const ProfileIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: #333;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  color: #fff;
  padding: 10px 20px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #444;
  }
`;

const UsageText = styled.div`
  position: absolute;
  top: 20px;
  right: 70px;
  color: #fff;
  font-size: 14px;
`;

function App() {
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    // Sign-in is handled by SignIn component when user is null
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {user ? (
          <>
            <ProfileContainer>
              <ProfileIcon onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Profile options">
                <img src={user.photoURL || '/default-profile.png'} alt="Profile" />
              </ProfileIcon>
              <Dropdown isOpen={isDropdownOpen}>
                <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
                <DropdownItem onClick={handleSignIn}>Sign In</DropdownItem>
              </Dropdown>
            </ProfileContainer>
            <UsageText>Usage: {usageCount} prompts</UsageText>
            <LogoContainer>
              <Logo src="/favicon.svg" alt="Logo" />
            </LogoContainer>
            <ChatInput userId={user.uid} setResponse={setResponse} />
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