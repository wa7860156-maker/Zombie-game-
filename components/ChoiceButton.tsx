
import React from 'react';
import type { Choice } from '../types';

interface ChoiceButtonProps {
  choice: Choice;
  onChoose: (prompt: string) => void;
  disabled: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onChoose, disabled }) => {
  return (
    <button
      onClick={() => onChoose(choice.prompt)}
      disabled={disabled}
      className="w-full text-left p-4 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-red-900/50 hover:border-red-600 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <p className="text-gray-300">{choice.text}</p>
    </button>
  );
};

export default ChoiceButton;
