import React, { useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

interface SortCardItem {
  id: string;
  tag: string;
  f1: { n: number; d: number; w?: number };
  f2: { n: number; d: number; w?: number };
  sym: '>' | '<' | '=';
  cat: 1 | 2 | 3;
  tip: string;
}

const SORT_CARDS_DATA: SortCardItem[] = [
  { id: 'c1', tag: '練習 1', f1: { n: 1, d: 5 }, f2: { n: 1, d: 8 }, sym: '>', cat: 1, tip: '1/5 > 1/8！分子都是 1，分母 5 < 8，平分越少份每份越大。' },
  { id: 'c2', tag: '練習 2', f1: { n: 1, d: 16 }, f2: { n: 1, d: 12 }, sym: '<', cat: 1, tip: '1/16 < 1/12！分子都是 1，分母 16 > 12，所以 1/16 比較小。' },
  { id: 'c3', tag: '練習 3', f1: { n: 3, d: 7 }, f2: { n: 3, d: 10 }, sym: '>', cat: 1, tip: '3/7 > 3/10！分子都是 3，平分成 7 份比平分成 10 份每一份都更大。' },
  { id: 'c4', tag: '練習 4', f1: { n: 8, d: 7 }, f2: { n: 10, d: 9 }, sym: '>', cat: 1, tip: '8/7 > 10/9！換成帶分數是 1又1/7 和 1又1/9，因為 1/7 > 1/9，所以 8/7 > 10/9。' },
  { id: 'c5', tag: '練習 5', f1: { n: 7, d: 8 }, f2: { n: 8, d: 9 }, sym: '<', cat: 2, tip: '7/8 < 8/9！7/8 距離 1 差 1/8，8/9 距離 1 差 1/9，缺得越少越大！' },
  { id: 'c6', tag: '練習 6', f1: { n: 7, d: 9 }, f2: { n: 9, d: 11 }, sym: '<', cat: 2, tip: '7/9 < 9/11！7/9 距離 1 差 2/9，9/11 距離 1 差 2/11；因為 2/11 < 2/9（缺得比較少），所以 9/11 比較大！' },
  { id: 'c7', tag: '練習 7', f1: { n: 11, d: 13 }, f2: { n: 5, d: 7 }, sym: '>', cat: 2, tip: '11/13 > 5/7！11/13 距離 1 差 2/13，5/7 距離 1 差 2/7；因為 2/13 < 2/7（缺得比較少），所以 11/13 比較大！' },
  { id: 'c8', tag: '練習 8', f1: { n: 15, d: 17 }, f2: { n: 17, d: 19 }, sym: '<', cat: 2, tip: '15/17 < 17/19！15/17 距離 1 差 2/17，17/19 距離 1 差 2/19，缺得越少越接近 1！' },
  { id: 'c9', tag: '練習 9', f1: { n: 5, d: 12 }, f2: { n: 4, d: 7 }, sym: '<', cat: 3, tip: '5/12 < 4/7！5/12 不到一半（6/12），4/7 超過一半（3.5/7），不用通分就能比！' },
  { id: 'c10', tag: '練習 10', f1: { n: 6, d: 11 }, f2: { n: 7, d: 16 }, sym: '>', cat: 3, tip: '6/11 > 7/16！6/11 超過一半（5.5/11），7/16 不到一半（8/16），所以 6/11 比較大！' },
  { id: 'c11', tag: '練習 11', f1: { n: 3, d: 8 }, f2: { n: 5, d: 9 }, sym: '<', cat: 3, tip: '3/8 < 5/9！3/8 不到一半（4/8），5/9 超過一半（4.5/9），輕鬆分出大小！' },
  { id: 'c12', tag: '練習 12', f1: { n: 11, d: 20 }, f2: { n: 8, d: 18 }, sym: '>', cat: 3, tip: '11/20 > 8/18！11/20 超過一半（10/20），8/18 不到一半（9/18），所以 11/20 比較大！' },
];

function shuffleCards(): SortCardItem[] {
  return [...SORT_CARDS_DATA].sort(() => Math.random() - 0.5);
}

interface Stage2SortProps {
  onSortProgress?: (completedCount: number) => void;
}

export const Stage2Sort: React.FC<Stage2SortProps> = ({ onSortProgress }) => {
  const [poolCards, setPoolCards] = useState<SortCardItem[]>(() => shuffleCards());
  const [bins, setBins] = useState<Record<1 | 2 | 3, SortCardItem[]>>({ 1: [], 2: [], 3: [] });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredBin, setHoveredBin] = useState<1 | 2 | 3 | null>(null);
  const [shakeCard, setShakeCard] = useState<{ id: string; count: number } | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    msg: string;
  } | null>(null);

  const completedCount = bins[1].length + bins[2].length + bins[3].length;

  const initSortGame = () => {
    setPoolCards(shuffleCards());
    setBins({ 1: [], 2: [], 3: [] });
    setSelectedCardId(null);
    setHoveredBin(null);
    setShakeCard(null);
    setFeedback(null);
  };

  const attemptPlaceCard = (cardId: string, binCat: 1 | 2 | 3) => {
    const cardData = poolCards.find((c) => c.id === cardId);
    if (!cardData) return;

    if (cardData.cat === binCat) {
      const nextCount = completedCount + 1;
      setPoolCards((prev) => prev.filter((c) => c.id !== cardId));
      setBins((prev) => ({ ...prev, [binCat]: [...prev[binCat], cardData] }));
      setSelectedCardId(null);
      onSortProgress?.(nextCount);
      if (nextCount === SORT_CARDS_DATA.length) {
        setFeedback({
          type: 'success',
          msg: '🎉 太棒了！12 題「判斷方式大分類」全部挑戰完成！',
        });
      } else {
        setFeedback({ type: 'success', msg: `✅ 答對了！${cardData.tip}` });
      }
    } else {
      setShakeCard((prev) => ({ id: cardId, count: (prev?.count || 0) + 1 }));
      setFeedback({
        type: 'error',
        msg: '🤔 再想一想喔！觀察看看分子一樣、還是都比 1 少一點（差 1 份或差 2 份），或是看看有沒有超過一半！',
      });
    }
  };

  const handleBinClick = (binCat: 1 | 2 | 3) => {
    if (!selectedCardId) {
      setFeedback({
        type: 'warning',
        msg: '👆 請先點選上方的一張白色分數題卡，再點選判斷方式箱喔！',
      });
      return;
    }
    attemptPlaceCard(selectedCardId, binCat);
  };

  const binConfigs: Array<{
    id: 1 | 2 | 3;
    title: string;
    subtitle: string;
    containerClass: string;
    headerClass: string;
    subTextClass: string;
  }> = [
    {
      id: 1,
      title: '第 1 招：同分子比大小',
      subtitle: '分子一樣（或帶分數整數相同）',
      containerClass: 'bg-sky-50 border-3 border-sky-300 hover:border-sky-500',
      headerClass: 'bg-sky-600 text-white',
      subTextClass: 'text-sky-100',
    },
    {
      id: 2,
      title: '第 2 招：跟「1」比差距',
      subtitle: '都比 1 少一點（差 1 份或差 2 份）',
      containerClass: 'bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500',
      headerClass: 'bg-emerald-600 text-white',
      subTextClass: 'text-emerald-100',
    },
    {
      id: 3,
      title: '第 3 招：看有沒有超過一半',
      subtitle: '一個超過一半(1/2)，一個不到一半',
      containerClass: 'bg-amber-50 border-3 border-amber-300 hover:border-amber-500',
      headerClass: 'bg-amber-500 text-slate-900',
      subTextClass: 'text-amber-950',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            🗂️ 判斷方式大分類：這題要用哪一招？
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            先點選一張題卡（或直接拖曳），再點選下方對應的判斷方式箱！答對就會揭曉大小符號喔！
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 font-black text-indigo-800 text-sm">
            已完成：<span className="text-lg text-indigo-600">{completedCount}</span> / 12
          </div>
          <button
            type="button"
            onClick={initSortGame}
            className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer"
          >
            🔄 重新洗牌
          </button>
        </div>
      </div>

      {/* 即時答題回饋橫幅 */}
      {feedback && (
        <div
          className={`rounded-2xl p-3.5 font-bold text-sm sm:text-base transition-all border ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : feedback.type === 'error'
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* 待分類題卡池 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-slate-300 min-h-[120px]">
        <div className="text-xs font-black text-slate-400 mb-2 flex items-center justify-between">
          <span>👇 待分類分數題卡（點選卡片再點下方箱子，或直接拖曳）</span>
          <span className="text-amber-600 font-bold">
            {selectedCardId ? '✨ 已選取題卡！請點選下方對應的判斷方式箱' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center">
          {poolCards.map((item) => {
            const isSelected = selectedCardId === item.id;
            const isShaking = shakeCard?.id === item.id;
            return (
              <div
                key={`${item.id}-${isShaking ? shakeCard.count : 0}`}
                draggable
                onClick={() => setSelectedCardId(isSelected ? null : item.id)}
                onDragStart={(e) => {
                  setSelectedCardId(item.id);
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                className={`cursor-pointer bg-white hover:bg-indigo-50 border-2 border-indigo-300 rounded-xl px-3.5 py-2.5 shadow-sm flex flex-col items-center justify-center text-slate-800 transition-all ${
                  isSelected ? 'card-selected' : ''
                } ${isShaking ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <FractionDisplay num={item.f1.n} den={item.f1.d} whole={item.f1.w || 0} />
                  <span className="w-5 h-5 rounded border border-slate-300 text-xs font-black text-slate-400 flex items-center justify-center">
                    ?
                  </span>
                  <FractionDisplay num={item.f2.n} den={item.f2.d} whole={item.f2.w || 0} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 三個判斷方式目標箱 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {binConfigs.map((bin) => (
          <div
            key={bin.id}
            onClick={() => handleBinClick(bin.id)}
            onDragOver={(e) => {
              e.preventDefault();
              setHoveredBin(bin.id);
            }}
            onDragLeave={() => setHoveredBin(null)}
            onDrop={(e) => {
              e.preventDefault();
              setHoveredBin(null);
              const cardId = e.dataTransfer.getData('text/plain') || selectedCardId;
              if (cardId) attemptPlaceCard(cardId, bin.id);
            }}
            className={`${bin.containerClass} rounded-2xl p-3.5 min-h-[220px] flex flex-col cursor-pointer transition ${
              hoveredBin === bin.id ? 'dropzone-hover' : ''
            }`}
          >
            <div className={`${bin.headerClass} rounded-xl p-2.5 text-center shadow-sm mb-3`}>
              <div className="font-black text-base sm:text-lg">{bin.title}</div>
              <div className={`text-xs ${bin.subTextClass}`}>{bin.subtitle}</div>
            </div>
            <div className="flex-1 flex flex-wrap content-start gap-2">
              {bins[bin.id].map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-emerald-500 rounded-xl px-3 py-2 shadow-sm flex flex-col items-center justify-center text-slate-800 animate-pop pointer-events-none text-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <FractionDisplay num={item.f1.n} den={item.f1.d} whole={item.f1.w || 0} />
                    <span className="w-6 h-6 rounded bg-emerald-100 border border-emerald-500 text-sm font-black text-emerald-800 flex items-center justify-center">
                      {item.sym}
                    </span>
                    <FractionDisplay num={item.f2.n} den={item.f2.d} whole={item.f2.w || 0} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
