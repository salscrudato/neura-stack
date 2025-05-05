import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

// Filter out non-DOM props to prevent React warnings
const shouldForwardProp = (prop) => !['isExpanded'].includes(prop);

const HistoryContainer = styled.div`
  font-family: 'Inter', sans-serif;
  color: #1F2937;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 15px;
  box-sizing: border-box;
`;

const RecentChatCard = styled.div`
  background: #ffffff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  width: 100%;
`;

const PromptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
`;

const PromptLabel = styled.span`
  font-weight: 600;
  color: #6B7280;
  font-size: 14px;
  margin-right: 5px;
`;

const PromptText = styled.span`
  color: #1F2937;
  font-size: 14px;
`;

const ToggleIcon = styled.span`
  font-size: 14px;
  color: #1F2937;
`;

const ResponseSnippet = styled.div`
  padding: 10px 0;
  display: ${props => (props.isExpanded ? 'block' : 'none')};
`;

const ResponseItem = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseText = styled.div`
  font-weight: normal;
  font-size: 14px;
  line-height: 1.6;
  color: #1F2937;
`;

const ViewDetailsButton = styled.button`
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

const CardHeader = styled.p`
  color: #6B7280;
  font-size: 14px;
  margin: 20px 0;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  &:hover {
    color: #1F2937;
  }
`;

const ChatItem = styled.div`
  padding: 15px;
  margin: 5px 0;
  background: #ffffff;
  color: #1F2937;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  border: 1px solid #E5E7EB;
  width: 100%;
  &:hover {
    background: #F9FAFB;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  color: #1F2937;
  padding: 20px;
  border-radius: 8px;
  width: 95%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
`;

const ModalPrompt = styled.div`
  margin-bottom: 20px;
`;

const ModalPromptLabel = styled.span`
  font-weight: 600;
  color: #6B7280;
`;

const ModalPromptText = styled.span`
  color: #1F2937;
`;

const ModalHeader = styled.h3`
  font-size: 18px;
  margin-bottom: 20px;
  color: rgb(32, 39, 48);
  font-weight: 600;
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

const ResponseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Logo = styled.img`
  width: 100%;
  height: 24px;
  margin-right: 10px;
`;

const Chevron = styled.span`
  font-size: 14px;
  color: #1F2937;
`;

const ResponseContent = styled.div.withConfig({ shouldForwardProp })`
  font-size: 14px;
  line-height: 1.6;
  color: #1F2937;
  font-family: 'Inter', sans-serif;
  margin-top: 8px;
  p {
    margin: 0 0 8px;
  }
  pre {
    background: #F9FAFB;
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
  }
  code {
    font-family: monospace;
    background: #F9FAFB;
    padding: 2px 4px;
    border-radius: 4px;
  }
  pre code {
    background: inherit;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin: 0 0 8px;
  }
  h1 { font-size: 1.4em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.2em; }
  h4 { font-size: 1.1em; }
  h5, h6 { font-size: 1em; }
  ul, ol {
    margin: 0 0 8px 20px;
  }
  li {
    margin-bottom: 4px;
  }
  blockquote {
    border-left: 3px solid #E5E7EB;
    padding-left: 10px;
    margin: 0 0 8px;
    color: #6B7280;
    font-style: italic;
  }
`;

const CloseButton = styled.button`
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

