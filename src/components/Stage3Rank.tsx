import React, { useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

type RankMode = 'basic' | 'challenge' | 'random';

interface RankItem {
  n: number;
  d: number;
  val: number;
  hint: string;
}

const RANK_PRESETS: Record<'basic' | 'challenge', RankItem[]> = {
  basic: [
    { n: 1, d: 20, val: 1 / 20, hint: '分子為 1，平分 20 份最小' },
    { n: 1, d: 12, val: 1 / 12, hint: '同分子比較，1/12 > 1/20' },
    { n: 5, d: 12, val: 5 / 12, hint: '不到一半（6/12）' },
    { n: 4, d: 7, val: 4 / 7, hint: '超過一半（3.5/7）' },
    { n: 8, d: 9, val: 8 / 9, hint: '距離 1 只差 1/9，最大' },
  ],
  challenge: [
    { n: 1, d: 10, val: 1 / 10, hint: '分子為 1，最小' },
    { n: 7, d: 16, val: 7 / 16, hint: '不到一半（8/16）' },
    { n: 6, d: 11, val: 6 / 11, hint: '超過一半（5.5/11）' },
    { n: 9, d: 8, val: 9 / 8, hint: '大於 1（1又1/8）' },
    { n: 7, d: 6, val: 7 / 6, hint: '1又1/6，大於 1又1/8，最大' },
  ],
};

function generateRandomRankItems(): RankItem[] {
  const pool1 = [
    { n: 1, d: 20, hint: '分子為1，分母最大所以極小' },
    { n: 1, d: 18, hint: '只有1/18' },
    { n: 1, d: 15, hint: '分子為1' },
  ];
  const pool2 = [
    { n: 1, d: 6, hint: '同分子比較大於前者' },
    { n: 1, d: 4, hint: '四分之一' },
    { n: 3, d: 8, hint: '不到1/2（4/8）' },
  ];
  const pool3 = [
    { n: 5, d: 12, hint: '不到一半（6/12）' },
    { n: 7, d: 16, hint: '不到一半（8/16）' },
    { n: 8, d: 18, hint: '不到一半（9/18）' },
  ];
  const pool4 = [
    { n: 4, d: 7, hint: '超過一半（3.5/7）' },
    { n: 5, d: 9, hint: '超過一半（4.5/9）' },
    { n: 6, d: 11, hint: '超過一半（5.5/11）' },
  ];
  const pool5 = [
    { n: 7, d: 8, hint: '距離1只差1/8' },
    { n: 8, d: 9, hint: '距離1只差1/9' },
    { n: 7, d: 6, hint: '超過1（1又1/6）' },
  ];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return [pick(pool1), pick(pool2), pick(pool3), pick(pool4), pick(pool5)].map((item) => ({
    ...item,
    val: item.n / item.d,
  }));
}

function shuffleNotSorted(arr: RankItem[]): RankItem[] {
  const copy = [...arr];
  do {
    copy.sort(() => Math.random() - 0.5);
  } while (copy.every((v, i, a) => i === 0 || a[i - 1].val <= v.val));
  return copy;
}

interface Stage3RankProps {
  onRankComplete?: (mode: RankMode) => void;
}

export const Stage3Rank: React.FC<Stage3RankProps> = ({ onRankComplete }) => {
  const [mode, setMode] = useState<RankMode>('basic');
  const [items, setItems] = useState<RankItem[]>(() => shuffleNotSorted(RANK_PRESETS.basic));
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [checkedStatus, setCheckedStatus] = useState<boolean[] | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  const loadRankLevel = (nextMode: RankMode) => {
    setMode(nextMode);
    const baseList =
      nextMode === 'random' ? generateRandomRankItems() : [...RANK_PRESETS[nextMode]];
    setItems(shuffleNotSorted(baseList));
    setCheckedStatus(null);
  };

  const shuffleCurrentRank = () => {
    setItems(shuffleNotSorted(items));
    setCheckedStatus(null);
  };

  const moveRankCard = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setItems(copy);
    setCheckedStatus(null);
  };

  const checkRankAnswer = () => {
    const sortedCorrect = [...items].sort((a, b) => a.val - b.val);
    const status = items.map((item, idx) => Math.abs(item.val - sortedCorrect[idx].val) < 1e-9);
    setCheckedStatus(status);
    setCheckCount((c) => c + 1);
    if (status.every(Boolean)) {
      onRankComplete?.(mode);
    }
  };

  const allCorrect = checkedStatus !== null && checkedStatus.every(Boolean);

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            📊 數位分數排排站（由小到大）
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            不用通分！請用眼睛觀察特徵並拖曳卡片（或點左右箭頭），將 5 個分數<b>由小到大</b>排好！
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadRankLevel('basic')}
            className={
              mode === 'basic'
                ? 'bg-indigo-600 text-white font-bold px-3.5 py-2 rounded-xl text-sm shadow cursor-pointer'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer'
            }
          >
            ⭐ 基礎關（真分數挑戰）
          </button>
          <button
            type="button"
            onClick={() => loadRankLevel('challenge')}
            className={
              mode === 'challenge'
                ? 'bg-indigo-600 text-white font-bold px-3.5 py-2 rounded-xl text-sm shadow cursor-pointer'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer'
            }
          >
            🔥 挑戰關（含大於 1）
          </button>
          <button
            type="button"
            onClick={() => loadRankLevel('random')}
            className={
              mode === 'random'
                ? 'bg-indigo-600 text-white font-bold px-3.5 py-2 rounded-xl text-sm shadow cursor-pointer'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer'
            }
          >
            🎲 隨機出題
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-indigo-200 space-y-5">
        <div className="flex items-center justify-between text-sm font-black text-slate-500 px-2">
          <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-lg">⬅️ 最小（Least）</span>
          <span className="hidden sm:inline text-slate-400">
            拖曳卡片交換位置，或點擊卡片下方的 ◀ ▶ 移動
          </span>
          <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-lg">
            最大（Greatest）➡️
          </span>
        </div>

        {/* 5 張排序卡片容器 */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-stretch">
          {items.map((item, idx) => {
            let borderClass = 'border-indigo-300 bg-indigo-50/40';
            if (checkedStatus) {
              borderClass = checkedStatus[idx]
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-rose-500 bg-rose-50 animate-shake';
            }
            return (
              <div
                key={`${item.n}-${item.d}-${idx}-${checkedStatus && !checkedStatus[idx] ? checkCount : 0}`}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredIdx(idx);
                }}
                onDragLeave={() => setHoveredIdx(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredIdx(null);
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    const next = [...items];
                    const [moved] = next.splice(draggedIdx, 1);
                    next.splice(idx, 0, moved);
                    setItems(next);
                    setDraggedIdx(null);
                    setCheckedStatus(null);
                  }
                }}
                className={`rounded-2xl border-2 ${borderClass} ${
                  hoveredIdx === idx ? 'dropzone-hover' : ''
                } p-2 sm:p-3 flex flex-col items-center justify-between shadow-sm cursor-grab active:cursor-grabbing transition`}
              >
                <div className="mb-1">
                  {checkedStatus ? (
                    checkedStatus[idx] ? (
                      <span className="text-xs font-black text-emerald-600">✅ 正確</span>
                    ) : (
                      <span className="text-xs font-black text-rose-600">❌ 位置不對</span>
                    )
                  ) : (
                    <span className="text-xs font-black text-slate-400">第 {idx + 1} 格</span>
                  )}
                </div>

                <div className="my-2 text-indigo-900">
                  <FractionDisplay num={item.n} den={item.d} large />
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => moveRankCard(idx, -1)}
                    disabled={idx === 0}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 disabled:opacity-30 active:scale-90 cursor-pointer disabled:cursor-default"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRankCard(idx, 1)}
                    disabled={idx === 4}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 disabled:opacity-30 active:scale-90 cursor-pointer disabled:cursor-default"
                  >
                    ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 檢查答案按鈕 */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={checkRankAnswer}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-base sm:text-lg px-8 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <span>✅</span>
            <span>檢查排列順序</span>
          </button>
          <button
            type="button"
            onClick={shuffleCurrentRank}
            className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold px-5 py-3 rounded-2xl text-sm sm:text-base transition cursor-pointer"
          >
            🔄 重新打亂
          </button>
        </div>

        {/* 逐格解析區 */}
        {checkedStatus !== null && (
          <div
            className={`rounded-2xl p-4 border-2 space-y-2 ${
              allCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'
            }`}
          >
            <div className="font-black text-lg">
              {allCorrect ? (
                <span className="text-emerald-800">
                  🎉 完美過關！由小到大排列完全正確！看看每個分數的聰明算密碼：
                </span>
              ) : (
                <span className="text-rose-800">
                  💪 還有紅色框框的位置不對喔！提示：先找出「不到 1/2」和「超過 1/2」的分數分兩邊！
                </span>
              )}
            </div>
            {allCorrect && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                {items.map((item, idx) => (
                  <div
                    key={`${item.n}-${item.d}-${idx}`}
                    className="bg-white rounded-xl p-2 border border-emerald-200 text-center text-xs"
                  >
                    <div className="font-black text-indigo-800 text-sm mb-0.5">
                      {item.n}/{item.d}
                    </div>
                    <div className="text-slate-600">{item.hint}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
