'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Settingspage() {
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedFontSize = Cookies.get('pref-font-size');
    const savedContrast = Cookies.get('pref-high-contrast');

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedContrast) setHighContrast(savedContrast === 'true');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    Cookies.set('pref-font-size', fontSize, { expires: 35 });
    Cookies.set('pref-high-contrast', highContrast.toString(), { expires: 35 });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 text-slate-100">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-sky-400">User Settings</h1>
        <p className="text-slate-200 text-sm">
          Customize your display settings. Settings are saved using browser cookies.
        </p>
      </header>

      <form 
        onSubmit={handleSave} 
        aria-label="User Display Settings"
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6 shadow-md"
      >
        <fieldset className="space-y-6">
          <legend className="sr-only">Display and Accessibility Preferences</legend>

          {/* Font Size Selection */}
          <div className="space-y-2">
            <label htmlFor="font-size-select" className="block text-sm font-semibold text-white">
              Display Font Size 
            </label>
            <select
              id="font-size-select"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              aria-label="Display Font Size"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
            >
              <option value="small">Small</option>
              <option value="medium">Medium (Default)</option>
              <option value="large">Large (Accessibility Mode)</option>
            </select>
          </div>

          {/* High Contrast Toggle */} 
          <div className="flex items-center justify-between border-t border-slate-700 pt-4">
            <div>
              <label htmlFor="high-contrast-toggle" className="block text-sm font-semibold text-white cursor-pointer">
                High Contrast 
              </label>
              <p id="high-contrast-desc" className="text-xs text-slate-200 mt-0.5">
                Increases text clarity for clinical sessions
              </p>
            </div>
            <input
              id="high-contrast-toggle"
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              aria-describedby="high-contrast-desc"
              aria-label="High Contrast Mode"
              className="h-5 w-5 accent-sky-400 rounded cursor-pointer focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </fieldset>

        {/* Save Button & Feedback */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            aria-label="Save preferences to browser cookies"
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            Save preferences 
          </button>

          {saved && (
            <span role="status" aria-live="polite" className="text-emerald-400 text-sm font-medium animate-pulse">
              Preferences saved to cookies!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}