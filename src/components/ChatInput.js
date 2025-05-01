import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import styled from 'styled-components';

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  background: #2a2a2a;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
`;

const TextArea = styled.textarea`
  padding: 15px;
  border: 2px solid #555;
  border-radius: 8px;
  font-size: 14px;
  background-color: #333;
  color: #ffffff;
  min-height: 120px;
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  font-family: 'Roboto', sans-serif;
  &::placeholder {
    color: #aaa;
  }
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
  }
`;

const SendButton = styled.button`
  width: 100px;
  height: 40px;
  background: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease, transform 0.2s ease;
  &:hover {
    background: #0056b3;
    transform: scale(1.05);
  }
  &:disabled {
    background: #555;
    color: #aaa;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  animation: pulse 1.5s infinite ease-in-out;
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid transparent;
    border-top-color: #007bff;
    animation: spin 1s linear infinite;
  }
  &::after {
    border-top-color: #00c4ff;
    animation-delay: 0.5s;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const LoadingText = styled.p`
  color: #ffffff;
  font-size: 14px;
  margin-top: 10px;
  font-family: 'Roboto', sans-serif;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 300px;
  background-color: #555;
  border-radius: 5px;
  height: 10px;
  margin-top: 10px;
`;

const Progress = styled.div`
  width: ${props => props.progress}%;
  background-color: #007bff;
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
`;

const ErrorMessage = styled.p`
  color: #ff0000;
  font-size: 14px;
  margin-top: 10px;
`;

const ChatInput = ({ userId, setResponse }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Getting first response...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setIsLoading(true);
    setLoadingMessage('Getting first response...');
    setProgress(0);
    setError(null);

    try {
      const userPrompt = prompt;

      setLoadingMessage('Fetching Grok response...');
      const grokResponse = await fetchGrok(userPrompt, 'grok-beta');
      setProgress(33);

      setLoadingMessage('Fetching OpenAI response...');
      const openaiResponse = await fetchOpenAI(userPrompt, 'gpt-4.1');
      setProgress(66);

      setLoadingMessage('Optimizing response...');
      const geminiPrompt = `Here is the user's original prompt: "${userPrompt}"

Here is the response from Grok: "${grokResponse.content}"

Here is the response from OpenAI: "${openaiResponse.content}"

Please review the original prompt and both responses, and provide an optimized final response.`;
      const geminiResponse = await fetchGemini(geminiPrompt);
      setProgress(100);

      const responseData = {
        prompt: userPrompt,
        grokResponse,
        openaiResponse,
        geminiResponse,
        timestamp: new Date(),
      };

      await addDoc(collection(db, `users/${userId}/chats`), responseData);

      setResponse(responseData);
      setPrompt('');
    } catch (error) {
      console.error('Error processing prompt:', error);
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  async function fetchGrok(prompt, model) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: "You are a helpful assistant." },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Grok API error: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    return data.choices[0].message;
  }

  async function fetchOpenAI(prompt, model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: "You are a helpful assistant." },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    return data.choices[0].message;
  }

  async function fetchGemini(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    return { content: data.candidates[0].content.parts[0].text };
  }

  return (
    <Form>
      <TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here. The app will send it to multiple AIs and provide an optimized response."
        rows={4}
      />
      <SendButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'Send'}
      </SendButton>
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>{loadingMessage}</LoadingText>
          <ProgressBar>
            <Progress progress={progress} />
          </ProgressBar>
        </LoadingContainer>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Form>
  );
};

export default ChatInput;