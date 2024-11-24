import React from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import type { Settings } from '../types';

interface SettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onSettingsChange({
      ...settings,
      [name]: name === 'temperature' ? parseFloat(value) : value,
    });
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
      >
        <SettingsIcon className="h-5 w-5 text-gray-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  name="apiKey"
                  value={settings.apiKey}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Model
                </label>
                <select
                  name="model"
                  value={settings.model}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};