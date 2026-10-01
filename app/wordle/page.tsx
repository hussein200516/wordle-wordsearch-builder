'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  words: { wordText?: string; text?: string }[];
}

export default function WordlePage() {
  const [targetWord, setTargetWord] = useState<string>('SPEECH');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  
  // Custom Settings
  const [activityTitle, setActivityTitle] = useState<string>('Phoneme Wordle Challenge');
  const [hideTarget, setHideTarget] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  const maxAttempts = 6;
  const wordLength = targetWord.length;

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data: Activity[] = await res.json();
        setSavedActivities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load activities', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== wordLength) {
        setFeedback(`Word must be exactly ${wordLength} letters long!`);
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setGameWon(true);
        setGameOver(true);
      } else if (newGuesses.length >= maxAttempts) {
        setGameOver(true);
      }
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key)) {
      if (currentGuess.length < wordLength) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [currentGuess, gameOver, guesses, targetWord, wordLength]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE') {
        handleKeyPress(key);
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const resetGame = (newWord?: string) => {
    const nextWord = (newWord || targetWord).toUpperCase().trim();
    setTargetWord(nextWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setFeedback(null);
  };

  const handleSaveActivity = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const cleanWord = targetWord.toUpperCase().trim();
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activityTitle,
          description: 'Phoneme Wordle Game created from UI',
          type: 'WORDLE',
          difficulty: 'MEDIUM',
          targetWord: cleanWord,
          words: [{ text: cleanWord }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Wordle activity');
      }

      setFeedback('Saved to database successfully!');
      await fetchActivities();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving to database';
      setFeedback(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getTileStyle = (letter: string, index: number, word: string) => {
    if (!targetWord.includes(letter)) {
      return 'bg-slate-700 border-slate-600 text-slate-200';
    }
    if (targetWord[index] === letter) {
      return 'bg-emerald-600 border-emerald-500 text-white font-bold';
    }
    return 'bg-amber-600 border-amber-500 text-white font-bold';
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Wordle Phoneme Activity</h1>
            <p className="text-slate-300 text-sm mt-1">
              Guess the hidden phoneme target word in {maxAttempts} attempts!
            </p>
          </div>
          <Link
            href="/"
            aria-label="Return to Dashboard Home"
            className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-sm rounded-lg text-slate-200 transition-colors focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          >
            ← Back Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Configuration Side Panel */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4 h-fit">
            <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
              Game Setup
            </h2>

            <div>
              <label htmlFor="activity-title-input" className="block text-sm font-semibold text-slate-200 mb-1">
                Activity Title
              </label>
              <input
                id="activity-title-input"
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                aria-label="Activity Title"
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-white outline-none text-sm focus:ring-2 focus:ring-cyan-400 mb-3"
              />

              <label htmlFor="target-word-input" className="block text-sm font-semibold text-slate-200 mb-1">
                Target Phoneme Word
              </label>
              <input
                id="target-word-input"
                type="text"
                value={targetWord}
                onChange={(e) => resetGame(e.target.value)}
                aria-label="Target Phoneme Word"
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-white outline-none text-sm uppercase focus:ring-2 focus:ring-cyan-400 mb-3"
              />

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-200">Hide Target Word</span>
                <button
                  type="button"
                  onClick={() => setHideTarget(!hideTarget)}
                  aria-label={hideTarget ? 'Reveal target word' : 'Hide target word'}
                  className="px-3 py-1 text-xs rounded bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 focus:ring-2 focus:ring-cyan-400"
                >
                  {hideTarget ? 'Hidden (ON)' : 'Visible (OFF)'}
                </button>
              </div>

              {!hideTarget && (
                <p className="text-xs text-amber-400 mb-3 font-mono">
                  Current Word: <strong>{targetWord}</strong>
                </p>
              )}

              <button
                type="button"
                onClick={handleSaveActivity}
                disabled={isSaving}
                aria-label="Save Activity to Database"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-3 rounded-md text-xs transition-colors mb-2 disabled:opacity-50 focus:ring-2 focus:ring-emerald-400"
              >
                {isSaving ? 'Saving...' : '💾 Save Activity to Database'}
              </button>

              {feedback && (
                <p className={`text-xs mt-2 text-center font-medium ${feedback.includes('Error') || feedback.includes('Failed') ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {feedback}
                </p>
              )}
            </div>

            {savedActivities.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Saved Database Games
                </h3>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {savedActivities
                    .filter((a) => a.words && a.words.length > 0)
                    .map((act) => (
                      <button
                        key={act.id}
                        onClick={() => {
                          const word = act.words[0]?.text || act.words[0]?.wordText;
                          if (word) {
                            setActivityTitle(act.title);
                            resetGame(word);
                          }
                        }}
                        aria-label={`Load activity ${act.title}`}
                        className="w-full text-left text-xs bg-slate-950 p-2 rounded border border-slate-800 hover:border-cyan-400 transition-colors text-slate-200 flex justify-between focus:ring-2 focus:ring-cyan-400"
                      >
                        <span className="truncate">{act.title}</span>
                        <span className="text-cyan-400 font-mono text-[10px]">
                          ({act.words[0]?.text || act.words[0]?.wordText || 'WORD'})
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Wordle Game Area */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-6 border-b border-slate-800 pb-3">
              <h2 className="text-xl font-semibold text-white">Interactive Board</h2>
              <button
                onClick={() => resetGame()}
                aria-label="Reset Game Board"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded transition-colors focus:ring-2 focus:ring-cyan-400"
              >
                Reset Game
              </button>
            </div>

            {/* Game Board Grid */}
            <div className="space-y-2 mb-6" aria-label="Wordle Game Grid">
              {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
                const isSubmitted = rowIndex < guesses.length;
                const isCurrent = rowIndex === guesses.length;
                const rowWord = isSubmitted
                  ? guesses[rowIndex]
                  : isCurrent
                  ? currentGuess.padEnd(wordLength, ' ')
                  : ' '.repeat(wordLength);

                return (
                  <div key={rowIndex} className="flex gap-2" aria-label={`Row ${rowIndex + 1}`}>
                    {Array.from({ length: wordLength }).map((_, colIndex) => {
                      const char = rowWord[colIndex] || '';
                      const style = isSubmitted
                        ? getTileStyle(char, colIndex, guesses[rowIndex])
                        : 'bg-slate-950 border-slate-800 text-white';

                      return (
                        <div
                          key={colIndex}
                          aria-label={`Row ${rowIndex + 1}, Letter ${colIndex + 1}: ${char.trim() || 'Empty'}`}
                          className={`w-10 h-10 md:w-12 md:h-12 border-2 flex items-center justify-center font-bold text-lg rounded uppercase transition-all ${style}`}
                        >
                          {char.trim()}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Game Status Feedback */}
            {gameOver && (
              <div className="mb-6 text-center">
                {gameWon ? (
                  <p className="text-emerald-400 font-bold text-lg animate-bounce">
                    🎉 Congratulations! You guessed the phoneme word!
                  </p>
                ) : (
                  <p className="text-rose-400 font-semibold text-sm">
                    Game Over! The target word was <span className="font-bold underline">{targetWord}</span>.
                  </p>
                )}
              </div>
            )}

            {/* On-Screen Virtual Keyboard */}
            <div className="w-full max-w-md space-y-1.5 pt-2" aria-label="Virtual Keypad">
              {keyboardRows.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1">
                  {row.map((key) => {
                    const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
                    return (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        aria-label={`Key ${key}`}
                        className={`font-semibold rounded text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                          isSpecial
                            ? 'px-2.5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700'
                            : 'w-8 h-10 md:w-9 md:h-10 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                      >
                        {key === 'BACKSPACE' ? '⌫' : key}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}