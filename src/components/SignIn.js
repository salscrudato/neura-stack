// import React from 'react';
// import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { auth } from '../firebase';
// import styled from 'styled-components';

// const SignInContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;
//   background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
//   animation: fadeIn 1s ease-in;
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
// `;

// const LogoContainer = styled.div`
//   display: flex;
//   align-items: center;
//   margin-bottom: 5px;
// `;

// const Logo = styled.img`
//   height: 200px;
//   margin-right: 10px;
// `;

// const SignInButton = styled.button`
//   padding: 15px 30px;
//   background-color:rgb(27, 44, 108);
//   color: #ffffff;
//   border: none;
//   border-radius: 8px;
//   cursor: pointer;
//   font-size: 18px;
//   font-family: 'Orbitron', sans-serif;
//   box-shadow: 0 4px 10px :rgba(49, 65, 122, 0.6);
//   transition: background-color 0.3s ease, transform 0.2s ease;
//   &:hover {
//     background-color: #e65c00;
//     transform: scale(1.05);
//   }
// `;

// const SignInText = styled.p`
//   color: #ffffff;
//   font-size: 24px;
//   margin-bottom: 20px;
//   font-family: 'Orbitron', sans-serif;
//   text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
// `;

// const DisclaimerText = styled.p`
//   color: #aaa;
//   font-size: 14px;
//   margin-top: 10px;
//   text-align: center;
//   max-width: 300px;
// `;

// const BrandText = styled.p`
//   color: #aaa;
//   font-size: 16px;
//   margin-top: 4px;
//   text-align: center;
//   max-width: 400px;
// `;

// const SignIn = () => {
//   const signIn = () => {
//     const provider = new GoogleAuthProvider();
//     signInWithPopup(auth, provider)
//       .then((result) => {
//         // Signed in successfully
//       })
//       .catch((error) => {
//         console.error('Sign-in error:', error);
//       });
//   };

//   return (
//     <SignInContainer>
//       <LogoContainer>
//               <Logo src="/favicon.svg" alt="Logo" />
//             </LogoContainer>
//       {/* <SignInText>NeuraStack</SignInText> */}
//       <BrandText>
//        NeuraStack runs your prompt through three AI engines in parallel, distills their best outputs, and delivers one precise answer instantly—no hopping between apps or debating which result to trust. It’s engineered to save time, cut through noise, and let you act on reliable insight.
//       </BrandText>
//       <SignInButton onClick={signIn}>Sign in with Google</SignInButton>
//       {/* <DisclaimerText>
//         This app passes your prompts to multiple AI models and provides an optimized response for comparison purposes only. 
//       </DisclaimerText> */}
//     </SignInContainer>
//   );
// };

// export default SignIn;

import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import styled from 'styled-components';

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  animation: fadeIn 1s ease-in;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const Logo = styled.img`
  height: 200px;
  margin-right: 10px;
`;

const GoogleIcon = styled.img`
  width: 18px;
  height: 18px;
  margin-right: 12px;
`;

const SignInButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 10px;
  background-color: #fff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 22px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
  &:hover {
    background-color: #f7f7f7;
    box-shadow: 0 1px 2px rgba(60,64,67,0.3), 0 1px 3px rgba(60,64,67,0.15);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66,133,244,0.3);
  }
`;

const BrandText = styled.p`
  color: #aaa;
  font-size: 20px;
  margin-top: 40px;
  text-align: center;
  max-width: 400px;
  font-family: 'Orbitron', sans-serif;
`;

const SignIn = () => {
  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) =>
      console.error('Sign-in error:', error)
    );
  };

  return (
    <SignInContainer>
      <LogoContainer>
        <Logo src="/favicon.svg" alt="Logo" />
      </LogoContainer>
      <SignInButton onClick={signIn}>
        <GoogleIcon src="/google.svg" alt="Google logo" />
        Sign in with Google
      </SignInButton>
      <BrandText>
        NeuraStack runs your prompt through three AI engines in parallel, distills
        their best outputs, and delivers one precise answer instantly—no hopping
        between apps or debating which result to trust.
      </BrandText>
    </SignInContainer>
  );
};

export default SignIn;