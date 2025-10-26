import React, { useState, useCallback, useMemo } from 'react';
import { getInitialScene, getNextScene } from './services/gameService';
import type { GameState } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import ChoiceButton from './components/ChoiceButton';
import GameOver from './components/GameOver';
import PlayerStatus from './components/PlayerStatus';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialGameState = useMemo(() => ({
    story: '',
    choices: [],
    inventory: {},
    base: { location: 'Not established', fortification: 0 },
    isGameOver: false,
    gameOverText: '',
  }), []);


  const startGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialScene = await getInitialScene();
      setGameState({
        ...initialGameState,
        story: initialScene.story,
        choices: initialScene.choices,
        base: { location: 'Abandoned Warehouse', fortification: 0 },
      });
    } catch (err) {
      setError('Failed to start the game. The apocalypse will have to wait.');
      setGameState(null);
    } finally {
      setIsLoading(false);
    }
  }, [initialGameState]);

  const handleChoice = useCallback(async (prompt: string) => {
    if (!gameState) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getNextScene(prompt, gameState);

      setGameState(prev => {
        if (!prev) return null;

        const newInventory = { ...prev.inventory };
        if (result.inventoryChanges) {
          for (const [item, change] of Object.entries(result.inventoryChanges)) {
            newInventory[item] = (newInventory[item] || 0) + change;
            if (newInventory[item] <= 0) {
              delete newInventory[item];
            }
          }
        }

        const newBase = { ...prev.base, ...result.baseChanges };

        return {
          ...prev,
          story: result.story,
          choices: result.choices,
          isGameOver: result.isGameOver,
          gameOverText: result.gameOverText,
          inventory: newInventory,
          base: newBase,
        };
      });

    } catch (err) {
      setError('A mysterious force prevents you from acting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);


  const renderGameContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!gameState) {
      return null;
    }

    if (gameState.isGameOver) {
      return <GameOver text={gameState.gameOverText} onRestart={startGame} />;
    }

    return (
      <div className="w-full animate-fade-in space-y-8">
        <p className="text-lg leading-relaxed whitespace-pre-wrap text-red-100">{gameState.story}</p>
        <div className="space-y-4">
          {gameState.choices.map((choice, index) => (
            <ChoiceButton key={index} choice={choice} onChoose={handleChoice} disabled={isLoading} />
          ))}
        </div>
      </div>
    );
  };

  const hasGameStarted = gameState !== null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-zinc-900/50 border border-zinc-700 rounded-lg shadow-2xl shadow-black/50">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 tracking-wider">GEMINI ZOMBIE SURVIVAL</h1>
          <p className="text-zinc-400 mt-2">Scavenge. Craft. Survive.</p>
        </header>

        {hasGameStarted && gameState && !gameState.isGameOver && (
          <PlayerStatus inventory={gameState.inventory} base={gameState.base} />
        )}
        
        <div className="min-h-[300px] flex items-center justify-center">
          {!hasGameStarted ? (
            <div className="text-center animate-fade-in">
              <p className="my-4 text-zinc-300 text-lg">The city is dead. Your story is about to begin.</p>
              <button
                onClick={startGame}
                disabled={isLoading}
                className="px-8 py-3 bg-red-700 text-white font-bold rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-red-900"
              >
                {isLoading ? 'WAKING UP...' : 'BEGIN'}
              </button>
            </div>
          ) : (
            renderGameContent()
          )}
        </div>
      </main>
      <footer className="text-center mt-8 text-zinc-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
