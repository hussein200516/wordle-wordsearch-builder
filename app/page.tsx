import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">Wordle and Wordsearch Builder</h1>
      <p className="text-slate-400 mb-8 max-w-md text-center">
        Select a tool below to build interactive learning activities or view the performance metrics.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link
          href="/wordle"
          className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-400 transition-colors text-center"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Wordle Builder</h2>
          <p className="text-xs text-slate-400">Configure the target words and phonemes</p>
        </Link>

        <Link
          href="/wordsearch"
          className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-400 transition-colors text-center"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Wordsearch Builder</h2>
          <p className="text-xs text-slate-400">Generate grid puzzles</p>
        </Link>

        <Link
          href="/reports"
          className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-400 transition-colors text-center"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Reports & Metrics</h2>
          <p className="text-xs text-slate-400">View the activity stats and health status</p>
        </Link>
      </div>
    </main>
  );
}