import React, { useState, useEffect } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import { addDoc, collection } from 'firebase/firestore';
import orchestrator from '../services/orchestrator.js';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';

// Filter out non-DOM props to prevent React warnings
const shouldForwardProp = (prop) => !['isExpanded'].includes(prop);

const ChatInputContainer = styled.div.withConfig({ shouldForwardProp })`
  font-family: 'Inter', sans-serif;
  margin-top: 20px;
  background-color: #F5F5F5;
  padding: 10px 6px;
  width: 100%;
  
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
`;

const Form = styled.form.withConfig({ shouldForwardProp })`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputContainer = styled.div.withConfig({ shouldForwardProp })`
  position: relative;
  width: 100%;
`;

const TextArea = styled.textarea.withConfig({ shouldForwardProp })`
  padding: 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1F2937;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  resize: none;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  &:focus {
    border-color: #1D4ED8;
    box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.1);
  }
  &::placeholder {
    color: rgb(165, 166, 167);
  }
  /* Prevent zoom on mobile */
  @media (max-width: 768px) {
    font-size: 16px; /* Ensures iOS doesn't zoom */
    -webkit-text-size-adjust: 100%;
    touch-action: manipulation;
  }
`;

const DropdownContainer = styled.div.withConfig({ shouldForwardProp })`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding: 0 5px;
`;

const SelectWrapper = styled.div.withConfig({ shouldForwardProp })`
  position: relative;
  display: flex;
  align-items: center;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 0 10px;
  &:hover {
    background: #E5E7EB;
  }
`;

const Icon = styled.span.withConfig({ shouldForwardProp })`
  margin-right: 8px;
  font-size: 14px;
  color: #6B7280;
`;

const Select = styled.select.withConfig({ shouldForwardProp })`
  padding: 6px 10px 6px 0;
  font-size: 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1F2937;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  appearance: none;
  flex: 1;
  &:focus {
    outline: none;
    border-color: #1D4ED8;
  }
