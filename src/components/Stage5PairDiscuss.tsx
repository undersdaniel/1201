import React, { useEffect, useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

type DiscussionTaskId = 1 | 2 | 3;

interface DeckFraction {
  id: string;
  n: number;
  d: number;
  val: number;
}

const PAIR_DECK: DeckFraction[] = [
  { id: '3/7', n: 3, d: 7, val: 3 / 7 },
  { id: '3/10', n: 3, d: 10, val: 3 / 10 },
  { id: '3/8', n: 3, d: 8, val: 3 / 8 },
  { id: '5/12', n: 5, d: 12, val: 5 / 12 },
  { id: '4/7', n: 4, d: 7, val: 4 / 7 },
  { id: '5/6', n: 5, d: 6, val: 5 / 6 },
  { id: '7/8', n: 7, d: 8, val: 7 / 8 },
  { id: '8/9', n: 8, d: 9, val: 8 / 9 },
];

type StrategyKey = 'sameNum' | 'gapToOne' | 'halfLine';

const STRATEGY_INFO: Record<
  StrategyKey,
  { title: string; ruleDesc: string; check: (a: DeckFraction, b: DeckFraction) => boolean }
> = {
  sameNum: {
    title: '第 1 招：同分子比大小',
    ruleDesc: '挑兩個「分子一樣」的分數（例如 3/7 和 3/10）',
    check: (a, b) => a.n === b.n && a.d !== b.d,
  },
  gapToOne: {
    title: '第 2 招：跟「1」比差距',
    ruleDesc: '挑兩個「都比 1 少 1 份」的分數（例如 5/6、7/8、8/9）',
    check: (a, b) => a.d - a.n === 1 && b.d - b.n === 1 && a.d !== b.d,
  },
  halfLine: {
    title: '第 3 招：看有沒有超過一半',
    ruleDesc: '挑「一個不到 1/2」和「一個超過 1/2」的分數',
    check: (a, b) => (a.val < 0.5 && b.val > 0.5) || (a.val > 0.5 && b.val < 0.5),
  },
};

type LifeScenarioKey = 'chocolate' | 'running' | 'drink';

const LIFE_SCENARIOS: Record<
  LifeScenarioKey,
  {
    icon: string;
    label: string;
    intro: string;
    unit: string;
    actionVerb: string;
    questionAsk: string;
    compareWord: string;
    nameLeft: string;
    nameRight: string;
  }
> = {
  chocolate: {
    icon: '🍫',
    label: '分巧克力',
    intro: '兩條一樣長的牛奶巧克力',
    unit: '條',
    actionVerb: '吃了',
    questionAsk: '不用通分，誰吃得比較多？',
    compareWord: '吃得比較多',
    nameLeft: '小安',
    nameRight: '小美',
  },
  running: {
    icon: '🏃',
    label: '操場慢跑',
    intro: '體育課繞 400 公尺操場慢跑',
    unit: '圈',
    actionVerb: '跑了',
    questionAsk: '不用通分，誰跑得比較遠？',
    compareWord: '跑得比較遠',
    nameLeft: '阿凱',
    nameRight: '小琳',
  },
  drink: {
    icon: '🧋',
    label: '喝冬瓜茶',
    intro: '兩杯一樣大杯的冰冬瓜茶',
    unit: '杯',
    actionVerb: '喝了',
    questionAsk: '不用通分，誰喝得比較多？',
    compareWord: '喝得比較多',
    nameLeft: '樂樂',
    nameRight: '朵朵',
  },
};

interface Stage5PairDiscussProps {
  onGoNextStage?: () => void;
}

export const Stage5PairDiscuss: React.FC<Stage5PairDiscussProps> = ({ onGoNextStage }) => {
  const [activeTask, setActiveTask] = useState<DiscussionTaskId>(1);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  // 內建討論計時器
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);

  // 討論題 ① 狀態（野餐分披薩：小宇 7/12 張 vs 小晴 5/8 張）
  const [t1PickA, setT1PickA] = useState<'yu' | 'qing' | 'same' | null>(null);
  const [t1PickB, setT1PickB] = useState<'yu' | 'qing' | 'same' | null>(null);
  const [t1ConsensusPick, setT1ConsensusPick] = useState<'yu' | 'qing' | 'same' | null>(null);
  const [t1ConsensusReason, setT1ConsensusReason] = useState<string | null>(null);
  const [t1Feedback, setT1Feedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(
    null
  );

  // 討論題 ② 狀態（園遊會裝果汁迷思：第一組 11/10 公升 vs 第二組 13/12 公升）
  const [t2PickA, setT2PickA] = useState<'right' | 'wrong' | null>(null);
  const [t2PickB, setT2PickB] = useState<'right' | 'wrong' | null>(null);
  const [t2ConsensusPick, setT2ConsensusPick] = useState<'group1' | 'group2' | 'same' | null>(
    null
  );
  const [t2ConsensusReason, setT2ConsensusReason] = useState<string | null>(null);
  const [t2Feedback, setT2Feedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(
    null
  );

  // 討論題 ③ 狀態（生活應用出題互考）
  const [t3Scenario, setT3Scenario] = useState<LifeScenarioKey>('chocolate');
  const [t3Strategy, setT3Strategy] = useState<StrategyKey>('halfLine');
  const [t3SelectedIds, setT3SelectedIds] = useState<string[]>([]);
  const [t3QuestionLocked, setT3QuestionLocked] = useState(false);
  const [t3PickError, setT3PickError] = useState<string | null>(null);
  const [t3AnswerSide, setT3AnswerSide] = useState<'left' | 'right' | null>(null);
  const [t3SpokeChecked, setT3SpokeChecked] = useState(false);
  const [t3Feedback, setT3Feedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(
    null
  );

  useEffect(() => {
    if (!timerRunning) return;
    if (timerSeconds <= 0) {
      setTimerRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setTimerSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerSeconds]);

  const markTaskComplete = (taskId: DiscussionTaskId) => {
    setCompletedTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
  };

  const formatTimer = (sec: number) => {
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // 討論題 ① 送出
  const handleSubmitTask1 = () => {
    if (!t1PickA || !t1PickB) {
      setT1Feedback({
        type: 'error',
        msg: '請 A 同學與 B 同學先各自點選初步判斷，再一起討論共識喔！',
      });
      return;
    }
    if (!t1ConsensusPick || !t1ConsensusReason) {
      setT1Feedback({
        type: 'error',
        msg: '請兩人討論後，選出共同的答案與「最聰明的生活解釋」再送出！',
      });
      return;
    }
    if (t1ConsensusPick === 'qing' && t1ConsensusReason === 'over_half_slice') {
      setT1Feedback({
        type: 'success',
        msg: '🎉 討論大成功！海鮮披薩半張是 6/12 張，小宇多吃 1/12 張；夏威夷披薩半張是 4/8 張，小晴多吃 1/8 張。因為切 8 份的 1 片比切 12 份的 1 片大（1/8 > 1/12），所以小晴（5/8 張）吃得比較多！',
      });
      markTaskComplete(1);
    } else {
      setT1Feedback({
        type: 'error',
        msg: '🤔 再和搭檔想一想！兩張披薩一樣大，先各自扣掉「半張（1/2）」：小宇多吃 1/12 張，小晴多吃 1/8 張，切 8 片與切 12 片的單片哪一塊比較大呢？',
      });
    }
  };

  // 討論題 ② 送出
  const handleSubmitTask2 = () => {
    if (!t2PickA || !t2PickB) {
      setT2Feedback({
        type: 'error',
        msg: '請 A、B 兩位同學先各自亮牌，判斷小軒說得對不對！',
      });
      return;
    }
    if (!t2ConsensusPick || !t2ConsensusReason) {
      setT2Feedback({
        type: 'error',
        msg: '請兩人討論後，選出哪一組果汁比較多，以及要提醒小軒的觀念！',
      });
      return;
    }
    if (t2ConsensusPick === 'group1' && t2ConsensusReason === 'mixed_more_than_1') {
      setT2Feedback({
        type: 'success',
        msg: '🎉 診斷完全正確！第一組裝了 1 又 1/10 公升，第二組裝了 1 又 1/12 公升。都已經裝滿 1 公升了，多出來的部分是「越多越大」，因為 1/10 公升 > 1/12 公升，所以第一組的果汁比較多！',
      });
      markTaskComplete(2);
    } else {
      setT2Feedback({
        type: 'error',
        msg: '🤔 再一起檢查一次！這兩壺果汁都已經「裝滿 1 公升還多出來」，換成帶分數：1 又 1/10 公升和 1 又 1/12 公升，多出來的部分誰比較多呢？',
      });
    }
  };

  // 討論題 ③：A 同學點選題卡
  const toggleDeckCard = (id: string) => {
    if (t3QuestionLocked) return;
    setT3PickError(null);
    setT3SelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedDeckItems = t3SelectedIds
    .map((id) => PAIR_DECK.find((item) => item.id === id))
    .filter((item): item is DeckFraction => Boolean(item));

  const currentScenario = LIFE_SCENARIOS[t3Scenario];

  const handleLockTask3Question = () => {
    if (selectedDeckItems.length !== 2) {
      setT3PickError('請 A 同學點選剛好 2 張分數卡，組成一道生活應用題！');
      return;
    }
    const [f1, f2] = selectedDeckItems;
    const rule = STRATEGY_INFO[t3Strategy];
    if (!rule.check(f1, f2)) {
      setT3PickError(`這兩張牌不符合「${rule.title}」的條件喔！提示：${rule.ruleDesc}`);
      return;
    }
    setT3PickError(null);
    setT3QuestionLocked(true);
    setT3AnswerSide(null);
    setT3SpokeChecked(false);
    setT3Feedback(null);
  };

  const handleSubmitTask3Answer = () => {
    if (selectedDeckItems.length !== 2) return;
    if (!t3AnswerSide) {
      setT3Feedback({ type: 'error', msg: '請 B 同學先選出哪一位比較多／比較遠！' });
      return;
    }
    if (!t3SpokeChecked) {
      setT3Feedback({
        type: 'error',
        msg: '請 B 同學先口頭用生活情境向 A 同學說明理由，再勾選下方確認方塊喔！',
      });
      return;
    }
    const [f1, f2] = selectedDeckItems;
    const expectedSide: 'left' | 'right' = f1.val > f2.val ? 'left' : 'right';
    const winnerName =
      expectedSide === 'left' ? currentScenario.nameLeft : currentScenario.nameRight;
    const sym = f1.val > f2.val ? '＞' : '＜';
    if (t3AnswerSide === expectedSide) {
      setT3Feedback({
        type: 'success',
        msg: `🎉 生活出題互考成功！${f1.n}/${f1.d} ${currentScenario.unit} ${sym} ${f2.n}/${f2.d} ${currentScenario.unit}，所以是「${winnerName}」${currentScenario.compareWord}！你們成功把「${STRATEGY_INFO[t3Strategy].title}」用在生活中了！`,
      });
      markTaskComplete(3);
    } else {
      setT3Feedback({
        type: 'error',
        msg: `🤔 再一起核對一下 ${currentScenario.nameLeft}（${f1.n}/${f1.d} ${currentScenario.unit}）和 ${currentScenario.nameRight}（${f2.n}/${f2.d} ${currentScenario.unit}）誰比較多喔！可以請 A 同學給個小提示！`,
      });
    }
  };

  const resetTask3 = () => {
    setT3SelectedIds([]);
    setT3QuestionLocked(false);
    setT3PickError(null);
    setT3AnswerSide(null);
    setT3SpokeChecked(false);
    setT3Feedback(null);
  };

  return (
    <section className="space-y-4">
      {/* 頂部說明與討論計時工具列 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-indigo-800">
              🤝 兩人一組討論：生活中的分數比大小
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              請和隔壁同學<b>兩人一組（A 同學與 B 同學）</b>，結合生活情境先各自思考、再輪流說出理由，一起破解 3 個生活數學任務！
            </p>
          </div>

          {/* 討論倒數計時器 */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-slate-500">⏱️ 討論計時：</span>
            <span
              className={`font-mono font-black text-base tabular-nums ${
                timerSeconds === 0 ? 'text-rose-600' : 'text-indigo-700'
              }`}
            >
              {formatTimer(timerSeconds)}
            </span>
            <button
              type="button"
              onClick={() => {
                if (timerSeconds === 0) setTimerSeconds(120);
                setTimerRunning((r) => !r);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            >
              {timerRunning ? '暫停' : '開始'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(120);
              }}
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            >
              2分
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(180);
              }}
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            >
              3分
            </button>
          </div>
        </div>

        {/* 討論題分頁切換 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          {(
            [
              { id: 1 as const, label: '🍕 討論題 ①：野餐分披薩，誰吃得多？' },
              { id: 2 as const, label: '🧃 討論題 ②：園遊會裝果汁迷思！' },
              { id: 3 as const, label: '🎯 討論題 ③：生活應用出題互考' },
            ] as const
          ).map((item) => {
            const done = completedTasks.includes(item.id);
            const active = activeTask === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTask(item.id)}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="truncate">{item.label}</span>
                {done && <span className="shrink-0 font-black">{active ? '✔' : '✅'}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 討論題 ①：野餐分披薩（7/12 vs 5/8） */}
      {activeTask === 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-indigo-200 space-y-5">
          <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-200 space-y-3">
            <div className="text-xs font-black text-amber-700">
              討論題 ① · 校外教學野餐分享（基準量 1/2 應用）
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
              班上校外教學訂了兩張<b>一樣大</b>的披薩：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-sky-700">🍕 海鮮披薩（平分成 12 片）</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    小宇吃了 7 片，也就是：
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <FractionDisplay num={7} den={12} large />
                  <span className="text-sm font-black text-slate-600">張</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-violet-700">
                    🍍 夏威夷披薩（平分成 8 片）
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    小晴吃了 5 片，也就是：
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <FractionDisplay num={5} den={8} large />
                  <span className="text-sm font-black text-slate-600">張</span>
                </div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black text-indigo-900">
              ❓ 兩人都吃了超過「半張披薩」，不用通分，怎麼知道誰吃得比較多？
            </div>
          </div>

          {/* 步驟 1：兩人先獨立亮牌 */}
          <div className="space-y-2.5">
            <div className="font-black text-slate-800 text-sm sm:text-base">
              步驟 1 · 各自先想再亮牌（看看你們第一直覺一不一樣）
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="font-black text-sky-900 text-sm">🗣️ A 同學的初步想法</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'yu', label: '小宇多 (7/12)' },
                      { id: 'qing', label: '小晴多 (5/8)' },
                      { id: 'same', label: '一樣多' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setT1PickA(opt.id)}
                      className={`py-2 px-1 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                        t1PickA === opt.id
                          ? 'bg-sky-600 text-white border-sky-600 shadow'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-4 space-y-3">
                <div className="font-black text-violet-900 text-sm">🗣️ B 同學的初步想法</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'yu', label: '小宇多 (7/12)' },
                      { id: 'qing', label: '小晴多 (5/8)' },
                      { id: 'same', label: '一樣多' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setT1PickB(opt.id)}
                      className={`py-2 px-1 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                        t1PickB === opt.id
                          ? 'bg-violet-600 text-white border-violet-600 shadow'
                          : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {t1PickA && t1PickB && (
              <div className="text-xs sm:text-sm font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5">
                {t1PickA === t1PickB
                  ? '👀 兩位同學的初步想法一致！快輪流用披薩片數說說看理由吧！'
                  : '⚡ 兩位同學的想法不一樣喔！太棒了，請輪流用「半張披薩」來說服對方！'}
              </div>
            )}
          </div>

          {/* 步驟 2：口頭討論引導 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="font-black text-amber-900 text-sm sm:text-base">
              步驟 2 · 輪流開口討論（用「半張披薩」來比比看）
            </div>
            <ul className="text-xs sm:text-sm font-bold text-slate-700 space-y-1.5 list-disc pl-5">
              <li>
                <b>A 同學說給搭檔聽：</b>「海鮮披薩切 12 片，半張是 6 片，所以小宇吃了半張又多 ____ 張。」
              </li>
              <li>
                <b>B 同學說給搭檔聽：</b>「夏威夷披薩切 8 片，半張是 4 片，所以小晴吃了半張又多 ____ 張；同樣多 1 片，切 8 片和切 12 片哪一種單片比較大？」
              </li>
            </ul>
          </div>

          {/* 步驟 3：小組共識提交 */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="font-black text-slate-800 text-sm sm:text-base">
              步驟 3 · 達成共識！選出我們這組的最終答案與理由
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-600">誰吃得比較多：</span>
              {(
                [
                  { id: 'yu', label: '小宇（7/12 > 5/8）' },
                  { id: 'qing', label: '小晴（5/8 > 7/12）' },
                  { id: 'same', label: '一樣多（7/12 = 5/8）' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setT1ConsensusPick(opt.id)}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                    t1ConsensusPick === opt.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'more_pieces',
                  text: '小宇吃了 7 片、小晴只吃 5 片，7 片比 5 片多，所以小宇吃得比較多。',
                },
                {
                  id: 'over_half_slice',
                  text: '小宇比半張多吃 1/12 張，小晴比半張多吃 1/8 張；因為切 8 份的 1 片比切 12 份的大（1/8 > 1/12），所以小晴吃得比較多。',
                },
                {
                  id: 'same_over_half',
                  text: '兩個人都只比半張披薩多吃 1 片，所以兩個人吃的分量一樣多。',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setT1ConsensusReason(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold leading-relaxed transition cursor-pointer ${
                    t1ConsensusReason === opt.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/40'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSubmitTask1}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                ✅ 確認我們這組的討論結果
              </button>

              {completedTasks.includes(1) && (
                <button
                  type="button"
                  onClick={() => setActiveTask(2)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  進入討論題 ② ➡️
                </button>
              )}
            </div>

            {t1Feedback && (
              <div
                className={`rounded-2xl p-4 border-2 font-bold text-sm sm:text-base ${
                  t1Feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-rose-50 border-rose-400 text-rose-900'
                }`}
              >
                {t1Feedback.msg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 討論題 ②：園遊會裝果汁迷思（11/10 公升 vs 13/12 公升） */}
      {activeTask === 2 && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-indigo-200 space-y-5">
          <div className="bg-rose-50/80 rounded-2xl p-4 sm:p-5 border border-rose-200 space-y-3">
            <div className="text-xs font-black text-rose-600">
              討論題 ② · 校慶園遊會裝果汁（假分數迷思診斷）
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
              校慶園遊會賣鮮榨柳橙汁，兩組各用<b>1 公升</b>量杯盛裝：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-rose-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-orange-700">🧃 第一組（每公升分 10 格）</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">裝了 11 格，也就是：</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <FractionDisplay num={11} den={10} large />
                  <span className="text-sm font-black text-slate-600">公升</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-rose-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-amber-700">🧃 第二組（每公升分 12 格）</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">裝了 13 格，也就是：</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <FractionDisplay num={13} den={12} large />
                  <span className="text-sm font-black text-slate-600">公升</span>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl p-3 border border-rose-200 text-sm sm:text-base font-bold text-slate-800">
              💬 負責記帳的小軒看了一眼就說：
              <span className="text-rose-800 font-black">
                「兩組都只和 1 公升差 1 格！以前老師說差 1 份時分母越大就越大，所以第二組的 13/12 公升比較多！」
              </span>
            </div>
          </div>

          {/* 步驟 1：各自裁判 */}
          <div className="space-y-2.5">
            <div className="font-black text-slate-800 text-sm sm:text-base">
              步驟 1 · 兩位同學各自當小老師，先判斷小軒說得對不對
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="font-black text-sky-900 text-sm">🗣️ A 同學的判斷</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setT2PickA('right')}
                    className={`py-2.5 rounded-xl font-black text-sm border-2 transition cursor-pointer ${
                      t2PickA === 'right'
                        ? 'bg-sky-600 text-white border-sky-600 shadow'
                        : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    ⭕ 小軒說得對
                  </button>
                  <button
                    type="button"
                    onClick={() => setT2PickA('wrong')}
                    className={`py-2.5 rounded-xl font-black text-sm border-2 transition cursor-pointer ${
                      t2PickA === 'wrong'
                        ? 'bg-sky-600 text-white border-sky-600 shadow'
                        : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    ❌ 小軒說錯了
                  </button>
                </div>
              </div>

              <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-4 space-y-3">
                <div className="font-black text-violet-900 text-sm">🗣️ B 同學的判斷</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setT2PickB('right')}
                    className={`py-2.5 rounded-xl font-black text-sm border-2 transition cursor-pointer ${
                      t2PickB === 'right'
                        ? 'bg-violet-600 text-white border-violet-600 shadow'
                        : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-100'
                    }`}
                  >
                    ⭕ 小軒說得對
                  </button>
                  <button
                    type="button"
                    onClick={() => setT2PickB('wrong')}
                    className={`py-2.5 rounded-xl font-black text-sm border-2 transition cursor-pointer ${
                      t2PickB === 'wrong'
                        ? 'bg-violet-600 text-white border-violet-600 shadow'
                        : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-100'
                    }`}
                  >
                    ❌ 小軒說錯了
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 步驟 2：討論分工卡 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="font-black text-amber-900 text-sm sm:text-base">
              步驟 2 · 兩人討論分工（一起幫小軒抓出盲點）
            </div>
            <ul className="text-xs sm:text-sm font-bold text-slate-700 space-y-1.5 list-disc pl-5">
              <li>
                <b>A 同學負責換算：</b>把 11/10 公升和 13/12 公升說成「裝滿 1 公升，又多出幾分之幾公升」？
              </li>
              <li>
                <b>B 同學負責解釋：</b>「還沒裝滿 1 公升（缺 1 格）」跟「已經裝滿還多出 1 格」，比較大小的方向哪裡不一樣？
              </li>
            </ul>
          </div>

          {/* 步驟 3：小組共識 */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="font-black text-slate-800 text-sm sm:text-base">
              步驟 3 · 選出哪一組的果汁比較多，以及要教小軒的話
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-600">正確答案：</span>
              {(
                [
                  { id: 'group1', label: '第一組多（11/10 > 13/12）' },
                  { id: 'group2', label: '第二組多（11/10 < 13/12）' },
                  { id: 'same', label: '兩組一樣多' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setT2ConsensusPick(opt.id)}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                    t2ConsensusPick === opt.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'same_gap_rule',
                  text: '小軒說得對！只要分子分母相差 1 格，刻度分得越細（分母越大）果汁就一定越多。',
                },
                {
                  id: 'mixed_more_than_1',
                  text: '兩組都已裝滿 1 公升（1又1/10 和 1又1/12 公升），多出來的部分是「越多越大」；因為 1/10 公升 > 1/12 公升，所以第一組比較多！',
                },
                {
                  id: 'must_lcd',
                  text: '超過 1 公升就不能用聰明算，一定要通分成公分母 60 才知道哪組果汁多。',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setT2ConsensusReason(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold leading-relaxed transition cursor-pointer ${
                    t2ConsensusReason === opt.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/40'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSubmitTask2}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                ✅ 確認我們這組的診斷結果
              </button>

              {completedTasks.includes(2) && (
                <button
                  type="button"
                  onClick={() => setActiveTask(3)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  進入討論題 ③ ➡️
                </button>
              )}
            </div>

            {t2Feedback && (
              <div
                className={`rounded-2xl p-4 border-2 font-bold text-sm sm:text-base ${
                  t2Feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-rose-50 border-rose-400 text-rose-900'
                }`}
              >
                {t2Feedback.msg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 討論題 ③：生活應用出題互考 */}
      {activeTask === 3 && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-indigo-200 space-y-5">
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-black text-emerald-700">
                討論題 ③ · 生活應用出題互考
              </div>
              <div className="text-sm sm:text-base font-black text-slate-800">
                由 A 同學選一個生活情境與招式，再挑 2 張分數卡編成應用題；由 B 同學用生活理由解題！（完成後可互換角色）
              </div>
            </div>
            <button
              type="button"
              onClick={resetTask3}
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              🔄 換人出題
            </button>
          </div>

          {/* A 同學出題區 */}
          <div className="space-y-3">
            <div className="font-black text-sky-900 text-sm sm:text-base">
              步驟 1 · A 同學出題：選生活情境 → 選招式 → 挑 2 張符合規則的分數卡
            </div>

            {/* 選生活情境 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-600">生活主題：</span>
              {(Object.keys(LIFE_SCENARIOS) as LifeScenarioKey[]).map((key) => {
                const item = LIFE_SCENARIOS[key];
                const active = t3Scenario === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={t3QuestionLocked}
                    onClick={() => setT3Scenario(key)}
                    className={`px-3.5 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm transition cursor-pointer disabled:opacity-60 ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 shadow'
                        : 'bg-amber-50/70 text-amber-950 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                );
              })}
            </div>

            {/* 選策略 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(STRATEGY_INFO) as StrategyKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={t3QuestionLocked}
                  onClick={() => {
                    setT3Strategy(key);
                    setT3SelectedIds([]);
                    setT3PickError(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer disabled:opacity-60 ${
                    t3Strategy === key
                      ? 'bg-sky-600 text-white border-sky-600 shadow'
                      : 'bg-sky-50/60 text-slate-800 border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <div className="font-black text-sm">{STRATEGY_INFO[key].title}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      t3Strategy === key ? 'text-sky-100' : 'text-slate-500'
                    }`}
                  >
                    {STRATEGY_INFO[key].ruleDesc}
                  </div>
                </button>
              ))}
            </div>

            {/* 選 2 張分數卡 */}
            <div className="flex flex-wrap gap-2.5 justify-center bg-slate-50 rounded-2xl p-4 border border-slate-200">
              {PAIR_DECK.map((card) => {
                const isSelected = t3SelectedIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={t3QuestionLocked}
                    onClick={() => toggleDeckCard(card.id)}
                    className={`min-w-[76px] py-2.5 px-4 rounded-xl border-2 font-black transition cursor-pointer disabled:cursor-default ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-md -translate-y-0.5'
                        : 'bg-white border-slate-300 text-slate-800 hover:border-sky-400 hover:bg-sky-50'
                    }`}
                  >
                    <FractionDisplay num={card.n} den={card.d} />
                  </button>
                );
              })}
            </div>

            {t3PickError && (
              <div className="text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 border border-rose-300 rounded-xl px-4 py-2.5">
                ⚠️ {t3PickError}
              </div>
            )}

            {!t3QuestionLocked && (
              <button
                type="button"
                onClick={handleLockTask3Question}
                className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                🔒 生成生活考題，換 B 同學挑戰！
              </button>
            )}
          </div>

          {/* B 同學解題區 */}
          {t3QuestionLocked && selectedDeckItems.length === 2 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 animate-pop">
              <div className="font-black text-violet-900 text-sm sm:text-base">
                步驟 2 · B 同學解題：看生活題目作答，並口頭告訴 A 同學你的判斷理由！
              </div>

              <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 space-y-4">
                <div className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed flex flex-wrap items-center gap-1.5">
                  <span className="text-xl">{currentScenario.icon}</span>
                  <span>
                    {currentScenario.intro}，<b>{currentScenario.nameLeft}</b>
                    {currentScenario.actionVerb}
                  </span>
                  <FractionDisplay num={selectedDeckItems[0].n} den={selectedDeckItems[0].d} />
                  <span>
                    {currentScenario.unit}，<b>{currentScenario.nameRight}</b>
                    {currentScenario.actionVerb}
                  </span>
                  <FractionDisplay num={selectedDeckItems[1].n} den={selectedDeckItems[1].d} />
                  <span>
                    {currentScenario.unit}。<b>{currentScenario.questionAsk}</b>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setT3AnswerSide('left')}
                    className={`py-3 px-4 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer ${
                      t3AnswerSide === 'left'
                        ? 'bg-violet-600 text-white border-violet-600 shadow'
                        : 'bg-white hover:bg-violet-100 border-violet-300 text-slate-800'
                    }`}
                  >
                    <span>
                      {currentScenario.nameLeft}
                      {currentScenario.compareWord}（{selectedDeckItems[0].n}/{selectedDeckItems[0].d}{' '}
                      ＞ {selectedDeckItems[1].n}/{selectedDeckItems[1].d}）
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setT3AnswerSide('right')}
                    className={`py-3 px-4 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer ${
                      t3AnswerSide === 'right'
                        ? 'bg-violet-600 text-white border-violet-600 shadow'
                        : 'bg-white hover:bg-violet-100 border-violet-300 text-slate-800'
                    }`}
                  >
                    <span>
                      {currentScenario.nameRight}
                      {currentScenario.compareWord}（{selectedDeckItems[1].n}/{selectedDeckItems[1].d}{' '}
                      ＞ {selectedDeckItems[0].n}/{selectedDeckItems[0].d}）
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={t3SpokeChecked}
                  onChange={(e) => setT3SpokeChecked(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded shrink-0"
                />
                <span>
                  B 同學已經口頭結合「{currentScenario.label}」情境，用「
                  {STRATEGY_INFO[t3Strategy].title}」向 A 同學解釋完理由，兩人都聽懂了！
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmitTask3Answer}
                className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                ✅ 確認解題並驗證
              </button>

              {t3Feedback && (
                <div
                  className={`rounded-2xl p-4 border-2 font-bold text-sm sm:text-base ${
                    t3Feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-rose-400 text-rose-900'
                  }`}
                >
                  {t3Feedback.msg}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 全部 3 題完成慶祝橫幅 */}
      {completedTasks.length === 3 && (
        <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-pop">
          <div className="font-black text-emerald-950 text-sm sm:text-base">
            🏆 太棒了！你們已合作完成全部 3 個生活應用討論題，現在準備挑戰課後小測驗吧！
          </div>
          {onGoNextStage && (
            <button
              type="button"
              onClick={onGoNextStage}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-5 py-2 rounded-xl shadow-md transition cursor-pointer whitespace-nowrap"
            >
              前往「6.課後小測驗」 ➡️
            </button>
          )}
        </div>
      )}
    </section>
  );
};
