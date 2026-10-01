'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section with Navigation */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">About This Project</h1>
          <p className="text-slate-400 text-sm mt-1">
            Speech Pathology Phoneme Activity Builder — Assessment 3
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-sm rounded-lg text-slate-300 transition-colors cursor-pointer"
        >
          ← Back Home
        </Link>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Student Name</p>
          <p className="text-lg font-bold text-cyan-300 mt-1">Hussein Dirani</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Student ID</p>
          <p className="text-lg font-bold text-cyan-300 mt-1">22435520</p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 shadow-lg">
        <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
          Project Overview
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          The <strong className="text-cyan-400">Phoneme Activity Builder</strong> is an interactive web application designed to support speech pathology learning and articulation practice. It enables clinicians and students to construct customizable phonetic exercises tailored to specific speech targets.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <h3 className="text-cyan-400 font-semibold text-sm mb-1">Wordle Builder</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Interactive phoneme guessing games backed by a PostgreSQL / Prisma database.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <h3 className="text-cyan-400 font-semibold text-sm mb-1">Word Search Builder</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Customized grid worksheets for speech practice and articulation drills.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <h3 className="text-cyan-400 font-semibold text-sm mb-1">Backend REST API</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Full REST API endpoints for persistent storage and full-stack activity management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}