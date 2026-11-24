import React, { useState } from 'react';
import {
  ensureStudentRecord,
  normalizeSeatInput,
  SEAT_MAX_LENGTH,
} from '../services/progressService';
import { FullscreenButton } from './FullscreenButton';

interface RoleEntryScreenProps {
  onEnterStudent: (seatNumber: string) => void;
  onEnterTeacher: () => void;
}

const TEACHER_PASSWORDS = new Set(['123', '1201']);
const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'] as const;

function extractDigitFromKeyEvent(e: React.KeyboardEvent): string | null {
  if (/^[0-9]$/.test(e.key)) return e.key;
  if (e.code.startsWith('Digit') && e.code.length === 6) {
    return e.code.slice(5);
  }
  if (e.code.startsWith('Numpad') && e.code.length === 7) {
    return e.code.slice(6);
  }
  return null;
}

interface NumericKeypadProps {
  accent: 'sky' | 'indigo';
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  accent,
  onDigit,
  onBackspace,
  onClear,
}) => {
  const isSilent = accent === 'indigo';
  const numBtnClass = isSilent
    ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-lg py-2.5 rounded-xl shadow-xs cursor-pointer focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]'
    : 'bg-sky-50 hover:bg-sky-100 active:scale-95 border border-sky-200 text-sky-950 font-black text-lg py-2.5 rounded-xl shadow-xs transition cursor-pointer';
  const utilBtnClass = isSilent
    ? 'bg-slate-100 border border-slate-200 text-slate-700 font-black py-2.5 rounded-xl cursor-pointer focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]'
    : 'bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 text-slate-700 font-black py-2.5 rounded-xl transition cursor-pointer';

  return (
    <div className="grid grid-cols-3 gap-2 pt-1 select-none">
      {KEYPAD_KEYS.map((key) => {
        if (key === 'CLEAR') {
          return (
            <button
              key={key}
              type="button"
              onClick={onClear}
              className={`${utilBtnClass} text-sm`}
            >
              清除
            </button>
          );
        }
        if (key === 'BACK') {
          return (
            <button
              key={key}
              type="button"
              onClick={onBackspace}
              aria-label="退格"
              className={`${utilBtnClass} text-base`}
            >
              ⌫
            </button>
          );
        }
        return (
          <button
            key={key}
            type="button"
            onClick={() => onDigit(key)}
            className={numBtnClass}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

export const RoleEntryScreen: React.FC<RoleEntryScreenProps> = ({
  onEnterStudent,
  onEnterTeacher,
}) => {
  const [seatInput, setSeatInput] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  const [teacherPwd, setTeacherPwd] = useState('');
  const [showTeacherPwd, setShowTeacherPwd] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherShake, setTeacherShake] = useState(0);

  const submitStudent = async () => {
    const normalized = normalizeSeatInput(seatInput);
    if (!normalized) {
      setStudentError('請輸入正確的數字座號（1 ～ 999）喔！');
      return;
    }

    setStudentError(null);
    setStudentLoading(true);
    try {
      await ensureStudentRecord(normalized);
      onEnterStudent(normalized);
    } catch {
      setStudentError('連線記錄座號時發生錯誤，請再試一次！');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitStudent();
  };

  const submitTeacher = () => {
    if (TEACHER_PASSWORDS.has(teacherPwd.trim())) {
      setTeacherError(null);
      onEnterTeacher();
    } else {
      setTeacherError('教師密碼錯誤，請再確認一次！');
      setTeacherShake((c) => c + 1);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTeacher();
  };

  const appendSeatDigit = (digit: string) => {
    setStudentError(null);
    setSeatInput((prev) => (prev.length >= SEAT_MAX_LENGTH ? prev : prev + digit));
  };

  const appendTeacherDigit = (char: string) => {
    setTeacherError(null);
    setTeacherPwd((prev) => (prev.length >= 12 ? prev : prev + char));
  };

  const handleSeatKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      void submitStudent();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      setStudentError(null);
      setSeatInput((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      setStudentError(null);
      setSeatInput('');
      return;
    }
    const digit = extractDigitFromKeyEvent(e);
    if (digit) {
      e.preventDefault();
      appendSeatDigit(digit);
    }
  };

  const handleTeacherKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submitTeacher();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      setTeacherError(null);
      setTeacherPwd((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      setTeacherError(null);
      setTeacherPwd('');
      return;
    }
    const digit = extractDigitFromKeyEvent(e);
    if (digit) {
      e.preventDefault();
      appendTeacherDigit(digit);
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      appendTeacherDigit(e.key);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f7ff] text-slate-800">
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🧠</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide leading-tight">
                聰明算！分數比大小互動網
              </h1>
              <p className="text-xs sm:text-sm text-blue-100">
                五年級數學：不用通分比較異分母分數的大小
              </p>
            </div>
          </div>
          <FullscreenButton />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full space-y-5">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-900">
              請選擇進入身分
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              學生請輸入座號登入以自動記錄學習進度；教師請輸入密碼進入教師版查看全班進度。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* 學生版卡片 */}
            <form
              onSubmit={handleStudentSubmit}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-sky-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-2xl flex items-center justify-center">
                    👩‍🎓
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-sky-900">學生版</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">
                      點擊下方數字鍵盤（或使用鍵盤）輸入座號
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-sm font-black text-slate-700">你的座號</div>
                  <div
                    role="textbox"
                    tabIndex={0}
                    aria-label="你的座號"
                    onKeyDown={handleSeatKeyDown}
                    className="w-full rounded-xl border-2 border-sky-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 focus:outline-none px-4 py-2.5 min-h-[52px] flex items-center justify-between bg-sky-50/40 cursor-text"
                  >
                    {seatInput ? (
                      <span className="text-2xl font-black text-slate-800 tracking-wider">
                        {seatInput}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-slate-400">
                        例如：1、12（範圍 1～999）
                      </span>
                    )}
                    {seatInput && (
                      <span className="text-xs font-black bg-sky-100 text-sky-700 px-2 py-0.5 rounded-lg">
                        {seatInput} 號
                      </span>
                    )}
                  </div>

                  <NumericKeypad
                    accent="sky"
                    onDigit={appendSeatDigit}
                    onBackspace={() => {
                      setStudentError(null);
                      setSeatInput((prev) => prev.slice(0, -1));
                    }}
                    onClear={() => {
                      setStudentError(null);
                      setSeatInput('');
                    }}
                  />

                  {studentError && (
                    <p className="text-xs sm:text-sm font-bold text-rose-600">{studentError}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={studentLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:opacity-60 text-white font-black text-base sm:text-lg py-3 rounded-2xl shadow-md transition cursor-pointer"
              >
                {studentLoading ? '登入記錄中...' : '🚀 進入學生版'}
              </button>
            </form>

            {/* 教師版卡片 */}
            <form
              key={`teacher-form-${teacherShake}`}
              onSubmit={handleTeacherSubmit}
              className={`bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-indigo-200 flex flex-col justify-between space-y-4 ${
                teacherShake > 0 && teacherError ? 'animate-shake' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-2xl flex items-center justify-center">
                    👨‍🏫
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-indigo-900">教師版</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">
                      與學生版功能相同，並可查看全班學生進度
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-sm font-black text-slate-700">教師密碼</div>
                  <div
                    role="textbox"
                    tabIndex={0}
                    aria-label="教師密碼"
                    onKeyDown={handleTeacherKeyDown}
                    className="w-full rounded-xl border-2 border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none px-4 py-2.5 min-h-[52px] flex items-center justify-between bg-indigo-50/40 cursor-text"
                  >
                    {teacherPwd ? (
                      <span className="text-2xl font-black text-slate-800 tracking-widest">
                        {showTeacherPwd ? teacherPwd : '●'.repeat(teacherPwd.length)}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-slate-400">
                        請點擊數字鍵盤輸入教師密碼
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTeacherPwd((v) => !v);
                      }}
                      className="text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0"
                    >
                      {showTeacherPwd ? '隱藏' : '顯示'}
                    </button>
                  </div>

                  <NumericKeypad
                    accent="indigo"
                    onDigit={appendTeacherDigit}
                    onBackspace={() => {
                      setTeacherError(null);
                      setTeacherPwd((prev) => prev.slice(0, -1));
                    }}
                    onClear={() => {
                      setTeacherError(null);
                      setTeacherPwd('');
                    }}
                  />

                  {teacherError && (
                    <p className="text-xs sm:text-sm font-bold text-rose-600">{teacherError}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-base sm:text-lg py-3 rounded-2xl shadow-md transition cursor-pointer"
              >
                🔑 進入教師版
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
