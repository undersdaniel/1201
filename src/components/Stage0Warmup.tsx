import React, { useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

interface WarmupProblem {
  tag: string;
  label: string;
  s1Prompt: string;
  l: { w: number; n: number; d: number };
  r: { w: number; n: number; d: number };
  lcdOpts: number[];
  correctLcd: number;
  answer: '>' | '<' | '=';
  tip: string;
}

const WARMUP_PROBLEMS: WarmupProblem[] = [
  {
    tag: '暖身題 ①：基礎異分母真分數',
    label: '暖身① 2/3 和 3/5',
    s1Prompt: '分母是 3 和 5，先找出它們的最小公倍數當作「公分母」：',
    l: { w: 0, n: 2, d: 3 },
    r: { w: 0, n: 3, d: 5 },
    lcdOpts: [8, 12, 15, 30],
    correctLcd: 15,
    answer: '>',
    tip: '🎉 答對了！2/3 = 10/15，3/5 = 9/15，所以 2/3 > 3/5！',
  },
  {
    tag: '暖身題 ②：找最小公倍數通分',
    label: '暖身② 5/6 和 7/8',
    s1Prompt: '分母是 6 和 8，先找出它們的最小公倍數當作「公分母」：',
    l: { w: 0, n: 5, d: 6 },
    r: { w: 0, n: 7, d: 8 },
    lcdOpts: [14, 24, 36, 48],
    correctLcd: 24,
    answer: '<',
    tip: '🎉 答對了！5/6 = 20/24，7/8 = 21/24，所以 5/6 < 7/8！',
  },
  {
    tag: '暖身題 ③：帶分數整數相同，通分比較分數部分',
    label: '暖身③ 2又3/10 和 2又3/8',
    s1Prompt: '整數部分都是 2，只要通分比較 3/10 和 3/8！先找 10 和 8 的最小公倍數：',
    l: { w: 2, n: 3, d: 10 },
    r: { w: 2, n: 3, d: 8 },
    lcdOpts: [18, 20, 40, 80],
    correctLcd: 40,
    answer: '<',
    tip: '🎉 答對了！2又3/10 = 2又12/40，2又3/8 = 2又15/40，所以 2又3/10 < 2又3/8！',
  },
];

export const Stage0Warmup: React.FC = () => {
  const [problemIdx, setProblemIdx] = useState(0);
  const [selectedLcd, setSelectedLcd] = useState<number | null>(null);
  const [wrongLcdKey, setWrongLcdKey] = useState<{ val: number; count: number } | null>(null);
  const [revealedL, setRevealedL] = useState(false);
  const [revealedR, setRevealedR] = useState(false);
  const [chosenSym, setChosenSym] = useState<string | null>(null);
  const [symShakeCount, setSymShakeCount] = useState(0);

  const p = WARMUP_PROBLEMS[problemIdx];

  const handleLoadProblem = (idx: number) => {
    setProblemIdx(idx);
    setSelectedLcd(null);
    setWrongLcdKey(null);
    setRevealedL(false);
    setRevealedR(false);
    setChosenSym(null);
  };

  const handleSelectLcd = (val: number) => {
    if (val === p.correctLcd) {
      setSelectedLcd(val);
      setWrongLcdKey(null);
      setRevealedL(false);
      setRevealedR(false);
      setChosenSym(null);
    } else {
      setWrongLcdKey((prev) => ({ val, count: (prev?.count || 0) + 1 }));
    }
  };

  const handleCheckSym = (sym: '>' | '<' | '=') => {
    setChosenSym(sym);
    if (sym !== p.answer) {
      setSymShakeCount((c) => c + 1);
    }
  };

  const mL = p.correctLcd / p.l.d;
  const mR = p.correctLcd / p.r.d;
  const nL = p.l.n * mL;
  const nR = p.r.n * mR;

  const isLcdCorrect = selectedLcd === p.correctLcd;
  const isSymCorrect = chosenSym === p.answer;

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            🔥 通分暖身：複習用「通分」比較分數大小
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            先複習上一節的通分步驟：<b>找公倍數 ➔ 擴分成同分母 ➔ 比較分子大小</b>！
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {WARMUP_PROBLEMS.map((prob, idx) => (
            <button
              key={prob.tag}
              type="button"
              onClick={() => handleLoadProblem(idx)}
              className={
                problemIdx === idx
                  ? 'bg-indigo-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow cursor-pointer'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm cursor-pointer'
              }
            >
              {prob.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-indigo-200 space-y-5">
        {/* 題目展示 */}
        <div className="flex flex-col items-center justify-center bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100">
          <div className="text-xs font-black text-indigo-600 mb-2">{p.tag}</div>
          <div className="flex items-center gap-4 text-slate-900">
            <FractionDisplay num={p.l.n} den={p.l.d} whole={p.l.w} large />
            <span className="text-2xl font-black text-slate-400">和</span>
            <FractionDisplay num={p.r.n} den={p.r.d} whole={p.r.w} large />
            <span className="text-base sm:text-lg font-black text-slate-700">哪一個比較大？</span>
          </div>
        </div>

        {/* 步驟 1：選公分母 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">
              1
            </span>
            <span>{p.s1Prompt}</span>
          </div>
          <div className="flex flex-wrap gap-2.5 pl-8">
            {p.lcdOpts.map((val) => {
              let btnClass =
                'bg-white hover:bg-sky-50 border-2 border-slate-300 rounded-xl px-5 py-2 font-black text-base sm:text-lg text-slate-800 transition active:scale-95 cursor-pointer';
              if (isLcdCorrect) {
                btnClass =
                  val === p.correctLcd
                    ? 'bg-emerald-100 border-2 border-emerald-500 rounded-xl px-5 py-2 font-black text-base sm:text-lg text-emerald-800 shadow-sm animate-pop cursor-pointer'
                    : 'bg-slate-100 border-2 border-slate-200 rounded-xl px-5 py-2 font-black text-base sm:text-lg text-slate-400 cursor-pointer';
              } else if (wrongLcdKey?.val === val) {
                btnClass =
                  'bg-rose-100 border-2 border-rose-500 rounded-xl px-5 py-2 font-black text-base sm:text-lg text-rose-800 animate-shake cursor-pointer';
              }
              return (
                <button
                  key={`${val}-${wrongLcdKey?.val === val ? wrongLcdKey.count : 0}`}
                  type="button"
                  onClick={() => handleSelectLcd(val)}
                  className={btnClass}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>

        {/* 步驟 2：擴分過程 */}
        {isLcdCorrect && (
          <div className="space-y-3 pt-3 border-t border-slate-100 animate-pop">
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>把兩個分數都擴分成同分母分數：</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-8">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-slate-800">
                <FractionDisplay num={p.l.n} den={p.l.d} whole={p.l.w} />
                <span>＝</span>
                <FractionDisplay num={`${p.l.n}×${mL}`} den={`${p.l.d}×${mL}`} whole={p.l.w} />
                <span>＝</span>
                {revealedL ? (
                  <span className="text-sky-700 font-black animate-pop">
                    <FractionDisplay num={nL} den={p.correctLcd} whole={p.l.w} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealedL(true)}
                    className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow transition cursor-pointer"
                  >
                    點擊顯示結果
                  </button>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-slate-800">
                <FractionDisplay num={p.r.n} den={p.r.d} whole={p.r.w} />
                <span>＝</span>
                <FractionDisplay num={`${p.r.n}×${mR}`} den={`${p.r.d}×${mR}`} whole={p.r.w} />
                <span>＝</span>
                {revealedR ? (
                  <span className="text-emerald-700 font-black animate-pop">
                    <FractionDisplay num={nR} den={p.correctLcd} whole={p.r.w} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealedR(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow transition cursor-pointer"
                  >
                    點擊顯示結果
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 步驟 3：填入大小符號 */}
        {isLcdCorrect && revealedL && revealedR && (
          <div className="space-y-3 pt-3 border-t border-slate-100 animate-pop">
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 text-xs flex items-center justify-center">
                3
              </span>
              <span>分母一樣了！比比看分子，點選 ＞、＜ 或 ＝：</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <FractionDisplay num={p.l.n} den={p.l.d} whole={p.l.w} large />
                <span className="text-xs font-black text-sky-700 mt-1">
                  ({p.l.w ? `${p.l.w}又` : ''}
                  {nL}/{p.correctLcd})
                </span>
              </div>

              <span
                key={`sym-${symShakeCount}-${chosenSym}`}
                className={
                  chosenSym === null
                    ? 'w-12 h-12 rounded-xl border-2 border-amber-500 bg-white flex items-center justify-center text-2xl font-black text-amber-700 shadow-inner'
                    : isSymCorrect
                      ? 'w-12 h-12 rounded-xl border-2 border-emerald-600 bg-emerald-100 flex items-center justify-center text-2xl font-black text-emerald-800 animate-pop'
                      : 'w-12 h-12 rounded-xl border-2 border-rose-500 bg-rose-100 flex items-center justify-center text-2xl font-black text-rose-700 animate-shake'
                }
              >
                {chosenSym ?? '？'}
              </span>

              <div className="flex flex-col items-center">
                <FractionDisplay num={p.r.n} den={p.r.d} whole={p.r.w} large />
                <span className="text-xs font-black text-emerald-700 mt-1">
                  ({p.r.w ? `${p.r.w}又` : ''}
                  {nR}/{p.correctLcd})
                </span>
              </div>

              <div className="flex gap-2 ml-2">
                {(['>', '<', '='] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleCheckSym(sym)}
                    className="w-12 h-12 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-400 font-black text-xl active:scale-95 cursor-pointer"
                  >
                    {sym === '>' ? '＞' : sym === '<' ? '＜' : '＝'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 暖身總結回饋 */}
        {chosenSym !== null && (
          <div
            className={`rounded-2xl p-4 border-2 font-bold text-sm sm:text-base ${
              isSymCorrect
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                : 'bg-rose-100 border-rose-400 text-rose-900'
            }`}
          >
            <span>
              {isSymCorrect
                ? p.tip
                : '🤔 分母已經一樣大了，只要比較上面擴分後的「分子」哪個比較大就可以囉！'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
