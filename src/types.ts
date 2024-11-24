export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Settings {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}