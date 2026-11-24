import React, { useState } from 'react';
import { FractionDisplay } from './FractionDisplay';

interface SymbolQuestion {
  id: string;
  numLabel: string;
  left: { n: number; d: number; w?: number };
  right: { n: number; d: number; w?: number };
  answer: '>' | '<' | '=';
  explanation: string;
}

interface WordQuestion {
  id: string;
  numLabel: string;
  prompt: React.ReactNode;
  options: Array<{ val: string; label: string }>;
  answer: string;
  explanation: string;
}

const PART_1_QUESTIONS: SymbolQuestion[] = [
  {
    id: 'q1_1',
    numLabel: '(1)',
    left: { n: 25, d: 6 },
    right: { n: 34, d: 8 },
    answer: '<',
    explanation:
      '先換成帶分數再約分：25/6 = 4又1/6；34/8 = 4又2/8 = 4又1/4。整數都是 4，因為 1/6 < 1/4，所以 25/6 < 34/8。',
  },
  {
    id: 'q1_2',
    numLabel: '(2)',
    left: { n: 26, d: 7 },
    right: { n: 15, d: 24, w: 3 },
    answer: '>',
    explanation:
      '26/7 換成帶分數是 3又5/7；3又15/24 約分後是 3又5/8。整數都是 3，同分子比較 5/7 > 5/8，所以 26/7 > 3又15/24。',
  },
];

const PART_2_QUESTIONS: WordQuestion[] = [
  {
    id: 'q2_1',
    numLabel: '(1)',
    prompt: (
      <>
        一盒色紙有 24 張。
        <span className="underline decoration-2 underline-offset-4">小宇</span>有{' '}
        <FractionDisplay num={5} den={16} /> 盒，
        <span className="underline decoration-2 underline-offset-4">小晴</span>有{' '}
        <FractionDisplay num={1} den={3} /> 盒，誰的色紙比較<b>少</b>？
      </>
    ),
    options: [
      { val: '小宇', label: '小宇（5/16 盒）' },
      { val: '小晴', label: '小晴（1/3 盒）' },
      { val: '一樣多', label: '兩人一樣多' },
    ],
    answer: '小宇',
    explanation:
      '比較 5/16 和 1/3：可用同分子比較（1/3 = 5/15），因為 5/16 < 5/15，所以小宇的色紙比較少！',
  },
  {
    id: 'q2_2',
    numLabel: '(2)',
    prompt: (
      <>
        每個蔥油餅都一樣大。
        <span className="underline decoration-2 underline-offset-4">阿哲</span>吃掉{' '}
        <FractionDisplay num={16} den={7} /> 個，
        <span className="underline decoration-2 underline-offset-4">佳佳</span>吃掉{' '}
        <FractionDisplay num={1} den={6} whole={2} /> 個，誰吃掉的蔥油餅比較<b>多</b>？
      </>
    ),
    options: [
      { val: '阿哲', label: '阿哲（16/7 個）' },
      { val: '佳佳', label: '佳佳（2又1/6 個）' },
      { val: '一樣多', label: '兩人一樣多' },
    ],
    answer: '阿哲',
    explanation:
      '把假分數換成帶分數：16/7 = 2又2/7。比較 2又2/7 和 2又1/6：2/7 > 1/7 > 1/6，所以阿哲吃掉的比較多！',
  },
];

const PART_3_QUESTIONS: SymbolQuestion[] = [
  {
    id: 'q3_1',
    numLabel: '(1)',
    left: { n: 1, d: 8 },
    right: { n: 1, d: 11 },
    answer: '>',
    explanation: '同分子都是 1，分母 8 < 11（平分越少份每份越大），所以 1/8 > 1/11。',
  },
  {
    id: 'q3_2',
    numLabel: '(2)',
    left: { n: 1, d: 18 },
    right: { n: 1, d: 14 },
    answer: '<',
    explanation: '同分子都是 1，分母 18 > 14，平分越多份每份越小，所以 1/18 < 1/14。',
  },
  {
    id: 'q3_3',
    numLabel: '(3)',
    left: { n: 15, d: 14 },
    right: { n: 19, d: 18 },
    answer: '>',
    explanation:
      '換成帶分數：15/14 = 1又1/14，19/18 = 1又1/18。整數都是 1，因為 1/14 > 1/18，所以 15/14 > 19/18。',
  },
  {
    id: 'q3_4',
    numLabel: '(4)',
    left: { n: 13, d: 12 },
    right: { n: 11, d: 10 },
    answer: '<',
    explanation:
      '換成帶分數：13/12 = 1又1/12，11/10 = 1又1/10。整數都是 1，因為 1/12 < 1/10，所以 13/12 < 11/10。',
  },
  {
    id: 'q3_5',
    numLabel: '(5)',
    left: { n: 6, d: 7 },
    right: { n: 7, d: 8 },
    answer: '<',
    explanation:
      '跟 1 比差距：6/7 距離 1 差 1/7，7/8 距離 1 差 1/8；缺得越少越大，所以 6/7 < 7/8。',
  },
  {
    id: 'q3_6',
    numLabel: '(6)',
    left: { n: 6, d: 15, w: 1 },
    right: { n: 14, d: 35, w: 1 },
    answer: '=',
    explanation:
      '兩邊先約分看看！6/15 同除以 3 是 2/5；14/35 同除以 7 也是 2/5，兩邊都是 1又2/5，所以相等（＝）！',
  },
];

interface Stage5QuizProps {
  onQuizSubmit?: (score: number, correctCount: number) => void;
}

