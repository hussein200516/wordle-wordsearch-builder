'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WordItem {
  id?: string;
  wordText?: string;
  text?: string;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  type?: string;
  difficulty?: string;
  words: WordItem[];
}

const PHONEME_HELP = [
  { symbol: '/θ/', label: 'TH (thin)', words: ['THIN', 'THINK', 'MATH'] },
  { symbol: '/ʃ/', label: 'SH (shoe)', words: ['SHOE', 'FISH', 'WISH'] },
  { symbol: '/tʃ/', label: 'CH (chair)', words: ['CHAIR', 'CHIN', 'MATCH'] },
  { symbol: '/ŋ/', label: 'NG (sing)', words: ['SING', 'RING', 'LONG'] },
  { symbol: '/æ/', label: 'A (cat)', words: ['CAT', 'BAT', 'MAP'] },
];

function PhonemeHelper({
  onSelectPhoneme,
  currentInput,
}: {
  onSelectPhoneme: (words: string[]) => void;
  currentInput: string;
}) {
  const existingWords = currentInput
    .split(',')
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length > 0);

  return (
    <div className="flex flex-wrap gap-2 my-2" aria-label="Phoneme Reference List">
      {PHONEME_HELP.map((p) => {
        // Check if all preset words for this phoneme are currently in the textarea
        const isActive = p.words.every((w) => existingWords.includes(w));

        return (
          <button
            key={p.symbol}
            type="button"
            onClick={() => onSelectPhoneme(p.words)}
            title={isActive ? `Click to remove ${p.label} words` : `Click to add ${p.label} words`}
            className={`font-mono text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-950 text-cyan-400 border-slate-800 hover:border-cyan-400 hover:bg-slate-900'
            }`}
          >
            {p.symbol}
          </button>
        );
      })}
    </div>
  );
}

