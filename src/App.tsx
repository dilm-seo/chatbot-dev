import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Settings } from './components/Settings';
import { CostNotification } from './components/CostNotification';
import { PlayLoader } from './components/PlayLoader';
import type { Message, Settings as SettingsType, ChatState } from './types';
import { Terminal } from 'lucide-react';
import { estimateTokens, calculateCost } from './utils/openaiCost';

const DEFAULT_SETTINGS: SettingsType = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
};

const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: 'You are a helpful AI assistant specialized in software development, programming, and technical topics. Provide clear, concise, and accurate responses with code examples when relevant.',
};

function App() {
  const [settings, setSettings] = useState<SettingsType>(() => {
    const saved = localStorage.getItem('chatSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const [lastCost, setLastCost] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const handleSend = async (content: string) => {
    if (!settings.apiKey) {
      setChatState(prev => ({
        ...prev,
        error: 'Please set your OpenAI API key in settings',
      }));
      setIsSettingsOpen(true);
      return;
    }

    const openai = new OpenAI({
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true,
    });

    const newMessage: Message = { role: 'user', content };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const allMessages = [SYSTEM_MESSAGE, ...chatState.messages, newMessage];
      const inputTokens = allMessages.reduce(
        (acc, msg) => acc + estimateTokens(msg.content),
        0
      );

      const response = await openai.chat.completions.create({
        model: settings.model,
        messages: allMessages,
        temperature: settings.temperature,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.choices[0].message.content || '',
      };

      const outputTokens = estimateTokens(assistantMessage.content);
      const cost = calculateCost(settings.model, inputTokens, outputTokens);
      setLastCost(cost);

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-3">
          <Terminal className="h-6 w-6 text-emerald-500" />
          <h1 className="text-xl font-bold">DevChat AI</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-4xl p-4 flex flex-col">
        {chatState.messages.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
              <p className="text-lg">Start a conversation with your AI development assistant</p>
            </div>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-4 mb-4">
            {chatState.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {chatState.isLoading && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <PlayLoader />
              </div>
            )}
            {chatState.error && (
              <div className="p-4 text-red-400 bg-red-900/20 rounded-lg">
                Error: {chatState.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={chatState.isLoading} />
      </main>

      <Settings
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={isSettingsOpen}
        onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      <CostNotification
        cost={lastCost}
        onClose={() => setLastCost(null)}
      />
    </div>
  );
}

export default App;