export const Stage5Quiz: React.FC<Stage5QuizProps> = ({ onQuizSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [incompleteWarning, setIncompleteWarning] = useState<string | null>(null);

  const allQuestions = [...PART_1_QUESTIONS, ...PART_2_QUESTIONS, ...PART_3_QUESTIONS];

  const selectOption = (qId: string, val: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setIncompleteWarning(null);
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < allQuestions.length) {
      setIncompleteWarning(
        `⚠️ 還有 ${allQuestions.length - answeredCount} 題還沒作答喔！請全部點選後再交卷。`
      );
      return;
    }
    setIncompleteWarning(null);
    setSubmitted(true);
    const finalCorrect = allQuestions.filter((q) => answers[q.id] === q.answer).length;
    const finalScore = finalCorrect * 10;
    onQuizSubmit?.(finalScore, finalCorrect);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setIncompleteWarning(null);
  };

  const correctCount = submitted
    ? allQuestions.filter((q) => answers[q.id] === q.answer).length
    : 0;
  const score = correctCount * 10;

  const renderSymbolCard = (q: SymbolQuestion) => {
    const userAns = answers[q.id];
    const isRight = submitted && userAns === q.answer;
    const isWrong = submitted && userAns !== q.answer;

    return (
      <div
        key={q.id}
        className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between space-y-2.5 transition ${
          isRight
            ? 'border-emerald-500 bg-emerald-50/40'
            : isWrong
              ? 'border-rose-500 bg-rose-50/40'
              : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-black text-slate-500 text-sm">{q.numLabel}</span>
          <div className="flex items-center gap-2 text-slate-900">
            <FractionDisplay num={q.left.n} den={q.left.d} whole={q.left.w || 0} />
            <span
              className={
                userAns
                  ? 'w-9 h-9 rounded-lg border-2 border-indigo-600 bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-800'
                  : 'w-9 h-9 rounded-lg border-2 border-indigo-400 bg-white flex items-center justify-center text-xl font-black text-indigo-700 shadow-inner'
              }
            >
              {userAns ?? '？'}
            </span>
            <FractionDisplay num={q.right.n} den={q.right.d} whole={q.right.w || 0} />
          </div>
          <span className="w-6" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['>', '<', '='] as const).map((sym) => {
            const isSelected = userAns === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => selectOption(q.id, sym)}
                className={`border-2 rounded-xl py-1.5 text-lg font-black active:scale-95 transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white hover:bg-indigo-50 border-slate-300 text-slate-700'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div
            className={`text-xs font-bold p-2.5 rounded-xl leading-relaxed ${
              isRight ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}
          >
            {isRight
              ? `✅ 答對了！${q.explanation}`
              : `❌ 正確答案是「${q.answer}」。${q.explanation}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-5">
      {/* 測驗頂部標題與分數卡 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            📝 課後小測驗：分數的大小比較
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            請直接點擊選項完成三大題測驗，全部作答後按下「交卷看成績」即可查看解析！
          </p>
        </div>
        <div className="flex items-center gap-3">
          {submitted && (
            <div className="bg-amber-100 border-2 border-amber-400 px-4 py-1.5 rounded-xl font-black text-amber-900 text-base">
              得分：<span className="text-2xl text-rose-600">{score}</span> / 100 分
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer"
          >
            🔄 重新作答
          </button>
        </div>
      </div>

      {/* 第一大題 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-sky-100 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-sm">
            1
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-800">
            比較下面各組分數的大小（先化為帶分數或約分、通分再比較）
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PART_1_QUESTIONS.map(renderSymbolCard)}
        </div>
      </div>

      {/* 第二大題 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-emerald-100 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
            2
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-800">想一想，選出正確的答案</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PART_2_QUESTIONS.map((q) => {
            const userAns = answers[q.id];
            const isRight = submitted && userAns === q.answer;
            const isWrong = submitted && userAns !== q.answer;

            return (
              <div
                key={q.id}
                className={`rounded-2xl p-4 border-2 flex flex-col justify-between space-y-3 transition ${
                  isRight
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : isWrong
                      ? 'border-rose-500 bg-rose-50/40'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                  <span className="font-black text-emerald-700 mr-1">{q.numLabel}</span>
                  {q.prompt}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = userAns === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => selectOption(q.id, opt.val)}
                        className={`border-2 rounded-xl py-2 px-2.5 text-xs sm:text-sm font-black transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div
                    className={`text-xs sm:text-sm font-bold p-2.5 rounded-xl ${
                      isRight ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isRight
                      ? `✅ 答對了！${q.explanation}`
                      : `❌ 正確答案是「${q.answer}」。${q.explanation}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 第三大題 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-100 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 font-black flex items-center justify-center text-sm">
            3
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-800">
            不用通分的方法比比看，在 □ 裡填入 ＞、＜ 或 ＝
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PART_3_QUESTIONS.map(renderSymbolCard)}
        </div>
      </div>

      {/* 交卷按鈕與總回饋 */}
      <div className="flex flex-col items-center gap-3 pb-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-base sm:text-lg px-10 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition cursor-pointer"
        >
          <span>🎯</span>
          <span>交卷看成績與詳解</span>
        </button>

        {incompleteWarning && (
          <div className="text-center font-bold text-sm sm:text-base px-4 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
            {incompleteWarning}
          </div>
        )}

        {submitted && (
          <div
            className={`text-center font-bold text-sm sm:text-base px-4 py-2 rounded-xl border ${
              score === 100
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-sky-100 text-sky-900 border-sky-300'
            }`}
          >
            {score === 100
              ? '🏆 太厲害了！10 題全部答對，獲得滿分 100 分！'
              : `👏 交卷完成！你答對了 ${correctCount} / 10 題（${score} 分），請看看上方各題的紅色框解析喔！`}
          </div>
        )}
      </div>
    </section>
  );
};
