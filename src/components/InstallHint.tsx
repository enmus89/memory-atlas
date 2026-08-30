import React, { useEffect, useState } from 'react';
import { Share, Plus, X } from 'lucide-react';
import { isInstallHintDismissed, dismissInstallHint } from '../utils/storage';

/**
 * A one-time nudge showing iPhone and iPad users how to install the app.
 *
 * Every other platform gets an install button from the browser itself. Safari
 * has no such prompt and no way to ask for one, so on iOS the Share sheet is
 * the only route — and it is invisible unless somebody says so.
 *
 * Shown only where it is actionable: iOS, in a browser tab, and not already
 * dismissed. Dismissal is per-device, because installing is something you do
 * to one phone.
 */

function isIos(): boolean {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // An iPad on iPadOS 13+ claims to be a Mac; the touch points give it away.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // Safari's own flag, which predates display-mode and is still what iOS sets.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export const InstallHint: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIos() || isInstalled() || isInstallHintDismissed()) return;
    // A beat after load, so it arrives as an aside rather than competing with
    // the app itself for the first thing you look at.
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    dismissInstallHint();
  };

  return (
    <div
      role="complementary"
      aria-label="Install Memory Atlas"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pointer-events-none motion-safe:animate-install-hint"
    >
      <div className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Share className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 text-slate-700">
          <p className="text-sm font-bold text-slate-900">Keep Memory Atlas on your home screen</p>
          <p className="mt-1 text-xs leading-relaxed">
            Tap{' '}
            <Share className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-blue-600" aria-hidden="true" />
            <span className="font-semibold">Share</span>, then{' '}
            <Plus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-blue-600" aria-hidden="true" />
            <span className="font-semibold">Add to Home Screen</span>. It opens full screen, like an
            app.
          </p>
        </div>

        <button
          onClick={close}
          aria-label="Dismiss"
          className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
