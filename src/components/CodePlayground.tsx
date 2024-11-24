import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Maximize2, Minimize2, Wand2 } from 'lucide-react';
import OpenAI from 'openai';

interface CodePlaygroundProps {
  initialCode: string;
  language: string;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  language,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const executeCode = useCallback(() => {
    setError(null);
    try {
      const sandbox = new Function(
        'console',
        `
        try {
          const log = [];
          ${code}
          return log;
        } catch (error) {
          throw error;
        }
      `
      );

      const fakeConsole = {
        log: (...args: any[]) => {
          return args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
        },
      };

      const result = sandbox(fakeConsole);
      setOutput(result.join('\n'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }, [code]);

  const fixCode = async () => {
    const apiKey = localStorage.getItem('chatSettings');
    if (!apiKey) {
      setError('Please set your OpenAI API key in settings first');
      return;
    }

    const settings = JSON.parse(apiKey);
    
    setIsFixing(true);
    setError(null);
    
    try {
      const openai = new OpenAI({
        apiKey: settings.apiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: 'You are a code review assistant. Fix the code and explain the changes made. Only return the corrected code without any explanation.',
          },
          {
            role: 'user',
            content: `Fix this ${language} code:\n\n${code}`,
          },
        ],
        temperature: 0.3,
      });

      const fixedCode = response.choices[0].message.content;
      if (fixedCode) {
        setCode(fixedCode.replace(/```\w*\n?|\n?```/g, '').trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fix code');
    } finally {
      setIsFixing(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50'
          : 'border border-gray-700 my-4'
      }`}
    >
      <div className="flex items-center justify-between p-2 bg-gray-800">
        <h3 className="text-sm font-medium text-gray-300">Playground</h3>
        <div className="flex gap-2">
          <button
            onClick={fixCode}
            disabled={isFixing}
            className="p-1.5 rounded bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
            title="Corriger le code"
          >
            <Wand2 className={`h-4 w-4 ${isFixing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={executeCode}
            className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            title="Exécuter le code"
          >
            <Play className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Réduire' : 'Agrandir'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className={`grid ${isFullscreen ? 'h-[calc(100%-48px)]' : 'h-[400px]'}`} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
          }}
        />
        <div className="border-l border-gray-700 bg-gray-900 p-4 font-mono text-sm overflow-auto">
          <h4 className="text-xs uppercase text-gray-500 mb-2">Sortie:</h4>
          {error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
};