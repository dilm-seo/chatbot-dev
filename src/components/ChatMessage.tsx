import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodePlayground } from './CodePlayground';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  // Fonction pour extraire le code des blocs de code
  const extractCodeBlock = (content: string) => {
    const match = content.match(/```(\w+)?\n([\s\S]+?)\n```/);
    return match ? { language: match[1] || 'javascript', code: match[2] } : null;
  };

  const codeBlock = extractCodeBlock(message.content);

  return (
    <div className={`flex gap-4 p-4 ${isBot ? 'bg-gray-800' : 'bg-gray-900'}`}>
      <div className="flex-shrink-0">
        {isBot ? (
          <Bot className="h-6 w-6 text-emerald-500" />
        ) : (
          <User className="h-6 w-6 text-blue-500" />
        )}
      </div>
      <div className="flex-grow prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
        
        {isBot && codeBlock && (
          <CodePlayground
            initialCode={codeBlock.code}
            language={codeBlock.language}
          />
        )}
      </div>
    </div>
  );
};