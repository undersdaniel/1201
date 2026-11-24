import React, { useEffect, useState } from 'react';
import {
  deleteStudentProgress,
  StudentProgressRecord,
  subscribeAllStudentProgress,
} from '../services/progressService';

interface TeacherProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGE_NAMES = [
  '0.通分暖身',
  '1.圖形探究',
  '2.判斷方式',
  '3.排排站',
  '4.投籃大挑戰',
  '5.兩人討論',
  '6.課後小測驗',
];

function formatTime(ts?: { toDate?: () => Date } | null): string {
  if (!ts || typeof ts.toDate !== 'function') return '剛剛';
  const d = ts.toDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export const TeacherProgressModal: React.FC<TeacherProgressModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<StudentProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seatFilter, setSeatFilter] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDeleteSeat, setConfirmDeleteSeat] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setErrorMsg(null);
    const unsub = subscribeAllStudentProgress(
      (data) => {
        setRecords(data);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(`讀取學生進度失敗：${err.message}`);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = seatFilter.trim()
    ? records.filter((r) => r.seatNumber.includes(seatFilter.trim()))
    : records;

  const quizSubmittedList = records.filter((r) => r.quizSubmitted);
  const avgScore =
    quizSubmittedList.length > 0
      ? Math.round(
          quizSubmittedList.reduce((acc, r) => acc + r.quizScore, 0) / quizSubmittedList.length
        )
      : null;
  const basketballDoneCount = records.filter((r) => r.mazeCompleted).length;

  const handleDeleteOne = async (seat: string) => {
    try {
      await deleteStudentProgress(seat);
      setConfirmDeleteSeat(null);
    } catch {
      setErrorMsg(`刪除座號 ${seat} 紀錄時發生錯誤`);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      for (const r of records) {
        await deleteStudentProgress(r.seatNumber);
      }
      setConfirmClearAll(false);
    } catch {
      setErrorMsg('清除全部紀錄時發生錯誤');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-indigo-400 animate-pop overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black">全班學生學習進度總覽（即時同步）</h3>
              <p className="text-xs text-indigo-100">
                學生於學生版輸入座號作答後，進度與測驗成績會即時更新於此處
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 font-black text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Summary KPI & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-3 border border-indigo-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500">已登入學生</div>
              <div className="text-2xl font-black text-indigo-700 tabular-nums">
                {records.length} 人
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500">投籃通關人數</div>
              <div className="text-2xl font-black text-emerald-700 tabular-nums">
                {basketballDoneCount} 人
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-amber-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500">已交小測驗</div>
              <div className="text-2xl font-black text-amber-600 tabular-nums">
                {quizSubmittedList.length} 人
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-sky-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500">測驗平均分</div>
              <div className="text-2xl font-black text-sky-700 tabular-nums">
                {avgScore !== null ? `${avgScore} 分` : '—'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <input
              type="text"
              value={seatFilter}
              onChange={(e) => setSeatFilter(e.target.value)}
              placeholder="🔍 搜尋座號..."
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            />

            {records.length > 0 && (
              <div className="flex items-center gap-2">
                {confirmClearAll ? (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800">
                    <span>確定清除全部 {records.length} 筆學生紀錄？</span>
                    <button
                      type="button"
                      disabled={clearing}
                      onClick={handleClearAll}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      {clearing ? '清除中...' : '確定清除'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    🗑️ 重置全班紀錄
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          {errorMsg && (
            <div className="mb-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl p-3 text-sm font-bold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 font-bold text-slate-500">載入學生進度中...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="text-4xl">📭</div>
              <div className="font-black text-slate-700 text-base">
                {records.length === 0
                  ? '目前還沒有學生登入作答紀錄'
                  : '找不到符合該座號的學生紀錄'}
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                請學生選擇「學生版」並輸入座號開始闖關，這裡就會即時顯示進度！
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-200">
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">座號</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">目前關卡</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">0.通分暖身</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">1.圖形探究</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">2.判斷方式</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">3.排排站</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">4.投籃大挑戰</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">6.課後測驗</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap">最後更新</th>
                    <th className="py-2.5 px-3 font-black whitespace-nowrap text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((rec) => (
                    <tr key={rec.seatNumber} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-black text-indigo-800 whitespace-nowrap">
                        {rec.seatNumber} 號
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700 whitespace-nowrap">
                        {STAGE_NAMES[rec.lastStage] ?? '0.通分暖身'}
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span
                          className={
                            rec.warmupCompleted.length >= 3 ? 'text-emerald-700' : 'text-slate-600'
                          }
                        >
                          {rec.warmupCompleted.length} / 3 題
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span className="text-slate-700">
                          {rec.visualPresetsExplored.length} / 5 任務
                        </span>
                        {rec.elfBlankSolved && (
                          <span className="ml-1 text-emerald-600" title="完成發現填空">
                            ✔
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span
                          className={
                            rec.sortCompleted >= 12 ? 'text-emerald-700' : 'text-slate-600'
                          }
                        >
                          {rec.sortCompleted} / 12 張
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span
                          className={
                            rec.rankCompletedModes.length >= 1
                              ? 'text-emerald-700'
                              : 'text-slate-600'
                          }
                        >
                          {rec.rankCompletedModes.length} / 3 關
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        {rec.mazeCompleted ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg">
                            🏀 已通關
                          </span>
                        ) : (
                          <span className="text-slate-400">未通關</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-black whitespace-nowrap tabular-nums">
                        {rec.quizSubmitted ? (
                          <span
                            className={`px-2 py-0.5 rounded-lg ${
                              rec.quizScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.quizScore >= 60
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.quizScore} 分 ({rec.quizCorrectCount}/10)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">未交卷</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                        {formatTime(rec.updatedAt)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {confirmDeleteSeat === rec.seatNumber ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteOne(rec.seatNumber)}
                              className="bg-rose-600 text-white px-2 py-0.5 rounded text-xs font-bold cursor-pointer"
                            >
                              確認
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSeat(null)}
                              className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold cursor-pointer"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSeat(rec.seatNumber)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
                          >
                            刪除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
