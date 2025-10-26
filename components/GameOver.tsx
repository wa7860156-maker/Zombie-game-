
import React from 'react';

interface GameOverProps {
  text: string;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ text, onRestart }) => {
  return (
    <div className="text-center p-8 bg-black/50 border border-red-800 rounded-lg flex flex-col items-center animate-fade-in">
      <h2 className="text-4xl font-bold text-red-500 mb-4">YOU DIED</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-prose">{text}</p>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-red-700 text-white font-bold rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        TRY AGAIN
      </button>
    </div>
  );
};

export default GameOver;
