import { useCallback, useEffect, useState } from 'react';
import { CheatSheetModal } from './components/CheatSheetModal';
import { FullscreenButton } from './components/FullscreenButton';
import { RoleEntryScreen } from './components/RoleEntryScreen';
import { Stage0Warmup } from './components/Stage0Warmup';
import { Stage1Visual } from './components/Stage1Visual';
import { Stage2Sort } from './components/Stage2Sort';
import { Stage3Rank } from './components/Stage3Rank';
import { Stage4Basketball } from './components/Stage4Basketball';
import { Stage5PairDiscuss } from './components/Stage5PairDiscuss';
import { Stage5Quiz } from './components/Stage5Quiz';
import { TeacherProgressModal } from './components/TeacherProgressModal';
import {
  ensureStudentRecord,
  recordStudentProgress,
  SEAT_PATTERN,
  StudentProgressPatch,
} from './services/progressService';

type RoleState =
  | { role: 'student'; seatNumber: string }
  | { role: 'teacher' }
  | null;

const ROLE_STORAGE_KEY = 'math_fraction_role_state';

const TABS = [
  { id: 0, icon: '🔥', label: '0.通分暖身' },
  { id: 1, icon: '🔍', label: '1.圖形探究' },
  { id: 2, icon: '🗂️', label: '2.判斷方式' },
  { id: 3, icon: '📊', label: '3.排排站' },
  { id: 4, icon: '🏀', label: '4.投籃大挑戰' },
  { id: 5, icon: '🤝', label: '5.兩人討論' },
  { id: 6, icon: '📝', label: '6.課後小測驗' },
] as const;

function loadSavedRoleState(): RoleState {
  try {
    const raw = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'role' in parsed &&
      parsed.role === 'teacher'
    ) {
      return { role: 'teacher' };
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      'role' in parsed &&
      parsed.role === 'student' &&
      'seatNumber' in parsed &&
      typeof parsed.seatNumber === 'string' &&
      SEAT_PATTERN.test(parsed.seatNumber)
    ) {
      return { role: 'student', seatNumber: parsed.seatNumber };
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [roleState, setRoleState] = useState<RoleState>(() => loadSavedRoleState());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (roleState) {
        sessionStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roleState));
      } else {
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
      }
    } catch {
      // ignore storage issues in restricted iframes
    }
  }, [roleState]);

  const studentSeat = roleState?.role === 'student' ? roleState.seatNumber : null;

  useEffect(() => {
    if (studentSeat) {
      void ensureStudentRecord(studentSeat).catch(console.error);
    }
  }, [studentSeat]);

  const syncStudentProgress = useCallback(
    (patch: StudentProgressPatch) => {
      if (!studentSeat) return;
      void recordStudentProgress(studentSeat, patch).catch(console.error);
    },
    [studentSeat]
  );

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    if (studentSeat) {
      syncStudentProgress({ lastStage: tabId });
    }
  };

  const handlePresetExplore = useCallback(
    (presetKey: string) => {
      syncStudentProgress({ addVisualPreset: presetKey });
    },
    [syncStudentProgress]
  );

  const handleElfSolved = useCallback(() => {
    syncStudentProgress({ elfBlankSolved: true });
  }, [syncStudentProgress]);

  if (!roleState) {
    return (
      <RoleEntryScreen
        onEnterStudent={(seatNumber) => {
          setActiveTab(0);
          setRoleState({ role: 'student', seatNumber });
        }}
        onEnterTeacher={() => {
          setActiveTab(0);
          setRoleState({ role: 'teacher' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800 bg-[#f0f7ff]">
      {/* 頂部導覽列 */}
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
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

            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black">
              <span>
                {roleState.role === 'teacher'
                  ? '👨‍🏫 教師版'
                  : `👩‍🎓 座號：${roleState.seatNumber} 號`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setProgressModalOpen(false);
                  setCheatSheetOpen(false);
                  setRoleState(null);
                }}
                className="ml-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                切換身分
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {roleState.role === 'teacher' && (
              <button
                type="button"
                onClick={() => setProgressModalOpen(true)}
                className="bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-900 px-3.5 py-1.5 rounded-xl text-sm sm:text-base font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>📊</span>
                <span>查看學生進度</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCheatSheetOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 px-3.5 py-1.5 rounded-xl text-sm sm:text-base font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>📜</span>
              <span>三招口訣小抄</span>
            </button>

            <FullscreenButton />
          </div>
        </div>

        {/* 七大關卡分頁按鈕 */}
        <nav className="bg-indigo-900/40 backdrop-blur-sm border-t border-white/15">
          <div className="max-w-6xl mx-auto px-2 py-1.5 grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
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
        {activeTab === 0 && (
          <Stage0Warmup
            onWarmupComplete={(problemIdx) =>
              syncStudentProgress({ addWarmupIdx: problemIdx, lastStage: 0 })
            }
            onGoNextStage={() => handleTabChange(1)}
          />
        )}
        {activeTab === 1 && (
          <Stage1Visual
            onPresetExplore={handlePresetExplore}
            onElfSolved={handleElfSolved}
          />
        )}
        {activeTab === 2 && (
          <Stage2Sort
            onSortProgress={(completedCount) =>
              syncStudentProgress({ sortCompleted: completedCount, lastStage: 2 })
            }
          />
        )}
        {activeTab === 3 && (
          <Stage3Rank
            onRankComplete={(mode) =>
              syncStudentProgress({ addRankMode: mode, lastStage: 3 })
            }
          />
        )}
        {activeTab === 4 && (
          <Stage4Basketball
            onChallengeComplete={() =>
              syncStudentProgress({ mazeCompleted: true, lastStage: 4 })
            }
            onGoNextStage={() => handleTabChange(5)}
          />
        )}
        {activeTab === 5 && (
          <Stage5PairDiscuss onGoNextStage={() => handleTabChange(6)} />
        )}
        {activeTab === 6 && (
          <Stage5Quiz
            onQuizSubmit={(score, correctCount) =>
              syncStudentProgress({
                quizResult: { score, correctCount },
                lastStage: 6,
              })
            }
          />
        )}
      </main>

      {/* 口訣小抄彈窗 */}
      <CheatSheetModal isOpen={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />

      {/* 教師查看學生進度彈窗 */}
      {roleState.role === 'teacher' && (
        <TeacherProgressModal
          isOpen={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
        />
      )}
    </div>
  );
}