`;

const SendBtn = styled.button.withConfig({ shouldForwardProp })`
  margin-top: 10px;
  padding: 10px 20px;
  background: rgb(231, 231, 231);
  color: rgb(46, 46, 46);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  align-self: flex-end;
  transition: background-color 0.2s ease;
  &:hover {
    background: #0041C2;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingBox = styled.div.withConfig({ shouldForwardProp })`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const SpinnerSVG = styled.svg.withConfig({ shouldForwardProp })`
  width: 40px;
  height: 40px;
  animation: spin 1.5s linear infinite;
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div.withConfig({ shouldForwardProp })`
  margin-top: 10px;
  font-size: 12px;
  color: #6B7280;
`;

const Error = styled.div.withConfig({ shouldForwardProp })`
  margin-top: 10px;
  font-size: 14px;
  color: #DC2626;
`;

const AnswerBox = styled.div.withConfig({ shouldForwardProp })`
  margin-top: 20px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  position: relative;
  animation: glow 3s ease-in-out infinite;
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(10, 40, 122, 0.1); }
    50% { box-shadow: 0 0 15px rgba(161, 163, 168, 0.2); }
    100% { box-shadow: 0 0 5px rgba(44, 44, 44, 0.1); }
  }
`;

const DraftText = styled.div.withConfig({ shouldForwardProp })`
  font-size: 14px;
  line-height: 1.6;
  color: #1F2937;
`;

const ViewBtn = styled.button.withConfig({ shouldForwardProp })`
  margin-top: 10px;
  padding: 10px 20px;
  background: rgb(231, 231, 231);
  color: rgb(46, 46, 46);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  transition: background-color 0.2s ease;
  &:hover {
    background: #0041C2;
  }
`;

const Overlay = styled.div.withConfig({ shouldForwardProp })`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div.withConfig({ shouldForwardProp })`
  background: #ffffff;
  border-radius: 8px;
  width: 95%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
`;

const ModalHeader = styled.h2.withConfig({ shouldForwardProp })`
  font-size: 18px;
  font-weight: 600;
  color: rgb(32, 39, 48);
  margin-bottom: 20px;
`;

const AccordionSection = styled.div.withConfig({ shouldForwardProp })`
  margin-bottom: 10px;
  border-bottom: 1px solid #E5E7EB;
`;

const AccordionHeader = styled.div.withConfig({ shouldForwardProp })`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
`;

const AccordionContent = styled.div.withConfig({ shouldForwardProp })`
  padding: 10px 0;
  display: ${({ isExpanded }) => (isExpanded ? 'block' : 'none')};
`;

const ResponseHeader = styled.div.withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseHeader2 = styled.div.withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Logo = styled.img.withConfig({ shouldForwardProp })`
  width: 100%;
  height: 24px;
  margin-right: 10px;
`;

const Chevron = styled.span.withConfig({ shouldForwardProp })`
  font-size: 14px;
  color: #1F2937;
`;

const CloseButton = styled.button.withConfig({ shouldForwardProp })`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #E5E7EB;
  color: #000000;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  transition: background-color 0.2s ease;
  &:hover {
    background: #D1D5DB;
  }
`;

const NeurastackTitle = styled.h1`
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(90deg, #1D4ED8, #8B5CF6);
  -webkit-background-clip: text;
  color: transparent;
`;

const ChatInput = ({ userId, setResponse }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);
  const [show, setShow] = useState(false);
  const [persona, setPersona] = useState('');
  const [depth, setDepth] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    optimized: true,
    openAI: false,
    gemini: false,
  });

  useEffect(() => {
    // Prevent pinch zoom on mobile
    const preventZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventZoom, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErr('Prompt cannot be empty.');
      return;
    }
    setErr(null);
    setLoading(true);
    setMsg('Synthesizing optimized response…');
    console.log('Starting prompt submission...');
    try {
      let finalPrompt = prompt;
      if (persona || depth) {
        const instructions = `Please respond${persona ? ` as a ${persona}` : ''}${depth ? ` with a ${depth.toLowerCase()} response` : ''}.`;
        finalPrompt = `${prompt}\n\n${instructions}`;
      }

      console.log('Submitting prompt:', finalPrompt);
      let response;
      try {
        response = await orchestrator(finalPrompt);
        console.log('Orchestrator response:', response);
      } catch (orchestratorError) {
        console.error('Orchestrator error:', orchestratorError);
        throw new Error('Failed to process prompt with orchestrator: ' + orchestratorError.message);
      }

      const { flashDraft, turboDraft, finalAnswer, confidence } = response;

      let content = finalAnswer;
      if (typeof content !== 'string') {
        console.warn('finalAnswer is not a string:', content);
        content = String(content);
      }

      content = content.replace(/\{\s*"confidence":\s*[^}]+\}\s*$/, '').trim();

      if (!content) {
        throw new Error('No valid content received from orchestrator.');
      }

      const optimizedResponse = { content, confidence };
      const record = {
        prompt,
        flashDraft: flashDraft || '*No Gemini response available.*',
        turboDraft: turboDraft || '*No OpenAI response available.*',
        optimizedResponse,
        timestamp: Date.now(),
        persona: persona || null,
        depth: depth || null,
      };
      const docRef = await addDoc(collection(db, `users/${userId}/chats`), record);
      record.id = docRef.id;
      setResult(record);
      console.log('Set result:', record);
      if (setResponse) {
        setResponse(record);
      }
      setPrompt('');
    } catch (error) {
      console.error('Detailed error in handleSubmit:', {
        message: error.message,
        stack: error.stack,
        prompt,
        persona,
        depth
      });
      setErr('Error generating response: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Finished submission, loading:', false);
    }
  };

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ChatInputContainer>
        <Form onSubmit={handleSubmit}>
          <InputContainer>
            <TextArea 
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Type in your prompt here. The team will look into it and respond."
            />
          </InputContainer>
          <DropdownContainer>
            <SelectWrapper>
              <Icon>👤</Icon>
              <Select value={persona} onChange={e => setPersona(e.target.value)}>
                <option value="">Select persona</option>
                <option value="General Assistant">General Assistant</option>
                <option value="Creative Writer">Trip Planner</option>
                <option value="Technical Expert">Technology Expert</option>
                <option value="Educator">Teacher</option>
                <option value="Casual Chatter">Fitness Coach</option>
              </Select>
            </SelectWrapper>
            <SelectWrapper>
              <Icon>📏</Icon>
              <Select value={depth} onChange={e => setDepth(e.target.value)}>
                <option value="">Select depth</option>
                <option value="Concise">Concise</option>
                <option value="Average">Average</option>
                <option value="Comprehensive">Comprehensive</option>
              </Select>
            </SelectWrapper>
          </DropdownContainer>
          <SendBtn type="submit" disabled={isLoading}>Send</SendBtn>
          {isLoading && (
            <LoadingBox>
              <SpinnerSVG viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  strokeDasharray="25"
                  strokeDashoffset="25"
                  d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9"
                >
                  <animate attributeName="stroke-dashoffset" dur="1.5s" repeatCount="indefinite" from="25" to="0" />
                </path>
              </SpinnerSVG>
              <LoadingText>{msg}</LoadingText>
            </LoadingBox>
          )}
          {err && <Error>{err}</Error>}
        </Form>
        {result && (
          <AnswerBox>
            <NeurastackTitle>Agentic Response</NeurastackTitle>
            <DraftText>
              <ReactMarkdown>
                {result.optimizedResponse.content}
              </ReactMarkdown>
            </DraftText>
            <ViewBtn onClick={() => setShow(true)}>View Individual Responses</ViewBtn>
            {show && (
              <Overlay onClick={() => setShow(false)}>
                <Modal onClick={e => e.stopPropagation()}>
                  <ModalHeader>Neural Network Stack</ModalHeader>
                  <AccordionSection>
                    <AccordionHeader onClick={() => toggleSection('optimized')}>
                      <ResponseHeader2>
                        <Logo src="/grok.svg" alt="Grok" />
                      </ResponseHeader2>
                      <Chevron>{expandedSections.optimized ? '↑' : '↓'}</Chevron>
                    </AccordionHeader>
                    <AccordionContent isExpanded={expandedSections.optimized}>
                      <DraftText>
                        <ReactMarkdown>
                          {result.optimizedResponse.content || '*No optimized response available.*'}
                        </ReactMarkdown>
                      </DraftText>
                    </AccordionContent>
                  </AccordionSection>
                  <AccordionSection>
                    <AccordionHeader onClick={() => toggleSection('openAI')}>
                      <ResponseHeader>
                        <Logo src="/openai.svg" alt="OpenAI" />
                      </ResponseHeader>
                      <Chevron>{expandedSections.openAI ? '↑' : '↓'}</Chevron>
                    </AccordionHeader>
                    <AccordionContent isExpanded={expandedSections.openAI}>
                      <DraftText>
                        <ReactMarkdown>
                          {result.turboDraft || '*No OpenAI response available.*'}
                        </ReactMarkdown>
                      </DraftText>
                    </AccordionContent>
                  </AccordionSection>
                  <AccordionSection>
                    <AccordionHeader onClick={() => toggleSection('gemini')}>
                      <ResponseHeader>
                        <Logo src="/gemini.svg" alt="Gemini" />
                      </ResponseHeader>
                      <Chevron>{expandedSections.gemini ? '↑' : '↓'}</Chevron>
                    </AccordionHeader>
                    <AccordionContent isExpanded={expandedSections.gemini}>
                      <DraftText>
                        <ReactMarkdown>
                          {result.flashDraft || '*No Gemini response available.*'}
                        </ReactMarkdown>
                      </DraftText>
                    </AccordionContent>
                  </AccordionSection>
                  <CloseButton onClick={() => setShow(false)}>×</CloseButton>
                </Modal>
              </Overlay>
            )}
          </AnswerBox>
        )}
      </ChatInputContainer>
    </StyleSheetManager>
  );
};

export default ChatInput;