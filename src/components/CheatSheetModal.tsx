import React from 'react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-400 space-y-4 animate-pop">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xl sm:text-2xl font-black text-indigo-800 flex items-center gap-2">
            <span>📜</span>
            <span>不用通分！三招聰明算口訣</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 font-black text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm sm:text-base">
          <div className="bg-sky-50 border-l-4 border-sky-500 p-3 rounded-r-xl">
            <div className="font-black text-sky-900">第一招：同分子比大小（含帶分數整數相同）</div>
            <p className="text-slate-700 mt-0.5">
              分子一樣大時，<b>分母越大，分數越小</b>（平分越多份，每份越小）。
              <br />
              例：<span className="font-bold text-sky-700">1/5 &lt; 1/3</span>、
              <span className="font-bold text-sky-700">7/6 (1又1/6) &gt; 9/8 (1又1/8)</span>
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl">
            <div className="font-black text-emerald-900">第二招：跟「1」比差距</div>
            <p className="text-slate-700 mt-0.5">
              兩個分數都比 1 少一點點時，<b>缺越少，分數越大</b>。
              <br />
              例：<span className="font-bold text-emerald-700">5/6</span> 缺 1/6，
              <span className="font-bold text-emerald-700">7/8</span> 只缺 1/8，所以{' '}
              <span className="font-bold text-emerald-700">7/8 &gt; 5/6</span>
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl">
            <div className="font-black text-amber-900">第三招：看有沒有超過一半（1/2）</div>
            <p className="text-slate-700 mt-0.5">
              看看誰超過一半、誰不到一半，就能直接比！
              <br />
              例：<span className="font-bold text-amber-700">4/7</span> 超過一半(3.5/7)，
              <span className="font-bold text-amber-700">5/12</span> 不到一半(6/12)，所以{' '}
              <span className="font-bold text-amber-700">4/7 &gt; 5/12</span>
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-2.5 rounded-xl shadow cursor-pointer"
          >
            我知道了，繼續闖關！
          </button>
        </div>
      </div>
    </div>
  );
};
