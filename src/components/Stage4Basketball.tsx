import React, { useEffect, useRef, useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

interface ShotRound {
  id: number;
  title: string;
  strategyLabel: string;
  left: { n: number; d: number };
  right: { n: number; d: number };
  target: 'left' | 'right';
  rightTip: string;
  wrongTip: string;
}

const SHOT_ROUNDS: ShotRound[] = [
  {
    id: 1,
    title: '第 1 球 · 暖身投籃',
    strategyLabel: '策略提示：看有沒有超過一半（1/2）',
    left: { n: 7, d: 16 },
    right: { n: 6, d: 11 },
    target: 'right',
    rightTip:
      '空心入網！6/11 超過一半（5.5/11），7/16 不到一半（8/16），所以 6/11 > 7/16！',
    wrongTip:
      '打鐵彈出了！用「看有沒有超過一半」想想看：16 的一半是 8（7/16 不到一半），11 的一半是 5.5（6/11 超過一半）喔！',
  },
  {
    id: 2,
    title: '第 2 球 · 中距離跳投',
    strategyLabel: '策略提示：跟「1」比差距',
    left: { n: 7, d: 9 },
    right: { n: 9, d: 11 },
    target: 'right',
    rightTip:
      '漂亮進球！9/11 距離 1 只差 2/11，7/9 距離 1 差 2/9；缺得越少越接近 1，所以 9/11 > 7/9！',
    wrongTip:
      '球彈框而出！這兩個分數的分子都比分母少 2：7/9 離 1 差 2/9，9/11 離 1 差 2/11，缺得越少才越大喔！',
  },
  {
    id: 3,
    title: '第 3 球 · 外線三分球',
    strategyLabel: '策略提示：假分數換成帶分數',
    left: { n: 15, d: 13 },
    right: { n: 13, d: 11 },
    target: 'right',
    rightTip:
      '三分球命中！13/11 = 1又2/11，15/13 = 1又2/13，整數都是 1，同分子比較 2/11 > 2/13！',
    wrongTip:
      '差一點點！把假分數換成帶分數比比看：15/13 = 1又2/13，13/11 = 1又2/11，哪一個的分數部分比較大呢？',
  },
  {
    id: 4,
    title: '第 4 球 · 急停跳投',
    strategyLabel: '策略提示：同分子比大小',
    left: { n: 5, d: 9 },
    right: { n: 5, d: 12 },
    target: 'left',
    rightTip:
      '穩穩投進！分子都是 5，分母 9 < 12（平分越少份，每一份越大），所以 5/9 > 5/12！',
    wrongTip:
      '球滑出籃框！仔細看分子都是 5，平分成 9 份和平分成 12 份，哪一邊的每一份比較大呢？',
  },
  {
    id: 5,
    title: '第 5 球 · 壓哨絕殺球',
    strategyLabel: '策略提示：綜合運用聰明算',
    left: { n: 11, d: 12 },
    right: { n: 8, d: 9 },
    target: 'left',
    rightTip:
      '壓哨絕殺奪冠！11/12 距離 1 只差 1/12，8/9 距離 1 差 1/9；因為 1/12 < 1/9（缺得比較少），所以 11/12 > 8/9！',
    wrongTip:
      '絕殺球擦框而出！兩個分數都只差 1 份就滿 1：11/12 差 1/12，8/9 差 1/9，誰缺得比較少就比較大喔！',
  },
];

interface BallState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const START_BALL: BallState = { x: 380, y: 312, scale: 1, rotation: 0 };
const LEFT_HOOP = { x: 195, y: 158 };
const RIGHT_HOOP = { x: 565, y: 158 };

interface Stage4BasketballProps {
  onChallengeComplete?: () => void;
  onGoNextStage?: () => void;
}

export const Stage4Basketball: React.FC<Stage4BasketballProps> = ({
  onChallengeComplete,
  onGoNextStage,
}) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'shooting' | 'scored' | 'finished'>('ready');
  const [shotsMade, setShotsMade] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ball, setBall] = useState<BallState>(START_BALL);
  const [swishSide, setSwishSide] = useState<'left' | 'right' | null>(null);
  const [clankSide, setClankSide] = useState<'left' | 'right' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const currentRound = SHOT_ROUNDS[roundIdx];

  const resetChallenge = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setRoundIdx(0);
    setPhase('ready');
    setShotsMade(0);
    setStreak(0);
    setBall(START_BALL);
    setSwishSide(null);
    setClankSide(null);
    setFeedback(null);
  };

  const handleNextRound = () => {
    if (roundIdx < SHOT_ROUNDS.length - 1) {
      setRoundIdx((i) => i + 1);
      setPhase('ready');
      setBall(START_BALL);
      setSwishSide(null);
      setClankSide(null);
      setFeedback(null);
    }
  };

  const shootAt = (side: 'left' | 'right') => {
    if (phase !== 'ready') return;

    const isCorrect = side === currentRound.target;
    const hoop = side === 'left' ? LEFT_HOOP : RIGHT_HOOP;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setPhase('shooting');
    setFeedback(null);
    setSwishSide(null);
    setClankSide(null);

    const resolveShot = () => {
      if (isCorrect) {
        setSwishSide(side);
        const nextMade = shotsMade + 1;
        setShotsMade(nextMade);
        setStreak((s) => s + 1);
        setFeedback({ type: 'success', msg: currentRound.rightTip });

        if (roundIdx === SHOT_ROUNDS.length - 1) {
          setPhase('finished');
          onChallengeComplete?.();
        } else {
          setPhase('scored');
        }
      } else {
        setClankSide(side);
        setStreak(0);
        setFeedback({ type: 'error', msg: currentRound.wrongTip });
        window.setTimeout(() => {
          setBall(START_BALL);
          setPhase('ready');
        }, prefersReducedMotion ? 120 : 320);
      }
    };

    if (prefersReducedMotion) {
      setBall({
        x: hoop.x,
        y: isCorrect ? hoop.y + 42 : hoop.y + 18,
        scale: 0.78,
        rotation: 0,
      });
      resolveShot();
      return;
    }

    const startTime = performance.now();
    const arcDuration = 540;
    const followDuration = isCorrect ? 240 : 300;
    const totalDuration = arcDuration + followDuration;

    const ctrlX = (START_BALL.x + hoop.x) / 2;
    const ctrlY = 26;
    const rimImpactX = isCorrect ? hoop.x : hoop.x + (side === 'left' ? 30 : -30);
    const rimImpactY = hoop.y - 4;
    const bounceEndX = side === 'left' ? hoop.x + 110 : hoop.x - 110;
    const bounceEndY = 278;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed <= arcDuration) {
        const t = elapsed / arcDuration;
        const inv = 1 - t;
        const x = inv * inv * START_BALL.x + 2 * inv * t * ctrlX + t * t * rimImpactX;
        const y = inv * inv * START_BALL.y + 2 * inv * t * ctrlY + t * t * rimImpactY;
        const scale = 1 - 0.24 * t;
        const rotation = t * (side === 'left' ? -420 : 420);
        setBall({ x, y, scale, rotation });
      } else if (elapsed <= totalDuration) {
        const t2 = (elapsed - arcDuration) / followDuration;
        if (isCorrect) {
          setSwishSide(side);
          setBall({
            x: hoop.x,
            y: rimImpactY + t2 * 76,
            scale: 0.76 - t2 * 0.05,
            rotation: (side === 'left' ? -420 : 420) + t2 * 90,
          });
        } else {
          setClankSide(side);
          const x = rimImpactX + (bounceEndX - rimImpactX) * t2;
          const y = rimImpactY - Math.sin(t2 * Math.PI) * 46 + (bounceEndY - rimImpactY) * t2;
          setBall({
            x,
            y,
            scale: 0.76 + t2 * 0.12,
            rotation: (side === 'left' ? -420 : 420) + t2 * 220,
          });
        }
      } else {
        rafRef.current = null;
        resolveShot();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  const renderHoop = (side: 'left' | 'right', frac: { n: number; d: number }) => {
    const cx = side === 'left' ? LEFT_HOOP.x : RIGHT_HOOP.x;
    const isSwish = swishSide === side;
    const isClank = clankSide === side;
    const canClick = phase === 'ready';

    return (
      <g
        onClick={canClick ? () => shootAt(side) : undefined}
        className={canClick ? 'cursor-pointer group' : 'cursor-default'}
        role="button"
        tabIndex={canClick ? 0 : -1}
        aria-label={`投向${side === 'left' ? '左邊' : '右邊'}籃框 ${frac.n}/${frac.d}`}
        onKeyDown={(e) => {
          if (canClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            shootAt(side);
          }
        }}
      >
        {/* 籃球架立柱 */}
        <rect x={cx - 8} y="128" width="16" height="118" rx="4" fill="#334155" />
        <rect x={cx - 24} y="236" width="48" height="14" rx="5" fill="#1e293b" />

        {/* 透明強化玻璃籃板 */}
        <rect
          x={cx - 78}
          y="42"
          width="156"
          height="108"
          rx="12"
          fill={isSwish ? '#ecfdf5' : isClank ? '#fff1f2' : '#ffffff'}
          stroke={isSwish ? '#10b981' : isClank ? '#f43f5e' : '#334155'}
          strokeWidth={isSwish || isClank ? 4.5 : 3.5}
        />
        {/* 籃板內部瞄準方框 */}
        <rect
          x={cx - 56}
          y="54"
          width="112"
          height="84"
          rx="8"
          fill={isSwish ? '#d1fae5' : '#f8fafc'}
          stroke={isSwish ? '#059669' : '#ea580c'}
          strokeWidth="2.5"
        />

        {/* 分數看板（直接顯示在籃板上，超大清楚易讀） */}
        <text
          x={cx}
          y="87"
          textAnchor="middle"
          fill="#0f172a"
          fontSize="28"
          fontWeight="900"
        >
          {frac.n}
        </text>
        <line
          x1={cx - 24}
          y1="96"
          x2={cx + 24}
          y2="96"
          stroke="#0f172a"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <text
          x={cx}
          y="126"
          textAnchor="middle"
          fill="#0f172a"
          fontSize="28"
          fontWeight="900"
        >
          {frac.d}
        </text>

        {/* 籃網（進球時輕微張開晃動） */}
        <g transform={isSwish ? `translate(${cx}, 160) scale(1.08, 1.06) translate(${-cx}, -160)` : undefined}>
          <path
            d={`M ${cx - 34} 160 L ${cx - 22} 214 L ${cx + 22} 214 L ${cx + 34} 160`}
            fill="rgba(255,255,255,0.45)"
            stroke="#e2e8f0"
            strokeWidth="2.5"
          />
          <line x1={cx - 28} y1="160" x2={cx - 12} y2="214" stroke="#cbd5e1" strokeWidth="2" />
          <line x1={cx - 12} y1="160" x2={cx + 4} y2="214" stroke="#cbd5e1" strokeWidth="2" />
          <line x1={cx + 12} y1="160" x2={cx - 4} y2="214" stroke="#cbd5e1" strokeWidth="2" />
          <line x1={cx + 28} y1="160" x2={cx + 12} y2="214" stroke="#cbd5e1" strokeWidth="2" />
          <line x1={cx - 29} y1="178" x2={cx + 29} y2="178" stroke="#cbd5e1" strokeWidth="2" />
          <line x1={cx - 25} y1="196" x2={cx + 25} y2="196" stroke="#cbd5e1" strokeWidth="2" />
        </g>

        {/* 橘色籃框 */}
        <rect x={cx - 39} y="153" width="78" height="9" rx="4.5" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />

        {/* 進球或打鐵即時浮標 */}
        {isSwish && (
          <g transform={`translate(${cx}, 28)`}>
            <rect x="-48" y="-15" width="96" height="26" rx="13" fill="#059669" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
              進球得分！
            </text>
          </g>
        )}
        {isClank && (
          <g transform={`translate(${cx}, 28)`}>
            <rect x="-42" y="-15" width="84" height="26" rx="13" fill="#e11d48" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
              打鐵彈出
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <section className="space-y-4">
      {/* 標題與控制列 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            🏀 投籃大挑戰：把球投進「分數比較大」的籃框！
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            不用通分，綜合運用三招聰明算比較左右兩個籃框上的分數，點擊<b>比較大</b>的籃框或按鈕出手投籃！
          </p>
        </div>
        <button
          type="button"
          onClick={resetChallenge}
          className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer whitespace-nowrap"
        >
          🔄 重新挑戰
        </button>
      </div>

      {/* 球場主舞台 */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-orange-200 space-y-4">
        {/* 乾淨計分與關卡資訊列（無多餘膠囊堆疊） */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {currentRound.title}
            </div>
            <div className="text-xs sm:text-sm font-bold text-orange-700">
              {currentRound.strategyLabel}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
            <span>
              進度：<b className="text-indigo-700 text-base">{shotsMade} / {SHOT_ROUNDS.length}</b> 球
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>
              連續命中：<b className="text-orange-600 text-base">{streak}</b> 球
            </span>
          </div>
        </div>

        {/* 互動籃球場 SVG */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] max-w-4xl mx-auto">
            <svg
              viewBox="0 0 760 355"
              className="w-full h-auto rounded-2xl border border-orange-200 shadow-inner"
            >
              <defs>
                <linearGradient id="arenaWall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="mapleFloor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* 體育館背景牆 */}
              <rect x="0" y="0" width="760" height="240" fill="url(#arenaWall)" />
              {/* 觀眾席橫線層次 */}
              <rect x="0" y="185" width="760" height="55" fill="#1e293b" opacity="0.35" />
              <line x1="0" y1="205" x2="760" y2="205" stroke="#93c5fd" strokeWidth="1" opacity="0.25" />
              <line x1="0" y1="222" x2="760" y2="222" stroke="#93c5fd" strokeWidth="1" opacity="0.25" />

              {/* 中央記分板 */}
              <rect x="315" y="18" width="130" height="44" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <text x="380" y="36" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                GOAL SCORE
              </text>
              <text x="380" y="54" textAnchor="middle" fill="#fbbf24" fontSize="18" fontWeight="900">
                {shotsMade} / {SHOT_ROUNDS.length}
              </text>

              {/* 楓木地板 */}
              <rect x="0" y="240" width="760" height="115" fill="url(#mapleFloor)" />
              <line x1="0" y1="240" x2="760" y2="240" stroke="#fef3c7" strokeWidth="3" />
              {/* 罰球線與三分弧線 */}
              <path
                d="M 110 355 Q 380 250 650 355"
                fill="none"
                stroke="#fffbeb"
                strokeWidth="3.5"
                opacity="0.85"
              />
              <ellipse
                cx="380"
                cy="315"
                rx="58"
                ry="16"
                fill="none"
                stroke="#fffbeb"
                strokeWidth="2.5"
                strokeDasharray="6,5"
                opacity="0.75"
              />

              {/* 左右兩座籃框 */}
              {renderHoop('left', currentRound.left)}
              {renderHoop('right', currentRound.right)}

              {/* 投籃位置陰影 */}
              <ellipse
                cx={ball.x}
                cy="336"
                rx={Math.max(10, 22 - (312 - ball.y) * 0.05)}
                ry="5"
                fill="#78350f"
                opacity="0.35"
              />

              {/* 互動籃球 */}
              <g transform={`translate(${ball.x}, ${ball.y}) scale(${ball.scale}) rotate(${ball.rotation})`}>
                <circle r="24" fill="#f97316" stroke="#7c2d12" strokeWidth="2.5" />
                {/* 籃球紋路 */}
                <line x1="-24" y1="0" x2="24" y2="0" stroke="#7c2d12" strokeWidth="2" />
                <line x1="0" y1="-24" x2="0" y2="24" stroke="#7c2d12" strokeWidth="2" />
                <path d="M -17 -17 Q -4 0 -17 17" fill="none" stroke="#7c2d12" strokeWidth="2" />
                <path d="M 17 -17 Q 4 0 17 17" fill="none" stroke="#7c2d12" strokeWidth="2" />
                <circle cx="-8" cy="-8" r="5" fill="#fed7aa" opacity="0.45" />
              </g>
            </svg>
          </div>
        </div>

        {/* 雙籃框投籃操作按鈕 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          <button
            type="button"
            disabled={phase !== 'ready'}
            onClick={() => shootAt('left')}
            className="bg-sky-50 hover:bg-sky-100 disabled:opacity-55 active:scale-[0.98] border-2 border-sky-400 text-sky-950 rounded-2xl py-3 px-4 font-black text-base sm:text-lg shadow-sm flex items-center justify-center gap-3 transition cursor-pointer disabled:cursor-default"
          >
            <span>🏀 投左邊籃框</span>
            <FractionDisplay num={currentRound.left.n} den={currentRound.left.d} />
          </button>

          <button
            type="button"
            disabled={phase !== 'ready'}
            onClick={() => shootAt('right')}
            className="bg-orange-50 hover:bg-orange-100 disabled:opacity-55 active:scale-[0.98] border-2 border-orange-400 text-orange-950 rounded-2xl py-3 px-4 font-black text-base sm:text-lg shadow-sm flex items-center justify-center gap-3 transition cursor-pointer disabled:cursor-default"
          >
            <span>🏀 投右邊籃框</span>
            <FractionDisplay num={currentRound.right.n} den={currentRound.right.d} />
          </button>
        </div>

        {/* 投籃結果回饋與下一球按鈕 */}
        {feedback && (
          <div
            className={`rounded-2xl p-4 border-2 font-bold text-sm sm:text-base flex flex-wrap items-center justify-between gap-3 animate-pop ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-rose-50 border-rose-400 text-rose-900'
            }`}
          >
            <span className="flex-1 min-w-[220px]">
              {feedback.type === 'success' ? '🎉 ' : '🏀 '}
              {feedback.msg}
            </span>

            {phase === 'scored' && (
              <button
                type="button"
                onClick={handleNextRound}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span>投下一球</span>
                <span>➡️</span>
              </button>
            )}

            {phase === 'finished' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resetChallenge}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  🔄 再玩一次
                </button>
                {onGoNextStage && (
                  <button
                    type="button"
                    onClick={onGoNextStage}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <span>前往「5.兩人討論」</span>
                    <span>➡️</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
