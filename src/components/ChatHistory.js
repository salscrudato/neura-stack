import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

// Styled Components
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
  color: #333;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: #333;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  transition: background 0.2s ease;
  &:hover {
    background: #ddd;
  }
`;

const Logo = styled.img`
  width: 75px;
  height: 24px;
  object-fit: contain;
`;

const ResponseHeader = styled.h3`
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 10px;
  color: rgb(47, 67, 89);
  gap: 8px;
`;

const ModalHeader = styled.h3`
  font-size: 16px;
  margin-bottom: 20px;
  color: rgb(42, 92, 146);
`;

const ChatItem = styled.div`
  padding: 10px;
  margin: 5px 0;
  background: #222;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #333;
  }
`;

const CardHeader = styled.p`
  color: rgb(206, 206, 206);
  font-size: 16px;
  margin-top: 10px;
  margin-bottom: 25px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;

const RecentChatCard = styled.div`
  background: #333;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  color: #fff;
`;

const PromptLabel = styled.span`
  font-weight: bold;
  color: #fff;
  font-size: 14px;
`;

const PromptText = styled.span`
  color: #ccc;
  font-size: 14px;
`;

const ResponseSnippet = styled.p`
  color: #ccc;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const BoldOverride = styled.p`
  font-weight: normal;
`;

const ViewDetailsButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const PromptDisplay = styled.div`
  margin-bottom: 20px;
`;

const ModalPromptLabel = styled.span`
  font-weight: bold;
  color: #333;
`;

const ModalPromptText = styled.span`
  color: #666;
`;

const ChatHistory = ({ userId, setUsageCount }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch chat history from Firestore
  useEffect(() => {
    const q = query(collection(db, `users/${userId}/chats`), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(chatData);
      if (setUsageCount) {
        setUsageCount(chatData.length);
      }
    });
    return () => unsubscribe();
  }, [userId, setUsageCount]);

  // Handle closing the modal
  const handleCloseModal = () => {
    setSelectedChat(null);
  };

  return (
    <div>
      {chats.slice(0, 3).map((chat) => (
        <RecentChatCard key={chat.id}>
          <p><PromptLabel>Prompt: </PromptLabel><PromptText>{chat.prompt}</PromptText></p>
          <ResponseSnippet>Grok: <BoldOverride>{chat.grokResponse.content.substring(0, 100)}...</BoldOverride></ResponseSnippet>
          <ResponseSnippet>OpenAI: <BoldOverride>{chat.openaiResponse.content.substring(0, 100)}...</BoldOverride></ResponseSnippet>
          <ResponseSnippet>OpenAI: <BoldOverride>{chat.geminiResponse.content.substring(0, 100)}...</BoldOverride></ResponseSnippet>
          <ViewDetailsButton onClick={() => setSelectedChat(chat)}>View Details</ViewDetailsButton>
        </RecentChatCard>
      ))}
      <CardHeader onClick={() => setShowHistory(!showHistory)}>
        Older Chats {showHistory ? '▲' : '▼'}
      </CardHeader>
      {showHistory && chats.slice(3).map((chat) => (
        <ChatItem key={chat.id} onClick={() => setSelectedChat(chat)}>
          <PromptLabel>Prompt: </PromptLabel>
          <PromptText>{chat.prompt.substring(0, 50)}...</PromptText>
        </ChatItem>
      ))}

      {/* Modal for Selected Chat */}
      {selectedChat && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <PromptDisplay>
              <ModalPromptLabel>For prompt: </ModalPromptLabel>
              <ModalPromptText>{selectedChat.prompt}</ModalPromptText>
            </PromptDisplay>
            <ModalHeader>Individual Responses</ModalHeader>

            <div>
              <ResponseHeader>
                <Logo src="/grok.svg" alt="Grok Logo" />
              </ResponseHeader>
              <ReactMarkdown>{selectedChat.grokResponse?.content}</ReactMarkdown>
            </div>

            <div>
              <ResponseHeader>
                <Logo src="/openai.svg" alt="OpenAI Logo" />
              </ResponseHeader>
              <ReactMarkdown>{selectedChat.openaiResponse?.content}</ReactMarkdown>
            </div>

            <div>
              <ResponseHeader>
                <Logo src="/gemini.svg" alt="Gemini Logo" />
              </ResponseHeader>
              <ReactMarkdown>{selectedChat.geminiResponse?.content}</ReactMarkdown>
            </div>

            <CloseButton onClick={handleCloseModal}>×</CloseButton>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ChatHistory;