export default function WordSearchBuilderPage() {
  const [gridSize, setGridSize] = useState<number>(10);
  const [wordInput, setWordInput] = useState<string>('PHONEME, SPEECH, ARTICULATION, SOUND, VOICING');
  const [words, setWords] = useState<string[]>(['PHONEME', 'SPEECH', 'ARTICULATION', 'SOUND', 'VOICING']);
  const [grid, setGrid] = useState<string[][]>([]);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  const [activityTitle, setActivityTitle] = useState<string>('Phoneme Word Search');
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  // Toggles phoneme words: removes them if present, adds them if absent
  const handlePhonemeClick = (wordsToToggle: string[]) => {
    const existingWords = wordInput
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length > 0);

    // If all words are already present, remove them; otherwise add them
    const allPresent = wordsToToggle.every((w) => existingWords.includes(w));

    let updatedList: string[];
    if (allPresent) {
      updatedList = existingWords.filter((w) => !wordsToToggle.includes(w));
    } else {
      updatedList = Array.from(new Set([...existingWords, ...wordsToToggle]));
    }

    setWordInput(updatedList.join(', '));
  };

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    setFeedback(null);

    const formattedWords = wordInput
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length > 0)
      .map((str) => ({ text: str, wordText: str }));

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activityTitle,
          description: 'Custom Phoneme Word Search activity created from UI',
          type: 'WORD_SEARCH',
          difficulty: 'EASY',
          words: formattedWords,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save activity');
      }

      setFeedback('Saved to database successfully!');
      await fetchActivities();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setFeedback(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateWordSearch = () => {
    const list = wordInput
      .split(',')
      .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter((w) => w.length > 0 && w.length <= gridSize);

    setWords(list);
    setSelectedCells([]);

    let newGrid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(''));

    const directions = [
      { r: 0, c: 1 },
      { r: 1, c: 0 },
    ];

    list.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 150) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const maxRow = gridSize - (dir.r === 1 ? word.length : 1);
        const maxCol = gridSize - (dir.c === 1 ? word.length : 1);

        if (maxRow < 0 || maxCol < 0) continue;

        const startRow = Math.floor(Math.random() * (maxRow + 1));
        const startCol = Math.floor(Math.random() * (maxCol + 1));

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = startRow + i * dir.r;
          const c = startCol + i * dir.c;
          if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = startRow + i * dir.r;
            const c = startCol + i * dir.c;
            newGrid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setIsGenerated(true);
  };

  const toggleCell = (cellKey: string) => {
    setSelectedCells((prev) =>
      prev.includes(cellKey) ? prev.filter((k) => k !== cellKey) : [...prev, cellKey]
    );
  };

  const handleExportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activityTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px; background: #0f172a; color: white; }
    h1 { color: #22d3ee; }
    .grid { display: inline-grid; grid-template-columns: repeat(${gridSize}, 38px); gap: 4px; margin: 20px auto; }
    .cell { width: 38px; height: 38px; background: #1e293b; border: 1px solid #334155; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 6px; color: white; font-size: 16px; cursor: pointer; transition: all 0.2s; }
    .cell:hover { border-color: #38bdf8; }
    .cell.selected { background: #06b6d4; color: #020617; border-color: #22d3ee; transform: scale(1.05); }
    .word-list { margin-top: 24px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .word { background: #334155; color: #38bdf8; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${activityTitle}</h1>
  <p>Click or tap letters to highlight and solve target words!</p>
  <div class="grid">
    ${grid.map((row, r) => row.map((cell, c) => `<button class="cell" onclick="this.classList.toggle('selected')" aria-label="Letter ${cell} at row${r + 1}, column ${c + 1}">${cell}</button>`).join('')).join('')}
  </div>
  <div class="word-list">
    ${words.map((w) => `<span class="word">${w}</span>`).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activityTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-cyan-400">Word Search Builder</h1>
        <Link 
          href="/" 
          className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-sm rounded-lg text-slate-300 transition-colors"
        >
          ← Back Home
        </Link>
      </div>
      
      <p className="text-slate-300 mb-2">
        Configure target phoneme words, generate interactive previews, and export playable HTML games.
      </p>

      {/* Interactive Phoneme Buttons with Active State & Toggle */}
      <PhonemeHelper onSelectPhoneme={handlePhonemeClick} currentInput={wordInput} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {/* Configuration Panel */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg space-y-5 h-fit">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">Configuration</h2>
          
          <div>
            <label htmlFor="ws-activity-title" className="block text-sm font-medium text-slate-300 mb-1">
              Activity Title
            </label>
            <input
              id="ws-activity-title"
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white outline-none text-sm focus:ring-2 focus:ring-cyan-400 mb-3"
            />

            <label htmlFor="ws-target-words" className="block text-sm font-medium text-slate-300 mb-2">
              Target Words (comma-separated)
            </label>
            <textarea
              id="ws-target-words"
              rows={4}
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white outline-none text-sm focus:ring-2 focus:ring-cyan-400 mb-3"
            />

            <button
              type="button"
              onClick={handleSaveToBackend}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-md text-xs transition-colors mb-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : '💾 Save Activity to Database'}
            </button>
            {feedback && <p className="text-xs text-cyan-400 mb-2 text-center">{feedback}</p>}
          </div>

          <div>
            <label htmlFor="ws-grid-size" className="block text-sm font-medium text-slate-300 mb-2">
              Grid Size: {gridSize} x {gridSize}
            </label>
            <input
              id="ws-grid-size"
              type="range"
              min="8"
              max="15"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <button
            onClick={generateWordSearch}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Generate Puzzle
          </button>

          {isGenerated && (
            <button
              onClick={handleExportHTML}
              className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-500 text-cyan-300 font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Download Playable HTML
            </button>
          )}

          {savedActivities.length > 0 && (
            <div className="pt-4 border-t border-slate-700">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Saved Games in Database
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {savedActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      if (act.words && act.words.length > 0) {
                        setWordInput(
                          act.words.map((w) => w.wordText || w.text || '').join(', ')
                        );
                        setActivityTitle(act.title);
                      }
                    }}
                    className="w-full text-left text-xs bg-slate-900 p-2 rounded border border-slate-700 hover:border-cyan-400 transition-colors flex justify-between cursor-pointer"
                  >
                    <span className="truncate text-white">{act.title}</span>
                    <span className="text-slate-400 font-mono text-[10px]">({act.words?.length || 0} words)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Preview Section */}
        <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col items-center">
          <div className="flex justify-between items-center w-full border-b border-slate-700 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-white">Puzzle Preview</h2>
            {selectedCells.length > 0 && (
              <button
                onClick={() => setSelectedCells([])}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded cursor-pointer"
              >
                Clear Highlights
              </button>
            )}
          </div>

          {isGenerated ? (
            <div className="flex flex-col items-center space-y-6 w-full">
              <p className="text-xs text-slate-400">Click or tap any letter below to highlight standard words!</p>

              {/* Interactive Grid */}
              <div
                className="grid gap-1.5 bg-slate-900 p-4 rounded-lg border border-slate-700 overflow-auto max-w-full"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, rIdx) =>
                  row.map((letter, cIdx) => {
                    const key = `${rIdx}-${cIdx}`;
                    const isSelected = selectedCells.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCell(key)}
                        aria-label={`Letter ${letter} at row ${rIdx + 1}, column ${cIdx + 1}`}
                        className={`w-8 h-8 md:w-9 md:h-9 font-mono font-bold flex items-center justify-center rounded text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 select-none cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-800 border border-slate-700 text-white hover:border-slate-500'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Target Words List */}
              <div className="w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Target Phoneme Words
                </h3>
                <div className="flex flex-wrap gap-2">
                  {words.map((w, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-cyan-400 border border-slate-700 px-3 py-1 rounded text-xs font-semibold"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-20">
              Click <strong className="text-slate-200">"Generate Puzzle"</strong> to preview your interactive word search grid!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}