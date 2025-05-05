import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styled from 'styled-components';

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
  font-family: 'Inter', sans-serif;
  padding: 20px;
  overflow: hidden;
`;

const Logo = styled.img`
  height: 300px;
  margin-bottom: 20px;
  background: transparent;
`;

const BaseButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: 12px 0;
  margin: 10px 0;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(BaseButton)`
  background: #fff;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #ddd;
  &:hover {
    background: #f8f8f8;
  }
`;

const PhoneButton = styled(BaseButton)`
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  &:hover {
    background: #f8f8f8;
  }
`;

const BetaButton = styled(BaseButton)`
  background: #fff;
  color: #333;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  &:hover {
    background: #f8f8f8;
  }
`;

const LearnMoreButton = styled(BaseButton)`
  background: rgb(121, 121, 121)
  color: #333;
  border: 1px solid #ddd;
  &:hover {
    background:rgb(248, 248, 248);
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 900px;
  width: 90%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const PhoneModalContent = styled(ModalContent)`
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const Close = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #e0e0e0;
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const ensureUserDoc = async (uid) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { freePromptsUsed: 0, credits: 0 }, { merge: true });
  }
};

const SignIn = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState('enter_phone');
  const [recaptchaError, setRecaptchaError] = useState(null);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const initializeRecaptcha = () => {
    if (!document.getElementById('recaptcha-container')) {
      setRecaptchaError('reCAPTCHA container not found.');
      return;
    }
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
        },
        auth
      );
      setRecaptchaError(null);
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      setRecaptchaError('Failed to initialize reCAPTCHA. Please try again.');
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await ensureUserDoc(user.uid);
    } catch (err) {
      alert(`Google sign-in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBetaGuest = async () => {
    setLoading(true);
    try {
      const { user } = await signInAnonymously(auth);
      await ensureUserDoc(user.uid);
    } catch (err) {
      alert(`Beta access error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = () => {
    setShowPhoneModal(true);
    initializeRecaptcha();
  };

  const sendVerificationCode = async () => {
    if (!window.recaptchaVerifier) {
      setRecaptchaError('reCAPTCHA not initialized. Please try again.');
      return;
    }
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setStep('enter_code');
      setRecaptchaError(null);
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const verifyCode = async () => {
    try {
      await confirmationResult.confirm(verificationCode);
      setShowPhoneModal(false);
      await ensureUserDoc(auth.currentUser.uid);
    } catch (error) {
      console.error('Invalid verification code:', error);
      alert(`Invalid code: ${error.message}`);
    }
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneNumber('');
    setVerificationCode('');
    setStep('enter_phone');
    setConfirmationResult(null);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const howImg = process.env.PUBLIC_URL + '/how-it-works.png';

  return (
    <SignInContainer>
      <Logo src="/logo.svg" alt="NeuraStack logo" />

      <GoogleButton disabled={loading} onClick={handleGoogle}>
        <img src="/google.svg" alt="Google logo" style={{ width: 20 }} />
        Sign in with Google
      </GoogleButton>

      {/* <PhoneButton disabled={loading} onClick={handlePhoneSignIn}>
        Sign in with Phone
      </PhoneButton> */}

      <BetaButton disabled={loading} onClick={handleBetaGuest}>
        Continue as Guest
      </BetaButton>

      <LearnMoreButton onClick={() => setShowModal(true)}>
        How it works
      </LearnMoreButton>

      {showModal && (
        <Modal
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-labelledby="how-it-works-title"
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <img
              src={howImg}
              alt="How it works"
              style={{ width: '100%', display: 'block' }}
            />
            <Close onClick={() => setShowModal(false)}>×</Close>
          </ModalContent>
        </Modal>
      )}

      {showPhoneModal && (
        <Modal onClick={handleClosePhoneModal}>
          <PhoneModalContent onClick={(e) => e.stopPropagation()}>
            {step === 'enter_phone' ? (
              <>
                <ModalTitle>Enter Phone Number</ModalTitle>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  aria-label="Phone number"
                />
                {recaptchaError && (
                  <p style={{ color: '#dc3545', fontSize: '14px' }}>
                    {recaptchaError}
                  </p>
                )}
                <ModalButton onClick={sendVerificationCode}>
                  Send Code
                </ModalButton>
                <ModalButton onClick={handleClosePhoneModal}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalTitle>Enter Verification Code</ModalTitle>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6-digit code"
                  aria-label="Verification code"
                />
                <ModalButton onClick={verifyCode}>Verify</ModalButton>
                <ModalButton onClick={handleClosePhoneModal}>
                  Cancel
                </ModalButton>
              </>
            )}
          </PhoneModalContent>
        </Modal>
      )}

      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </SignInContainer>
  );
};

export default SignIn;