import React, { useState } from 'react';

interface IslandNode {
  id: string;
  label?: string;
  n?: number;
  d?: number;
  val?: number;
  x: number;
  y: number;
  next?: string[];
  exit?: string;
}

const ISLAND_NODES: Record<string, IslandNode> = {
  start: { id: 'start', label: '起點', x: 95, y: 165, next: ['n_7_16', 'n_6_11'] },
  n_7_16: { id: 'n_7_16', n: 7, d: 16, val: 7 / 16, x: 245, y: 100, next: ['n_5_12', 'n_4_7'] },
  n_6_11: { id: 'n_6_11', n: 6, d: 11, val: 6 / 11, x: 245, y: 230, next: ['n_7_9', 'n_9_11'] },
  n_5_12: { id: 'n_5_12', n: 5, d: 12, val: 5 / 12, x: 395, y: 55, next: ['n_3_8', 'n_5_9'] },
  n_4_7: { id: 'n_4_7', n: 4, d: 7, val: 4 / 7, x: 395, y: 128, next: ['n_5_9', 'n_15_13'] },
  n_7_9: { id: 'n_7_9', n: 7, d: 9, val: 7 / 9, x: 395, y: 202, next: ['n_15_13', 'n_13_11'] },
  n_9_11: { id: 'n_9_11', n: 9, d: 11, val: 9 / 11, x: 395, y: 275, next: ['n_15_13', 'n_13_11'] },
  n_3_8: { id: 'n_3_8', n: 3, d: 8, val: 3 / 8, x: 545, y: 55, exit: 'A' },
  n_5_9: { id: 'n_5_9', n: 5, d: 9, val: 5 / 9, x: 545, y: 128, exit: 'B' },
  n_15_13: { id: 'n_15_13', n: 15, d: 13, val: 15 / 13, x: 545, y: 202, exit: 'C' },
  n_13_11: { id: 'n_13_11', n: 13, d: 11, val: 13 / 11, x: 545, y: 275, exit: 'D' },
};

const ISLAND_EXITS = [
  { id: 'A', label: '出口 A', x: 675, y: 55 },
  { id: 'B', label: '出口 B', x: 675, y: 128 },
  { id: 'C', label: '出口 C', x: 675, y: 202 },
  { id: 'D', label: '出口 D', x: 675, y: 275 },
];

const MAZE_STEP_HINTS: Record<string, { prompt: string; wrongTip: string; rightTip: string }> = {
  start: {
    prompt: '第 1 站（起點分岔）：請比較 7/16 和 6/11，點擊比較大的分數航行！',
    wrongTip:
      '🚧 觸礁提示：用「看有沒有超過一半」想想看！16 的一半是 8（7/16 不到一半），11 的一半是 5.5（6/11 超過一半）喔！',
    rightTip: '✅ 航行正確！6/11 超過一半（5.5/11），7/16 不到一半（8/16），所以 6/11 > 7/16！',
  },
  n_6_11: {
    prompt: '第 2 站（從 6/11 分岔）：請比較 7/9 和 9/11，點擊比較大的分數航行！',
    wrongTip:
      '🚧 觸礁提示：這兩個分數分子都比分母少 2！7/9 距離 1 差 2/9，9/11 距離 1 差 2/11，缺得越少越大喔！',
    rightTip:
      '✅ 航行正確！9/11 距離 1 只差 2/11，7/9 距離 1 差 2/9，缺得比較少，所以 9/11 > 7/9！',
  },
  n_9_11: {
    prompt: '第 3 站（終極考驗）：請比較 15/13 和 13/11，點擊比較大的分數就能抵達出口！',
    wrongTip:
      '🚧 觸礁提示：把假分數換成帶分數比比看！15/13 = 1又2/13，13/11 = 1又2/11，哪一個的分數部分比較大呢？',
    rightTip:
      '🎉 太厲害了！13/11 = 1又2/11，15/13 = 1又2/13，同分子比較 2/11 > 2/13，成功抵達【出口 D】！',
  },
};

