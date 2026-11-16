import React, { useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

type ShapeType = 'pie' | 'bar';

const PRESET_NOTES: Record<string, string> = {
  ex1: '【策略1：同分子比大小】1/5 和 1/3：分子都是 1，把同一個圓平分成 5 份比平分成 3 份小，所以 1/5 < 1/3。',
  ex2: '【策略1：同分子比大小】2/7 和 2/5：分子都是 2，分母 7 > 5，平分越多份每份越小，所以 2/7 < 2/5。',
  ex3: '【策略1：假分數換帶分數（同分子比大小）】7/6 和 9/8：勾選「假分數顯示為帶分數」看看！7/6 = 1又1/6，9/8 = 1又1/8，整數都是 1，因為 1/6 > 1/8，所以 7/6 > 9/8！',
  ex4: '【策略2：跟 1 比差距】5/6 和 7/8：5/6 比 1 少 1/6，7/8 比 1 少 1/8。因為 1/8 < 1/6（缺得比較少），所以 7/8 > 5/6！',
  ex5: '【策略3：看有沒有超過一半】5/12 和 4/7：看看中間紅色「1/2 基準線」！5/12 不到一半（6/12），4/7 超過一半（3.5/7），所以 5/12 < 4/7！',
};

const BarVisualSVG: React.FC<{
  num: number;
  den: number;
  fillColor: string;
  showHalf: boolean;
  showGap: boolean;
}> = ({ num, den, fillColor, showHalf, showGap }) => {
  const wholes = Math.ceil(num / den);
  const totalBars = Math.max(1, wholes);
  const w = 280;
  const barH = 44;
  const totalH = totalBars * (barH + 14) + 22;
  const cellW = w / den;

  return (
    <svg viewBox={`0 0 ${w} ${totalH}`} className="w-full max-w-[300px] h-auto overflow-visible">
      {Array.from({ length: totalBars }).map((_, b) => {
        const yOffset = 16 + b * (barH + 14);
        const filledInThisBar = Math.min(den, Math.max(0, num - b * den));
        return (
          <g key={b}>
            {Array.from({ length: den }).map((__, i) => {
              const isFilled = i < filledInThisBar;
              const bg = isFilled ? fillColor : showGap && num < den ? '#ffe4e6' : '#ffffff';
              return (
                <rect
                  key={i}
                  x={i * cellW}
                  y={yOffset}
                  width={cellW}
                  height={barH}
                  fill={bg}
                  stroke="#334155"
                  strokeWidth="1.2"
                />
              );
            })}
            {showGap && num < den && b === 0 && (
              <>
                <rect
                  x={num * cellW}
                  y={yOffset}
                  width={(den - num) * cellW}
                  height={barH}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                />
                <text
                  x={num * cellW + ((den - num) * cellW) / 2}
                  y={yOffset + barH + 13}
                  textAnchor="middle"
                  fill="#e11d48"
                  fontSize="11"
                  fontWeight="bold"
                >
                  差 {den - num}/{den}
                </text>
              </>
            )}
          </g>
        );
      })}

      {showHalf && num <= den && (
        <>
          <line
            x1={w / 2}
            y1={4}
            x2={w / 2}
            y2={16 + barH + 6}
            stroke="#d97706"
            strokeWidth="3"
            strokeDasharray="5,4"
          />
          <text x={w / 2} y={11} textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="bold">
            1/2 基準線
          </text>
        </>
      )}
    </svg>
  );
};

const SinglePie: React.FC<{
  cx: number;
  cy: number;
  r: number;
  filledCount: number;
  den: number;
  fillColor: string;
  showHalf: boolean;
  showGap: boolean;
  totalNum: number;
}> = ({ cx, cy, r, filledCount, den, fillColor, showHalf, showGap, totalNum }) => (
  <g>
    {Array.from({ length: den }).map((_, i) => {
      const startAngle = (i * 2 * Math.PI) / den - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const isFilled = i < filledCount;
      const bg = isFilled ? fillColor : showGap && totalNum < den ? '#ffe4e6' : '#ffffff';
      const strokeCol = !isFilled && showGap && totalNum < den ? '#e11d48' : '#334155';
      return (
        <path
          key={i}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={bg}
          stroke={strokeCol}
          strokeWidth="1.2"
        />
      );
    })}
    {showHalf && totalNum <= den && (
      <>
        <line
          x1={cx}
          y1={cy - r - 8}
          x2={cx}
          y2={cy + r + 8}
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeDasharray="5,3"
        />
        <text x={cx} y={cy - r - 11} textAnchor="middle" fill="#e11d48" fontSize="11" fontWeight="bold">
          1/2
        </text>
      </>
    )}
  </g>
);

const PieVisualSVG: React.FC<{
  num: number;
  den: number;
  fillColor: string;
  showHalf: boolean;
  showGap: boolean;
}> = ({ num, den, fillColor, showHalf, showGap }) => {
  if (num <= den) {
    const cx = 90;
    const cy = 90;
    const r = 72;
    return (
      <svg viewBox="0 0 180 198" className="w-44 h-44 sm:w-48 sm:h-48 overflow-visible">
        <SinglePie
          cx={cx}
          cy={cy}
          r={r}
          filledCount={num}
          den={den}
          fillColor={fillColor}
          showHalf={showHalf}
          showGap={showGap}
          totalNum={num}
        />
        {showGap && num < den && (
          <text
            x={cx}
            y={cy + r + 16}
            textAnchor="middle"
            fill="#e11d48"
            fontSize="12"
            fontWeight="bold"
          >
            距離 1 還差 {den - num}/{den}
          </text>
        )}
      </svg>
    );
  }

  const r = 56;
  return (
    <svg viewBox="0 0 264 164" className="w-full max-w-[270px] h-auto overflow-visible">
      <SinglePie
        cx={68}
        cy={82}
        r={r}
        filledCount={den}
        den={den}
        fillColor={fillColor}
        showHalf={false}
        showGap={false}
        totalNum={num}
      />
      <SinglePie
        cx={196}
        cy={82}
        r={r}
        filledCount={num - den}
        den={den}
        fillColor={fillColor}
        showHalf={false}
        showGap={false}
        totalNum={num}
      />
    </svg>
  );
};

const FormattedFractionHeader: React.FC<{ num: number; den: number; showMixed: boolean }> = ({
  num,
  den,
  showMixed,
}) => {
  if (showMixed && num > den) {
    const whole = Math.floor(num / den);
    const rem = num % den;
    if (rem === 0) return <span className="text-3xl font-black">{whole}</span>;
    return (
      <div className="inline-flex items-center">
        <FractionDisplay num={num} den={den} large />
        <span className="text-base font-bold text-slate-400 mx-1">=</span>
        <FractionDisplay num={rem} den={den} whole={whole} large />
      </div>
    );
  }
  return <FractionDisplay num={num} den={den} large />;
};

export const Stage1Visual: React.FC = () => {
  const [leftNum, setLeftNum] = useState(1);
  const [leftDen, setLeftDen] = useState(5);
  const [rightNum, setRightNum] = useState(1);
  const [rightDen, setRightDen] = useState(3);
  const [shape, setShape] = useState<ShapeType>('pie');
  const [revealSymbol, setRevealSymbol] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('ex1');

  const [showHalfLine, setShowHalfLine] = useState(true);
  const [showGapHighlight, setShowGapHighlight] = useState(false);
  const [showMixedFormat, setShowMixedFormat] = useState(false);

  const [elfChoice, setElfChoice] = useState<'大' | '小' | null>(null);
  const [elfShakeCount, setElfShakeCount] = useState(0);

  const loadPreset = (
    lNum: number,
    lDen: number,
    rNum: number,
    rDen: number,
    presetKey: string
  ) => {
    setLeftNum(lNum);
    setLeftDen(lDen);
    setRightNum(rNum);
    setRightDen(rDen);
    setActivePreset(presetKey);
    setRevealSymbol(false);
    setShowMixedFormat(lNum > lDen || rNum > rDen);
    setShowGapHighlight(presetKey === 'ex4');
    setShowHalfLine(presetKey === 'ex5');
  };

  const adjustFrac = (side: 'left' | 'right', part: 'num' | 'den', delta: number) => {
    setActivePreset('');
    if (side === 'left') {
      if (part === 'den') {
        const nextDen = Math.min(24, Math.max(2, leftDen + delta));
        setLeftDen(nextDen);
        if (leftNum > nextDen * 2) setLeftNum(nextDen * 2);
      } else {
        setLeftNum(Math.min(leftDen * 2, Math.max(1, leftNum + delta)));
      }
    } else {
      if (part === 'den') {
        const nextDen = Math.min(24, Math.max(2, rightDen + delta));
        setRightDen(nextDen);
        if (rightNum > nextDen * 2) setRightNum(nextDen * 2);
      } else {
        setRightNum(Math.min(rightDen * 2, Math.max(1, rightNum + delta)));
      }
    }
  };

  const lVal = leftNum / leftDen;
  const rVal = rightNum / rightDen;
  let sym = '=';
  if (Math.abs(lVal - rVal) > 1e-9) sym = lVal > rVal ? '>' : '<';

  const lGap = leftDen - leftNum;
  const rGap = rightDen - rightNum;
  const isSameGapToOne = leftNum < leftDen && rightNum < rightDen && lGap === rGap && lGap > 0;

  const getInsightText = (): string => {
    const customNote = PRESET_NOTES[activePreset] || '';
    if (!revealSymbol) {
      if (customNote) {
        return customNote
          .replace(/，所以.*$/, '，猜猜看哪一個比較大？（點擊中間「？」框框揭曉答案）')
          .replace(/比平分成 3 份小.*$/, '，猜猜看哪一個比較大？（點擊中間「？」框框揭曉答案）');
      }
      if (Math.abs(lVal - rVal) < 1e-9) {
        return '觀察左右兩邊的塗色面積，它們一樣大嗎？（點擊中間「？」框框揭曉答案）';
      }
      if (leftNum === rightNum) {
        return `【策略1：同分子比大小】分子都是 ${leftNum}，觀察看看平分成 ${leftDen} 份和 ${rightDen} 份，哪一邊的每一份比較大？（點擊中間「？」框框揭曉答案）`;
      }
      if (leftNum > leftDen && rightNum > rightDen) {
        const lW = Math.floor(leftNum / leftDen);
        const lR = leftNum % leftDen;
        const rW = Math.floor(rightNum / rightDen);
        const rR = rightNum % rightDen;
        return `【策略1：假分數換帶分數比大小】${leftNum}/${leftDen} = ${lW}又${lR}/${leftDen}，${rightNum}/${rightDen} = ${rW}又${rR}/${rightDen}，比比看哪一邊比較大？（點擊中間「？」框框揭曉答案）`;
      }
      if (isSameGapToOne) {
        return `【策略2：跟 1 比差距】${leftNum}/${leftDen} 距離 1 差 ${lGap}/${leftDen}；${rightNum}/${rightDen} 距離 1 差 ${rGap}/${rightDen}。缺口分子都是 ${lGap}，缺得越少越接近 1，哪一個比較大？（點擊中間「？」框框揭曉答案）`;
      }
      if ((lVal < 0.5 && rVal > 0.5) || (lVal > 0.5 && rVal < 0.5)) {
        return '【策略3：看有沒有超過一半】看看「1/2 基準線」，哪一個超過一半、哪一個不到一半？（點擊中間「？」框框揭曉答案）';
      }
      return '觀察看看圓餅或長條的塗色面積，先猜猜看哪一邊比較大，再點擊中間「？」框框揭曉答案喔！';
    }

    if (customNote) return customNote;
    if (Math.abs(lVal - rVal) < 1e-9) return '這兩個是等值分數喔！塗色面積完全一樣大。';
    if (leftNum === rightNum) {
      return `【策略1：同分子比大小】分子都是 ${leftNum}，分母 ${Math.max(leftDen, rightDen)} 切得比較細（每份比較小），所以 ${
        leftDen > rightDen
          ? `${leftNum}/${leftDen} < ${rightNum}/${rightDen}`
          : `${leftNum}/${leftDen} > ${rightNum}/${rightDen}`
      }。`;
    }
    if (leftNum > leftDen && rightNum > rightDen) {
      const lW = Math.floor(leftNum / leftDen);
      const lR = leftNum % leftDen;
      const rW = Math.floor(rightNum / rightDen);
      const rR = rightNum % rightDen;
      return `【策略1：假分數換帶分數比大小】${leftNum}/${leftDen} = ${lW}又${lR}/${leftDen}，${rightNum}/${rightDen} = ${rW}又${rR}/${rightDen}，先比整數，整數相同再比分數部分！`;
    }
    if (isSameGapToOne) {
      const bigFrac = lVal > rVal ? `${leftNum}/${leftDen}` : `${rightNum}/${rightDen}`;
      return `【策略2：跟 1 比差距】${leftNum}/${leftDen} 距離 1 差 ${lGap}/${leftDen}；${rightNum}/${rightDen} 距離 1 差 ${rGap}/${rightDen}。缺越少越接近 1，所以 ${bigFrac} 比較大！`;
    }
    if ((lVal < 0.5 && rVal > 0.5) || (lVal > 0.5 && rVal < 0.5)) {
      const bigSide = lVal > 0.5 ? `${leftNum}/${leftDen}` : `${rightNum}/${rightDen}`;
      const smallSide = lVal < 0.5 ? `${leftNum}/${leftDen}` : `${rightNum}/${rightDen}`;
      return `【策略3：看有沒有超過一半】${bigSide} 超過一半（1/2），而 ${smallSide} 不到一半，不用通分就知道 ${bigSide} 比較大！`;
    }
    return '觀察看看圓餅或長條的塗色面積，也可以勾選上方的「顯示 1/2 基準線」或「顯示距離 1 的差距」來幫忙判斷喔！';
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-indigo-800">
              🔍 視覺圖形探究：不用通分怎麼比？
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              點選下方探究題組，或自由調整分子、分母，觀察塗色面積直接看出誰比較大！
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setShape('pie')}
              className={
                shape === 'pie'
                  ? 'px-3.5 py-1.5 rounded-lg font-bold text-sm bg-indigo-600 text-white shadow transition cursor-pointer'
                  : 'px-3.5 py-1.5 rounded-lg font-bold text-sm text-slate-600 hover:text-slate-900 transition cursor-pointer'
              }
            >
              🥧 圓餅圖
            </button>
            <button
              type="button"
              onClick={() => setShape('bar')}
              className={
                shape === 'bar'
                  ? 'px-3.5 py-1.5 rounded-lg font-bold text-sm bg-indigo-600 text-white shadow transition cursor-pointer'
                  : 'px-3.5 py-1.5 rounded-lg font-bold text-sm text-slate-600 hover:text-slate-900 transition cursor-pointer'
              }
            >
              🍫 長條圖
            </button>
          </div>
        </div>

        {/* 探究題組快捷鍵列 */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-black text-slate-500">🎯 探究任務：</span>
          <button
            type="button"
            onClick={() => loadPreset(1, 5, 1, 3, 'ex1')}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            任務① 1/5 和 1/3
          </button>
          <button
            type="button"
            onClick={() => loadPreset(2, 7, 2, 5, 'ex2')}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            任務② 2/7 和 2/5
          </button>
          <button
            type="button"
            onClick={() => loadPreset(7, 6, 9, 8, 'ex3')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            任務③ 7/6 和 9/8
          </button>
          <button
            type="button"
            onClick={() => loadPreset(5, 6, 7, 8, 'ex4')}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            任務④ 5/6 和 7/8
          </button>
          <button
            type="button"
            onClick={() => loadPreset(5, 12, 4, 7, 'ex5')}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            任務⑤ 5/12 和 4/7
          </button>
        </div>

        {/* 輔助顯示開關 */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHalfLine}
              onChange={(e) => setShowHalfLine(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span>📏 顯示「一半（1/2）」基準線</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showGapHighlight}
              onChange={(e) => setShowGapHighlight(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded"
            />
            <span>🧩 顯示「距離 1 的差距」</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showMixedFormat}
              onChange={(e) => setShowMixedFormat(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded"
            />
            <span>🔄 假分數顯示為帶分數</span>
          </label>
        </div>
      </div>

      {/* 互動發現填空卡 */}
      {(activePreset === 'ex1' || activePreset === 'ex2') && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-slate-800">
            <span className="text-2xl">🧚‍♂️</span>
            <div>
              觀察任務 ① 和 ② 的結果：分子相同時，分母越大（平分越多份），分數就越
              <span
                key={`elf-${elfChoice}-${elfShakeCount}`}
                className={
                  elfChoice === '小'
                    ? 'inline-block min-w-[3.5rem] text-center px-2.5 py-0.5 mx-1 rounded-lg border-2 border-emerald-500 bg-emerald-100 font-black text-emerald-800 animate-pop'
                    : elfChoice === '大'
                      ? 'inline-block min-w-[3.5rem] text-center px-2.5 py-0.5 mx-1 rounded-lg border-2 border-rose-500 bg-rose-100 font-black text-rose-700 animate-shake'
                      : 'inline-block min-w-[3.5rem] text-center px-2.5 py-0.5 mx-1 rounded-lg border-2 border-dashed border-amber-500 bg-white font-black text-amber-700'
                }
              >
                {elfChoice === '小' ? '小 ✔' : elfChoice === '大' ? '再想想' : '？'}
              </span>
              ！
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setElfChoice('大');
                setElfShakeCount((c) => c + 1);
              }}
              className="bg-white hover:bg-amber-100 border-2 border-amber-400 font-black px-5 py-1.5 rounded-xl text-base cursor-pointer"
            >
              大
            </button>
            <button
              type="button"
              onClick={() => setElfChoice('小')}
              className="bg-white hover:bg-amber-100 border-2 border-amber-400 font-black px-5 py-1.5 rounded-xl text-base cursor-pointer"
            >
              小
            </button>
          </div>
        </div>
      )}

      {/* 左右雙分數視覺對比舞台 */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* 左側分數卡片 */}
        <div className="md:col-span-5 bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-sky-200 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg">
              左邊分數
            </span>
            <div className="text-sky-900">
              <FormattedFractionHeader num={leftNum} den={leftDen} showMixed={showMixedFormat} />
            </div>
          </div>

          <div className="min-h-[195px] flex items-center justify-center w-full py-2">
            {shape === 'bar' ? (
              <BarVisualSVG
                num={leftNum}
                den={leftDen}
                fillColor="#38bdf8"
                showHalf={showHalfLine}
                showGap={showGapHighlight}
              />
            ) : (
              <PieVisualSVG
                num={leftNum}
                den={leftDen}
                fillColor="#bae6fd"
                showHalf={showHalfLine}
                showGap={showGapHighlight}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-100 text-xs sm:text-sm font-bold">
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span>
                分子：<b className="text-sky-700">{leftNum}</b>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => adjustFrac('left', 'num', -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => adjustFrac('left', 'num', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span>
                分母：<b className="text-sky-700">{leftDen}</b>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => adjustFrac('left', 'den', -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => adjustFrac('left', 'den', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 中央比較符號 */}
        <div className="md:col-span-1 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setRevealSymbol((r) => !r)}
            title="點擊切換顯示或隱藏大小符號"
            className={
              revealSymbol
                ? 'w-16 h-16 rounded-2xl bg-amber-400 text-slate-900 shadow-lg flex items-center justify-center text-4xl font-black border-4 border-white cursor-pointer transition active:scale-95'
                : 'w-16 h-16 rounded-2xl bg-slate-700 text-white shadow-lg flex items-center justify-center text-3xl font-black border-4 border-white cursor-pointer transition active:scale-95'
            }
          >
            {revealSymbol ? sym : '?'}
          </button>
          <button
            type="button"
            onClick={() => setRevealSymbol((r) => !r)}
            className="text-xs font-bold text-indigo-600 hover:underline whitespace-nowrap cursor-pointer"
          >
            {revealSymbol ? '隱藏大小符號' : '顯示大小符號'}
          </button>
        </div>

        {/* 右側分數卡片 */}
        <div className="md:col-span-5 bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-emerald-200 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
              右邊分數
            </span>
            <div className="text-emerald-900">
              <FormattedFractionHeader num={rightNum} den={rightDen} showMixed={showMixedFormat} />
            </div>
          </div>

          <div className="min-h-[195px] flex items-center justify-center w-full py-2">
            {shape === 'bar' ? (
              <BarVisualSVG
                num={rightNum}
                den={rightDen}
                fillColor="#86efac"
                showHalf={showHalfLine}
                showGap={showGapHighlight}
              />
            ) : (
              <PieVisualSVG
                num={rightNum}
                den={rightDen}
                fillColor="#bbf7d0"
                showHalf={showHalfLine}
                showGap={showGapHighlight}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-100 text-xs sm:text-sm font-bold">
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span>
                分子：<b className="text-emerald-700">{rightNum}</b>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => adjustFrac('right', 'num', -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => adjustFrac('right', 'num', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span>
                分母：<b className="text-emerald-700">{rightDen}</b>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => adjustFrac('right', 'den', -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => adjustFrac('right', 'den', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black active:scale-90 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 智慧觀察提示框 */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div className="text-sm sm:text-base text-indigo-950 font-bold leading-relaxed">
          {getInsightText()}
        </div>
      </div>
    </section>
  );
};
