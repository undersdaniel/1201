import React, { useEffect, useState } from 'react';

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface WebkitHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): Element | null {
  const doc = document as WebkitDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(getFullscreenElement());
  });
  const [errorTip, setErrorTip] = useState<string | null>(null);

  useEffect(() => {
    const syncState = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };
    document.addEventListener('fullscreenchange', syncState);
    document.addEventListener('webkitfullscreenchange', syncState);
    return () => {
      document.removeEventListener('fullscreenchange', syncState);
      document.removeEventListener('webkitfullscreenchange', syncState);
    };
  }, []);

  useEffect(() => {
    if (!errorTip) return;
    const timer = window.setTimeout(() => setErrorTip(null), 3000);
    return () => window.clearTimeout(timer);
  }, [errorTip]);

  const toggleFullscreen = async () => {
    setErrorTip(null);
    const doc = document as WebkitDocument;
    const root = document.documentElement as WebkitHTMLElement;

    try {
      if (!getFullscreenElement()) {
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          await root.webkitRequestFullscreen();
        } else {
          setErrorTip('此裝置或瀏覽器不支援全螢幕模式');
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch {
      setErrorTip('目前視窗環境不允許切換全螢幕');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        title={isFullscreen ? '結束全螢幕' : '切換全螢幕'}
        aria-label={isFullscreen ? '結束全螢幕' : '切換全螢幕'}
        className="bg-white/20 hover:bg-white/30 active:scale-95 text-white border border-white/30 px-3 py-1.5 rounded-xl text-sm sm:text-base font-black shadow-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
      >
        {isFullscreen ? (
          <>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
            <span className="hidden sm:inline">結束全螢幕</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
            <span className="hidden sm:inline">全螢幕</span>
          </>
        )}
      </button>

      {errorTip && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 text-white text-xs font-bold px-3 py-2 shadow-lg z-50">
          {errorTip}
        </div>
      )}
    </div>
  );
};