export const Stage4Maze: React.FC = () => {
  const [pathHistory, setPathHistory] = useState<string[]>(['start']);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const initMazeGame = () => {
    setPathHistory(['start']);
    setFinished(false);
    setFeedback(null);
  };

  const currentId = pathHistory[pathHistory.length - 1];
  const currentNode = ISLAND_NODES[currentId];
  const candidateIds = !finished && currentNode.next ? currentNode.next : [];
  const stepCount = pathHistory.length - 1;

  const instructionText =
    finished && currentNode.exit
      ? `🏆 航行成功！沿著較大的分數走，最後到達【出口 ${currentNode.exit}】！`
      : MAZE_STEP_HINTS[currentId]?.prompt || '';

  const selectIslandNode = (targetId: string) => {
    if (finished || !currentNode?.next || !currentNode.next.includes(targetId)) return;

    const [opt1Id, opt2Id] = currentNode.next;
    const opt1 = ISLAND_NODES[opt1Id];
    const opt2 = ISLAND_NODES[opt2Id];
    const largerId = (opt1.val || 0) > (opt2.val || 0) ? opt1Id : opt2Id;
    const stepInfo = MAZE_STEP_HINTS[currentId];

    if (targetId === largerId) {
      setPathHistory((prev) => [...prev, targetId]);
      setFeedback({ type: 'success', msg: stepInfo.rightTip });
      if (ISLAND_NODES[targetId].exit) {
        setFinished(true);
      }
    } else {
      setFeedback({ type: 'error', msg: stepInfo.wrongTip });
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-indigo-800">
            ⛵ 海島航線大挑戰（進階版）：沿著「分數比較大」的路線走！
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            挑戰升級！請綜合運用「看有沒有超過一半」、「跟 1 比差距（差 2 份）」與「換成帶分數」，點擊
            <b>比較大</b>的分數前進！
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={initMazeGame}
            className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-sm cursor-pointer"
          >
            🔄 重新航行
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-lg border-2 border-sky-200 space-y-3">
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-black text-sky-900 text-sm sm:text-base">
            <span className="text-xl">🧭</span>
            <span>{instructionText}</span>
          </div>
          <span className="bg-sky-600 text-white text-xs font-black px-3 py-1 rounded-full">
            進度：{stepCount} / 3 步
          </span>
        </div>

        {/* 互動海洋路線 SVG */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px] max-w-4xl mx-auto">
            <svg
              viewBox="0 0 750 330"
              className="w-full h-auto rounded-2xl shadow-inner border border-sky-200 bg-[#dff2fe]"
            >
              <path
                d="M 30 30 Q 180 5 380 20 T 720 35 L 735 295 Q 520 325 320 305 T 25 290 Z"
                fill="#cbeafe"
                opacity="0.7"
              />
              <text x="150" y="275" fill="#7dd3fc" fontSize="16">
                🐟 🐠
              </text>
              <text x="640" y="175" fill="#7dd3fc" fontSize="16">
                🐟
              </text>

              {/* 航道底線 */}
              {Object.values(ISLAND_NODES).map((node) => (
                <g key={`paths-${node.id}`}>
                  {node.next?.map((targetId) => {
                    const target = ISLAND_NODES[targetId];
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="#ffffff"
                        strokeWidth="14"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    );
                  })}
                  {node.exit && (
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={ISLAND_EXITS.find((e) => e.id === node.exit)!.x}
                      y2={ISLAND_EXITS.find((e) => e.id === node.exit)!.y}
                      stroke="#ffffff"
                      strokeWidth="14"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  )}
                </g>
              ))}

              {/* 已航行黃色路線 */}
              {pathHistory.slice(0, -1).map((id, idx) => {
                const n1 = ISLAND_NODES[id];
                const n2 = ISLAND_NODES[pathHistory[idx + 1]];
                return (
                  <line
                    key={`visited-${id}-${n2.id}`}
                    x1={n1.x}
                    y1={n1.y}
                    x2={n2.x}
                    y2={n2.y}
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                );
              })}
              {finished && currentNode.exit && (
                <line
                  x1={currentNode.x}
                  y1={currentNode.y}
                  x2={ISLAND_EXITS.find((e) => e.id === currentNode.exit)!.x}
                  y2={ISLAND_EXITS.find((e) => e.id === currentNode.exit)!.y}
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              )}

              {/* 四個出口標籤 */}
              {ISLAND_EXITS.map((ex) => {
                const isReached = finished && currentNode.exit === ex.id;
                return (
                  <g key={ex.id} transform={`translate(${ex.x - 48}, ${ex.y - 18})`}>
                    <rect
                      width="96"
                      height="36"
                      rx="18"
                      fill={isReached ? '#fde047' : '#fef08a'}
                      stroke={isReached ? '#ea580c' : '#eab308'}
                      strokeWidth={isReached ? 3.5 : 2}
                    />
                    <text
                      x="34"
                      y="23"
                      textAnchor="middle"
                      fill="#1e293b"
                      fontSize="14"
                      fontWeight="900"
                    >
                      出口
                    </text>
                    <circle
                      cx="72"
                      cy="18"
                      r="12"
                      fill="#ffffff"
                      stroke="#ca8a04"
                      strokeWidth="1.5"
                    />
                    <text
                      x="72"
                      y="23"
                      textAnchor="middle"
                      fill="#1e293b"
                      fontSize="14"
                      fontWeight="900"
                    >
                      {ex.id}
                    </text>
                  </g>
                );
              })}

              {/* 節點圓圈 */}
              {Object.values(ISLAND_NODES).map((node) => {
                if (node.id === 'start') return null;
                const isCandidate = candidateIds.includes(node.id);
                const isVisited = pathHistory.includes(node.id);

                let circleFill = '#ffffff';
                let circleStroke = '#38bdf8';
                let strokeW = 2.5;
                if (isCandidate) {
                  circleFill = '#fffbeb';
                  circleStroke = '#f59e0b';
                  strokeW = 4;
                } else if (isVisited) {
                  circleFill = '#fef3c7';
                  circleStroke = '#d97706';
                  strokeW = 3.5;
                }

                return (
                  <g
                    key={node.id}
                    onClick={isCandidate ? () => selectIslandNode(node.id) : undefined}
                    className={isCandidate ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
                  >
                    {isCandidate && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="33"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="5,3"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="27"
                      fill={circleFill}
                      stroke={circleStroke}
                      strokeWidth={strokeW}
                    />
                    <text
                      x={node.x}
                      y={node.y - 5}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="14"
                      fontWeight="900"
                    >
                      {node.n}
                    </text>
                    <line
                      x1={node.x - 12}
                      y1={node.y}
                      x2={node.x + 12}
                      y2={node.y}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y + 15}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="14"
                      fontWeight="900"
                    >
                      {node.d}
                    </text>
                  </g>
                );
              })}

              {/* 航行小船 */}
              <g
                transform={`translate(${currentNode.x - 46}, ${currentNode.y - 22})`}
                style={{ transition: 'all 0.5s ease' }}
              >
                <polygon
                  points="8,24 84,24 74,40 18,40"
                  fill="#a3e635"
                  stroke="#4d7c0f"
                  strokeWidth="2"
                />
                <rect
                  x="26"
                  y="10"
                  width="28"
                  height="14"
                  rx="3"
                  fill="#fef08a"
                  stroke="#ca8a04"
                  strokeWidth="1.5"
                />
                <circle
                  cx="62"
                  cy="14"
                  r="8"
                  fill="#38bdf8"
                  stroke="#0369a1"
                  strokeWidth="1.5"
                />
                <text
                  x="46"
                  y="36"
                  textAnchor="middle"
                  fill="#1a2e05"
                  fontSize="12"
                  fontWeight="900"
                >
                  {currentNode.id === 'start' ? '起點 ➔' : '⛵'}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* 觸礁警告或通關祝賀區 */}
        {feedback && (
          <div
            className={`rounded-2xl p-4 border-2 text-sm sm:text-base font-bold transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-rose-50 border-rose-400 text-rose-900'
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </div>
    </section>
  );
};