const ChatHistory = ({ userId, setUsageCount }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [expandedChats, setExpandedChats] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [expandedResponses, setExpandedResponses] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/chats`),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatData);
      if (setUsageCount) {
        setUsageCount(chatData.length);
      }
      // Initialize expanded states for responses
      const initialExpandedResponses = {};
      chatData.forEach(chat => {
        initialExpandedResponses[`${chat.id}-recent-optimized`] = false;
        initialExpandedResponses[`${chat.id}-recent-openai`] = false;
        initialExpandedResponses[`${chat.id}-recent-gemini`] = false;
        initialExpandedResponses[`${chat.id}-optimized`] = false;
        initialExpandedResponses[`${chat.id}-openai`] = false;
        initialExpandedResponses[`${chat.id}-gemini`] = false;
      });
      setExpandedResponses(initialExpandedResponses);
    });
    return () => unsubscribe();
  }, [userId, setUsageCount]);

  const handleToggleChat = (chatId) => {
    setExpandedChats((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

  const handleToggleResponse = (responseKey) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [responseKey]: !prev[responseKey],
    }));
  };

  const handleCloseModal = () => {
    setSelectedChat(null);
    // Reset modal expansions
    if (selectedChat) {
      setExpandedResponses((prev) => ({
        ...prev,
        [`${selectedChat.id}-optimized`]: false,
        [`${selectedChat.id}-openai`]: false,
        [`${selectedChat.id}-gemini`]: false,
      }));
    }
  };

  return (
    <HistoryContainer>
      {chats.slice(0, 3).map((chat) => (
        <RecentChatCard key={chat.id}>
          <AccordionSection>
            <PromptHeader onClick={() => handleToggleChat(chat.id)}>
              <div>
                <PromptLabel>Prompt: </PromptLabel>
                <PromptText>
                  {chat.prompt?.substring(0, 100) || chat.prompt}
                  {chat.prompt && chat.prompt.length > 100 ? '...' : ''}
                </PromptText>
              </div>
              <ToggleIcon>{expandedChats[chat.id] ? '↑' : '↓'}</ToggleIcon>
            </PromptHeader>
            <ResponseSnippet isExpanded={expandedChats[chat.id]}>
              <AccordionSection>
                <AccordionHeader onClick={() => handleToggleResponse(`${chat.id}-recent-optimized`)}>
                  <ResponseHeader>
                    <Logo src="/grok.svg" alt="Grok" />
                  </ResponseHeader>
                  <Chevron>{expandedResponses[`${chat.id}-recent-optimized`] ? '↑' : '↓'}</Chevron>
                </AccordionHeader>
                <AccordionContent isExpanded={expandedResponses[`${chat.id}-recent-optimized`]}>
                  <ResponseText>
                    <ReactMarkdown>
                      {chat.optimizedResponse?.content || '*No NeuraStack response available.*'}
                    </ReactMarkdown>
                  </ResponseText>
                </AccordionContent>
              </AccordionSection>

              <AccordionSection>
                <AccordionHeader onClick={() => handleToggleResponse(`${chat.id}-recent-openai`)}>
                  <ResponseHeader>
                    <Logo src="/openai.svg" alt="OpenAI" />
                  </ResponseHeader>
                  <Chevron>{expandedResponses[`${chat.id}-recent-openai`] ? '↑' : '↓'}</Chevron>
                </AccordionHeader>
                <AccordionContent isExpanded={expandedResponses[`${chat.id}-recent-openai`]}>
                  <ResponseText>
                    <ReactMarkdown>
                      {chat.turboDraft || '*No OpenAI response available.*'}
                    </ReactMarkdown>
                  </ResponseText>
                </AccordionContent>
              </AccordionSection>

              <AccordionSection>
                <AccordionHeader onClick={() => handleToggleResponse(`${chat.id}-recent-gemini`)}>
                  <ResponseHeader>
                    <Logo src="/gemini.svg" alt="Gemini" />
                  </ResponseHeader>
                  <Chevron>{expandedResponses[`${chat.id}-recent-gemini`] ? '↑' : '↓'}</Chevron>
                </AccordionHeader>
                <AccordionContent isExpanded={expandedResponses[`${chat.id}-recent-gemini`]}>
                  <ResponseText>
                    <ReactMarkdown>
                      {chat.flashDraft || '*No Gemini response available.*'}
                    </ReactMarkdown>
                  </ResponseText>
                </AccordionContent>
              </AccordionSection>

              <ViewDetailsButton onClick={() => setSelectedChat(chat)}>
                View Individual Responses
              </ViewDetailsButton>
            </ResponseSnippet>
          </AccordionSection>
        </RecentChatCard>
      ))}

      {chats.length > 3 && (
        <CardHeader onClick={() => setShowHistory(!showHistory)}>
          Older Chats {showHistory ? '↑' : '↓'}
        </CardHeader>
      )}
      {showHistory && chats.slice(3).map((chat) => (
        <ChatItem key={chat.id} onClick={() => setSelectedChat(chat)}>
          <PromptLabel>Prompt: </PromptLabel>
          <PromptText>
            {chat.prompt?.substring(0, 50) || chat.prompt}
            {chat.prompt && chat.prompt.length > 50 ? '...' : ''}
          </PromptText>
        </ChatItem>
      ))}

      {selectedChat && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalPrompt>
              <ModalPromptLabel>For prompt: </ModalPromptLabel>
              <ModalPromptText>{selectedChat.prompt}</ModalPromptText>
            </ModalPrompt>
            <ModalHeader>Neural Network Stack</ModalHeader>

            <AccordionSection>
              <AccordionHeader onClick={() => handleToggleResponse(`${selectedChat.id}-optimized`)}>
                <ResponseHeader>
                  <Logo src="/grok.svg" alt="Grok" />
                </ResponseHeader>
                <Chevron>{expandedResponses[`${selectedChat.id}-optimized`] ? '↑' : '↓'}</Chevron>
              </AccordionHeader>
              <AccordionContent isExpanded={expandedResponses[`${selectedChat.id}-optimized`]}>
                <ResponseContent>
                  <ReactMarkdown>
                    {selectedChat.optimizedResponse?.content || '*No NeuraStack response available.*'}
                  </ReactMarkdown>
                  {selectedChat.optimizedResponse?.confidence !== undefined && (
                    <p style={{ fontSize: '14px', color: '#6B7280', fontStyle: 'italic', marginTop: '4px' }}>
                      Confidence (beta): {selectedChat.optimizedResponse.confidence}
                    </p>
                  )}
                </ResponseContent>
              </AccordionContent>
            </AccordionSection>

            <AccordionSection>
              <AccordionHeader onClick={() => handleToggleResponse(`${selectedChat.id}-openai`)}>
                <ResponseHeader>
                  <Logo src="/openai.svg" alt="OpenAI" />
                </ResponseHeader>
                <Chevron>{expandedResponses[`${selectedChat.id}-openai`] ? '↑' : '↓'}</Chevron>
              </AccordionHeader>
              <AccordionContent isExpanded={expandedResponses[`${selectedChat.id}-openai`]}>
                <ResponseContent>
                  <ReactMarkdown>
                    {selectedChat.turboDraft || '*No OpenAI response available.*'}
                  </ReactMarkdown>
                </ResponseContent>
              </AccordionContent>
            </AccordionSection>

            <AccordionSection>
              <AccordionHeader onClick={() => handleToggleResponse(`${selectedChat.id}-gemini`)}>
                <ResponseHeader>
                  <Logo src="/gemini.svg" alt="Gemini" />
                </ResponseHeader>
                <Chevron>{expandedResponses[`${selectedChat.id}-gemini`] ? '↑' : '↓'}</Chevron>
              </AccordionHeader>
              <AccordionContent isExpanded={expandedResponses[`${selectedChat.id}-gemini`]}>
                <ResponseContent>
                  <ReactMarkdown>
                    {selectedChat.flashDraft || '*No Gemini response available.*'}
                  </ReactMarkdown>
                </ResponseContent>
              </AccordionContent>
            </AccordionSection>

            <CloseButton onClick={handleCloseModal}>×</CloseButton>
          </ModalContent>
        </Modal>
      )}
    </HistoryContainer>
  );
};

export default ChatHistory;