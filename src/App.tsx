import { useState } from 'react';
import { CheatSheetModal } from './components/CheatSheetModal';
import { Stage0Warmup } from './components/Stage0Warmup';
import { Stage1Visual } from './components/Stage1Visual';
import { Stage2Sort } from './components/Stage2Sort';
import { Stage3Rank } from './components/Stage3Rank';
import { Stage4Maze } from './components/Stage4Maze';
import { Stage5Quiz } from './components/Stage5Quiz';

const TABS = [
  { id: 0, icon: '🔥', label: '0.通分暖身' },
  { id: 1, icon: '🔍', label: '1.圖形探究' },
  { id: 2, icon: '🗂️', label: '2.判斷方式' },
  { id: 3, icon: '📊', label: '3.排排站' },
  { id: 4, icon: '🏰', label: '4.迷宮挑戰' },
  { id: 5, icon: '📝', label: '5.課後小測驗' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col text-slate-800 bg-[#f0f7ff]">
      {/* 頂部導覽列 */}
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🧠</span>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-wide leading-tight">
                聰明算！分數比大小互動網
              </h1>
              <p className="text-xs text-blue-100 hidden sm:block">
                五年級數學：不用通分比較異分母分數的大小
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCheatSheetOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 px-3.5 py-1.5 rounded-xl text-sm sm:text-base font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>📜</span>
              <span>三招口訣小抄</span>
            </button>
          </div>
        </div>

        {/* 六大關卡分頁按鈕 */}
        <nav className="bg-indigo-900/40 backdrop-blur-sm border-t border-white/15">
          <div className="max-w-6xl mx-auto px-2 py-1.5 grid grid-cols-6 gap-1 sm:gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={
                  activeTab === tab.id
                    ? 'py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 transition bg-white text-indigo-700 shadow cursor-pointer'
                    : 'py-2 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 transition text-white hover:bg-white/15 cursor-pointer'
                }
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* 主內容區 */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5">
        {activeTab === 0 && <Stage0Warmup />}
        {activeTab === 1 && <Stage1Visual />}
        {activeTab === 2 && <Stage2Sort />}
        {activeTab === 3 && <Stage3Rank />}
        {activeTab === 4 && <Stage4Maze />}
        {activeTab === 5 && <Stage5Quiz />}
      </main>

      {/* 口訣小抄彈窗 */}
      <CheatSheetModal isOpen={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />
    </div>
  );
}
