import { useState } from "react";

const ALL_DRINKS = [
  { id: "A", name: "蓝色", color: "#4FC3F7", bg: "rgba(79,195,247,0.13)" },
  { id: "B", name: "红色", color: "#EF5350", bg: "rgba(239,83,80,0.13)" },
  { id: "C", name: "橙色", color: "#FFA726", bg: "rgba(255,167,38,0.13)" },
  { id: "D", name: "绿色", color: "#66BB6A", bg: "rgba(102,187,106,0.13)" },
  { id: "E", name: "紫色", color: "#CE93D8", bg: "rgba(206,147,216,0.13)" },
  { id: "F", name: "棕色", color: "#BCAAA4", bg: "rgba(188,170,164,0.13)" },
  { id: "G", name: "粉色", color: "#F48FB1", bg: "rgba(244,143,177,0.13)" },
  { id: "H", name: "青色", color: "#4DB6AC", bg: "rgba(77,182,172,0.13)" },
  { id: "I", name: "黄色", color: "#FFD54F", bg: "rgba(255,213,79,0.13)" },
  { id: "J", name: "深红", color: "#FF5252", bg: "rgba(255,82,82,0.13)" },
  { id: "K", name: "天蓝", color: "#29B6F6", bg: "rgba(41,182,246,0.13)" },
  { id: "L", name: "金色", color: "#FFD700", bg: "rgba(255,215,0,0.13)" },
];

const MIN_DRINKS = 2;
const MAX_DRINKS = ALL_DRINKS.length;
const ROWS = 5;
const COLS = 4;
const MAX = 6;

const mkCell = (drinks) => Object.fromEntries(drinks.map((d) => [d.id, 0]));
const mkBoard = (drinks) =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => mkCell(drinks)));
// Tray: { shape: 'single'|'double', top: cell, bottom: cell }
const mkTray = (drinks) => ({ shape: "single", top: mkCell(drinks), bottom: mkCell(drinks) });

const totalDrinks = (cell) => Object.values(cell).reduce((s, v) => s + v, 0);
const cellStr = (cell, drinks) => {
  const parts = drinks.filter((d) => (cell[d.id] || 0) > 0).map((d) => `${d.name}×${cell[d.id]}`);
  return parts.length ? parts.join("、") : "空";
};

/* ── Drink pills display ── */
function DrinkPills({ cell, drinks, small }) {
  const items = drinks.filter((d) => (cell[d.id] || 0) > 0);
  if (!items.length) return <span style={{ color: "#3a3a5c", fontSize: 10 }}>空</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
      {items.map((d) => (
        <div key={d.id} style={{
          background: d.bg, color: d.color, border: `1px solid ${d.color}55`,
          borderRadius: 4, padding: small ? "0 3px" : "1px 5px",
          fontSize: small ? 10 : 11, fontWeight: 700, lineHeight: "16px",
        }}>
          {d.name[0]}{cell[d.id]}
        </div>
      ))}
    </div>
  );
}

/* ── Single cell drink editor (used inside modals) ── */
function DrinkRowEditor({ cell, drinks, onChange }) {
  const tot = totalDrinks(cell);
  const adjust = (id, delta) => {
    if (delta > 0 && tot >= MAX) return;
    const nv = Math.max(0, (cell[id] || 0) + delta);
    onChange({ ...cell, [id]: nv });
  };
  return (
    <div>
      <div style={{
        background: "#1a1a30", borderRadius: 6, padding: "4px 0",
        marginBottom: 8, textAlign: "center", fontSize: 12,
        color: tot === MAX ? "#66BB6A" : "#888",
      }}>
        已放 <span style={{ fontWeight: 800, fontSize: 16 }}>{tot}</span>/6 杯{tot === MAX && " ✓"}
      </div>
      {drinks.map((d) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", marginBottom: 7, gap: 6 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
          <span style={{ color: d.color, fontSize: 11, width: 30 }}>{d.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => adjust(d.id, -1)} style={miniBtn}>−</button>
            <span style={{ width: 20, textAlign: "center", color: (cell[d.id] || 0) > 0 ? d.color : "#3a3a5c", fontWeight: 800, fontSize: 14 }}>
              {cell[d.id] || 0}
            </span>
            <button onClick={() => adjust(d.id, 1)} style={miniBtn}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Board cell editor ── */
function CellEditor({ cell, title, drinks, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...cell });
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={modalTitle}>{title}</div>
        <DrinkRowEditor cell={draft} drinks={drinks} onChange={setDraft} />
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => setDraft(mkCell(drinks))} style={btn("#1a1a30", "#777")}>清空</button>
          <button onClick={() => onSave(draft)} style={{ ...btn("#c8a96e", "#10101e"), flex: 2, fontWeight: 800 }}>确认</button>
          <button onClick={onClose} style={btn("#1a1a30", "#777")}>取消</button>
        </div>
      </div>
    </div>
  );
}

/* ── Tray editor (supports single/double) ── */
function TrayEditor({ tray, idx, drinks, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...tray, top: { ...tray.top }, bottom: { ...tray.bottom } });

  const setShape = (shape) => setDraft((p) => ({ ...p, shape }));
  const setTop = (top) => setDraft((p) => ({ ...p, top }));
  const setBottom = (bottom) => setDraft((p) => ({ ...p, bottom }));

  return (
    <div style={overlay}>
      <div style={{ ...modal, width: 300, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={modalTitle}>编辑吧台托盘 {idx + 1}</div>

        {/* Shape toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[
            { v: "single", label: "单格", sub: "占 1 个格子" },
            { v: "double", label: "双格", sub: "占上下 2 格" },
          ].map((o) => (
            <div
              key={o.v}
              onClick={() => setShape(o.v)}
              style={{
                flex: 1, background: draft.shape === o.v ? "#2a1f00" : "#1a1a30",
                border: `1.5px solid ${draft.shape === o.v ? "#c8a96e" : "#3a3a5c"}`,
                borderRadius: 8, padding: "8px 6px", cursor: "pointer",
                textAlign: "center", transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: draft.shape === o.v ? "#c8a96e" : "#666" }}>
                {o.label}
              </div>
              <div style={{ fontSize: 10, color: draft.shape === o.v ? "#a07840" : "#444", marginTop: 2 }}>
                {o.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Visual preview of shape */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            <div style={{
              width: 52, height: draft.shape === "double" ? 30 : 44,
              background: "#252540", border: "1px solid #c8a96e66", borderRadius: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 9, color: "#c8a96e" }}>上格</span>
            </div>
            {draft.shape === "double" && (
              <>
                <div style={{ width: 52, height: 30, background: "#252540", border: "1px solid #c8a96e44", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, color: "#c8a96e88" }}>下格</span>
                </div>
                <div style={{ fontSize: 9, color: "#EF5350", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                  <span>🔒</span><span>上下格不可拆分，同时落入相邻格</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top cell */}
        <div style={{ background: "#161626", borderRadius: 8, padding: "10px 10px 4px", marginBottom: draft.shape === "double" ? 8 : 0 }}>
          <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, marginBottom: 8 }}>
            {draft.shape === "double" ? "▲ 上格" : "格子内容"}
          </div>
          <DrinkRowEditor cell={draft.top} drinks={drinks} onChange={setTop} />
        </div>

        {/* Bottom cell (only for double) */}
        {draft.shape === "double" && (
          <div style={{ background: "#161626", borderRadius: 8, padding: "10px 10px 4px" }}>
            <div style={{ fontSize: 11, color: "#8898aa", fontWeight: 700, marginBottom: 8 }}>▼ 下格</div>
            <DrinkRowEditor cell={draft.bottom} drinks={drinks} onChange={setBottom} />
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => setDraft((p) => ({ ...p, top: mkCell(drinks), bottom: mkCell(drinks) }))}
            style={btn("#1a1a30", "#777")}
          >清空</button>
          <button onClick={() => onSave(draft)} style={{ ...btn("#c8a96e", "#10101e"), flex: 2, fontWeight: 800 }}>确认</button>
          <button onClick={onClose} style={btn("#1a1a30", "#777")}>取消</button>
        </div>
      </div>
    </div>
  );
}

/* ── Tray card display ── */
function TrayCard({ tray, idx, drinks, onClick }) {
  const topTotal = totalDrinks(tray.top);
  const botTotal = tray.shape === "double" ? totalDrinks(tray.bottom) : 0;
  const isEmpty = topTotal === 0 && botTotal === 0;

  return (
    <div onClick={onClick} style={{
      background: "#18182c", border: "1.5px dashed #c8a96e55",
      borderRadius: 10, cursor: "pointer", overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "border-color 0.15s",
    }}>
      {/* Tray label + shape badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 2px" }}>
        <span style={{ fontSize: 10, color: "#c8a96e", fontWeight: 700 }}>托盘 {idx + 1}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "1px 6px",
          background: tray.shape === "double" ? "rgba(200,169,110,0.15)" : "rgba(100,100,150,0.2)",
          color: tray.shape === "double" ? "#c8a96e" : "#666",
          border: `1px solid ${tray.shape === "double" ? "#c8a96e44" : "#3a3a5c"}`,
        }}>
          {tray.shape === "double" ? "🔒 双格" : "单格"}
        </span>
      </div>

      {/* Top slot */}
      <div style={{
        borderTop: "1px solid #252540",
        padding: "6px 4px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        minHeight: tray.shape === "double" ? 44 : 54,
        justifyContent: "center",
      }}>
        {tray.shape === "double" && (
          <div style={{ fontSize: 8, color: "#444", alignSelf: "flex-start", paddingLeft: 2 }}>上</div>
        )}
        <DrinkPills cell={tray.top} drinks={drinks} small />
        {topTotal > 0 && <div style={{ fontSize: 9, color: "#555" }}>{topTotal}/6</div>}
        {topTotal === 0 && <div style={{ fontSize: 9, color: "#2a2a44" }}>点击输入</div>}
      </div>

      {/* Bottom slot (double only) */}
      {tray.shape === "double" && (
        <div style={{
          borderTop: "1px dashed #252540",
          padding: "6px 4px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          minHeight: 44, justifyContent: "center",
        }}>
          <div style={{ fontSize: 8, color: "#3a3a5c", alignSelf: "flex-start", paddingLeft: 2 }}>下</div>
          <DrinkPills cell={tray.bottom} drinks={drinks} small />
          {botTotal > 0 && <div style={{ fontSize: 9, color: "#555" }}>{botTotal}/6</div>}
          {botTotal === 0 && <div style={{ fontSize: 9, color: "#2a2a44" }}>点击输入</div>}
        </div>
      )}
    </div>
  );
}

/* ── Shared styles ── */
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
};
const modal = {
  background: "#10101e", border: "1px solid #3a3a5c", borderRadius: 16, padding: 20, width: 280,
};
const modalTitle = { textAlign: "center", color: "#c8a96e", fontWeight: 700, marginBottom: 14, fontSize: 14 };

const miniBtn = {
  background: "#1e1e35", color: "#bbb", border: "1px solid #3a3a5c", borderRadius: 6,
  width: 28, height: 28, cursor: "pointer", fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
};
const btn = (bg, color) => ({
  background: bg, color, border: "none", borderRadius: 8,
  padding: "8px 0", cursor: "pointer", fontSize: 13, flex: 1, fontWeight: 600,
});

/* ══════════════════════════════════════════
   Main App
══════════════════════════════════════════ */
export default function App() {
  const [drinkCount, setDrinkCount] = useState(6);
  const drinks = ALL_DRINKS.slice(0, drinkCount);

  const [board, setBoard] = useState(() => mkBoard(ALL_DRINKS.slice(0, 6)));
  const [barTrays, setBarTrays] = useState(() => {
    const d = ALL_DRINKS.slice(0, 6);
    return [mkTray(d), mkTray(d), mkTray(d)];
  });
  const [editingBoard, setEditingBoard] = useState(null); // {r, c}
  const [editingTray, setEditingTray] = useState(null);   // index
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const changeDrinkCount = (next) => {
    if (next === drinkCount || next < MIN_DRINKS || next > MAX_DRINKS) return;
    setDrinkCount(next);
    const nd = ALL_DRINKS.slice(0, next);
    setBoard(mkBoard(nd));
    setBarTrays([mkTray(nd), mkTray(nd), mkTray(nd)]);
    setAdvice("");
  };

  const saveBoardCell = (draft) => {
    const { r, c } = editingBoard;
    setBoard((b) => b.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? draft : cell)));
    setEditingBoard(null);
  };

  const saveTray = (draft) => {
    setBarTrays((t) => t.map((tr, i) => (i === editingTray ? draft : tr)));
    setEditingTray(null);
  };

  const getAdvice = async () => {
    setLoading(true);
    setAdvice("");

    const boardLines = board.map((row, ri) => {
      const cols = row.map((cell, ci) => {
        const tot = totalDrinks(cell);
        return `[${ri + 1},${ci + 1}]${cellStr(cell, drinks)}(${tot}/6)`;
      });
      return `第${ri + 1}行: ${cols.join("  ")}`;
    });

    // Compute which cells are empty (available for placement)
    const emptyCells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (totalDrinks(board[r][c]) === 0) emptyCells.push(`[${r + 1},${c + 1}]`);
      }
    }
    const emptyCellsStr = emptyCells.length > 0 ? emptyCells.join("、") : "无（没有空格）";

    // For double trays: list pairs of empty consecutive vertical cells
    const emptyPairs = [];
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        if (totalDrinks(board[r][c]) === 0 && totalDrinks(board[r + 1][c]) === 0) {
          emptyPairs.push(`上格[${r + 1},${c + 1}]+下格[${r + 2},${c + 1}]`);
        }
      }
    }
    const emptyPairsStr = emptyPairs.length > 0 ? emptyPairs.join("、") : "无（没有连续空格对）";

    const trayLines = barTrays.map((t, i) => {
      if (t.shape === "single") {
        return `托盘${i + 1}(单格): ${cellStr(t.top, drinks)} 共${totalDrinks(t.top)}杯`;
      } else {
        return `托盘${i + 1}(双格,占上下2格): 上格=${cellStr(t.top, drinks)}(${totalDrinks(t.top)}杯) 下格=${cellStr(t.bottom, drinks)}(${totalDrinks(t.bottom)}杯)`;
      }
    });

    const prompt = `你是酒吧合并游戏的专业顾问。请分析局面并给出最优操作建议。

【游戏规则】
- 桌面: 4列×5行，每格最多6杯（可含多种酒）
- 将吧台托盘拖入桌面格子，相邻同种酒自动合并
- 合并顺序：以放入格为中心，按中→上→下→左→右顺序合并
- 种类多的格子优先合并到种类少的格子；同类少的优先合并到同类多的
- 同种酒凑够6杯→消除获分（满盘）
- 空格自动消失，格满6杯不能再放
- 托盘分单格（占1格）和双格（占上下相邻2格）两种

【⚠️ 极重要约束0：只能放入空格子】
- 吧台托盘只能放进桌面上完全为空（0杯酒）的格子
- 已有酒的格子已被占用，绝对不能再放入新托盘
- 当前可用的空格子：${emptyCellsStr}
- 双格托盘可用的上下连续空格对：${emptyPairsStr}
- 所有建议的坐标必须严格来自上述可用格子列表，否则无效

【⚠️ 极重要约束1：3个托盘必须全部放完】
- 每轮吧台生成的3个托盘必须全部放入桌面，不能跳过或保留任何一个
- 建议中必须给出全部3个托盘的落点，缺一不可

【⚠️ 极重要约束1：双格托盘不可拆分】
- 双格托盘是一个不可分割的整体，上格和下格必须同时落入上下相邻的两个格子
- 绝对不允许将双格托盘的上格和下格拆开放到不相邻的位置
- 建议双格托盘时，只需给出上格坐标 [行R,列C]，下格自动为 [行R+1,列C]

【⚠️ 极重要约束2：托盘之间不能共享格子】
- 本轮3个托盘必须放到3个完全不同的目标格上，任意两个托盘不能占用同一格坐标
- 单格托盘占用 1 个格子；双格托盘占用 2 个格子（均须是空格）
- 在给出建议前，必须自查3个托盘各自占用的所有格坐标是否有任何重叠，有重叠必须重新选择

【当前酒的种类】共${drinkCount}种：${drinks.map((d) => d.name).join("、")}

【当前桌面状态】
${boardLines.join("\n")}

【吧台3个待放托盘】
${trayLines.join("\n")}

请给出：
**结论（简洁版）**
托盘1 → 放到 [行,列]（单/双格）
托盘2 → 放到 [行,列]
托盘3 → 放到 [行,列]
✅ 自查：确认以上坐标全部在可用空格列表内，且互不重叠

**详细分析**
每个托盘放置的原因：放置后与哪些相邻格触发合并？能否接近或完成消除？

**整体策略**
当前局面的关键注意点和下一步方向。`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => (b.type === "text" ? b.text : "")).join("") || "无法获取建议";
      setAdvice(text);
    } catch (e) {
      setAdvice("❌ 获取建议失败: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#090914", color: "#ddd0bb",
      fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
      padding: "14px 12px 28px", maxWidth: 440, margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#c8a96e", letterSpacing: 2 }}>🍸 酒吧合并辅助器</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>点击格子 → 输入酒的种类和数量 → 获取 AI 最优建议</div>
      </div>

      {/* Drink Count Selector */}
      <div style={{ background: "#11111e", border: "1px solid #2a2a44", borderRadius: 12, padding: "12px 14px", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#c8a96e", fontWeight: 700 }}>🎮 已解锁酒的种类</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => changeDrinkCount(drinkCount - 1)} disabled={drinkCount <= MIN_DRINKS}
              style={{ ...miniBtn, opacity: drinkCount <= MIN_DRINKS ? 0.25 : 1, cursor: drinkCount <= MIN_DRINKS ? "default" : "pointer" }}>−</button>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#fff", minWidth: 28, textAlign: "center" }}>{drinkCount}</span>
            <button onClick={() => changeDrinkCount(drinkCount + 1)} disabled={drinkCount >= MAX_DRINKS}
              style={{ ...miniBtn, opacity: drinkCount >= MAX_DRINKS ? 0.25 : 1, cursor: drinkCount >= MAX_DRINKS ? "default" : "pointer" }}>+</button>
            <span style={{ fontSize: 11, color: "#444" }}>/ {MAX_DRINKS}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {ALL_DRINKS.map((d, i) => (
            <div key={d.id} onClick={() => changeDrinkCount(i + 1)} title={`${i + 1}种 — ${d.name}`}
              style={{
                flex: 1, height: 18, borderRadius: 4, cursor: "pointer", transition: "all 0.18s",
                background: i < drinkCount ? d.color : "#1e1e35",
                border: i < drinkCount ? `1px solid ${d.color}` : "1px solid #2a2a44",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <span style={{ fontSize: 8, color: i < drinkCount ? "#0a0a15" : "#333", fontWeight: 800 }}>{d.name[0]}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#444", marginTop: 5, textAlign: "center" }}>点击色块快速切换 · 调整种类数量会重置棋盘</div>
      </div>

      {/* Active Legend */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", margin: "10px 0 12px" }}>
        {drinks.map((d) => (
          <div key={d.id} style={{ background: d.bg, border: `1px solid ${d.color}44`, color: d.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
            {d.name}
          </div>
        ))}
      </div>

      {/* Board */}
      <div style={{ background: "#11111e", border: "1px solid #252540", borderRadius: 12, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#c8a96e", textAlign: "center", marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>
          ▣ 桌面区域（4列 × 5行）
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 3 }}>
          {["1列","2列","3列","4列"].map((h) => (
            <div key={h} style={{ textAlign: "center", fontSize: 9, color: "#3a3a5c", fontWeight: 600 }}>{h}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {board.map((row, ri) =>
            row.map((cell, ci) => {
              const tot = totalDrinks(cell);
              const empty = tot === 0;
              const full = tot === MAX;
              const near = tot >= 4 && !full;
              return (
                <div key={`${ri}-${ci}`} onClick={() => setEditingBoard({ r: ri, c: ci })}
                  style={{
                    background: full ? "#0c280c" : near ? "#221800" : empty ? "#0e0e20" : "#18182c",
                    border: full
                      ? "1.5px solid #4CAF50"
                      : near
                      ? "1.5px solid #FFA726"
                      : empty
                      ? "1.5px dashed #3a3a6a"
                      : "1px solid #3a3a5c",
                    borderRadius: 8, padding: "5px 3px", minHeight: 58, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                    opacity: empty ? 0.7 : 1,
                  }}>
                  <div style={{ fontSize: 8, color: empty ? "#3a3a6a" : "#444" }}>{ri + 1},{ci + 1}</div>
                  {empty
                    ? <span style={{ fontSize: 9, color: "#2a2a50" }}>可放置</span>
                    : <DrinkPills cell={cell} drinks={drinks} small />
                  }
                  {!empty && (
                    <div style={{ fontSize: 9, color: full ? "#4CAF50" : near ? "#FFA726" : "#555", fontWeight: 700 }}>
                      {tot}/6{full ? " ✓" : ""}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { color: "#3a3a6a", label: "空格（可落点）", dashed: true },
            { color: "#4CAF50", label: "满杯可消除" },
            { color: "#FFA726", label: "接近满杯" },
            { color: "#3a3a5c", label: "已占用" },
          ].map((x) => (
            <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                border: `1.5px ${x.dashed ? "dashed" : "solid"} ${x.color}`,
              }} />
              <span style={{ fontSize: 10, color: "#555" }}>{x.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Trays */}
      <div style={{ background: "#11111e", border: "1px solid #252540", borderRadius: 12, padding: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, letterSpacing: 1 }}>🍶 吧台托盘（点击编辑）</span>
          <div style={{ display: "flex", gap: 6 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 20, height: 12, background: "#2a2a44", border: "1px solid #c8a96e44", borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: "#555" }}>单格</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <div style={{ width: 20, height: 7, background: "#2a2a44", border: "1px solid #c8a96e66", borderRadius: 2 }} />
                <div style={{ width: 20, height: 7, background: "#1e1e35", border: "1px dashed #c8a96e44", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 9, color: "#555" }}>双格</span>
            </div>
          </div>
        </div>

        <div style={{
          background: "rgba(239,83,80,0.07)", border: "1px solid rgba(239,83,80,0.25)",
          borderRadius: 7, padding: "5px 10px", marginBottom: 6,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 10, color: "#cc7070", lineHeight: 1.5 }}>
            3个托盘必须放在<strong style={{ color: "#EF5350" }}>不同格子</strong>上，即使一个托盘只有1杯酒也不能与其他托盘共用同一坐标
          </span>
        </div>

        <div style={{
          background: "rgba(100,180,100,0.07)", border: "1px solid rgba(100,180,100,0.25)",
          borderRadius: 7, padding: "5px 10px", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>📋</span>
          <span style={{ fontSize: 10, color: "#80bb80", lineHeight: 1.5 }}>
            每轮<strong style={{ color: "#8fdb8f" }}>3个托盘必须全部放完</strong>，不能跳过或保留，AI 建议会给出全部3个落点
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {barTrays.map((tray, i) => (
            <TrayCard key={i} tray={tray} idx={i} drinks={drinks} onClick={() => setEditingTray(i)} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={getAdvice} disabled={loading} style={{
          flex: 3, background: loading ? "#1a1a2e" : "#c8a96e",
          color: loading ? "#555" : "#0a0a15", border: "none", borderRadius: 10,
          padding: "12px 0", fontWeight: 800, fontSize: 15,
          cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.5, transition: "all 0.2s",
        }}>
          {loading ? "⏳ AI 分析中..." : "🤖 获取最优摆放建议"}
        </button>
        <button onClick={() => {
          setBoard(mkBoard(drinks));
          setBarTrays([mkTray(drinks), mkTray(drinks), mkTray(drinks)]);
          setAdvice("");
        }} style={{ flex: 1, background: "#18182c", color: "#666", border: "1px solid #252540", borderRadius: 10, padding: "12px 0", cursor: "pointer", fontSize: 13 }}>
          重置
        </button>
      </div>

      {/* Advice */}
      {advice && (
        <div style={{ background: "#11111e", border: "1px solid #c8a96e44", borderRadius: 12, padding: 16, animation: "fadeIn 0.3s ease" }}>
          <div style={{ color: "#c8a96e", fontWeight: 800, fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>🤖 AI 最优建议</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: "#cfc4b0", whiteSpace: "pre-wrap" }}>{advice}</div>
        </div>
      )}

      {!advice && !loading && (
        <div style={{ background: "#11111e", border: "1px solid #252540", borderRadius: 12, padding: 14 }}>
          <div style={{ color: "#555", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>使用说明</div>
          <div style={{ color: "#444", fontSize: 11, lineHeight: 1.9 }}>
            1️⃣ 顶部调整已解锁的酒种类数量{"\n"}
            2️⃣ 点击桌面格子输入当前的酒{"\n"}
            3️⃣ 点击吧台托盘 → 选择「单格/双格」→ 输入酒{"\n"}
            4️⃣ 双格托盘需填写上格和下格各自的酒{"\n"}
            5️⃣ 点击「获取最优摆放建议」，AI 分析最佳落点
          </div>
        </div>
      )}

      {/* Board cell editor modal */}
      {editingBoard && (
        <CellEditor
          cell={board[editingBoard.r][editingBoard.c]}
          title={`编辑格子（第 ${editingBoard.r + 1} 行，第 ${editingBoard.c + 1} 列）`}
          drinks={drinks}
          onSave={saveBoardCell}
          onClose={() => setEditingBoard(null)}
        />
      )}

      {/* Tray editor modal */}
      {editingTray !== null && (
        <TrayEditor
          tray={barTrays[editingTray]}
          idx={editingTray}
          drinks={drinks}
          onSave={saveTray}
          onClose={() => setEditingTray(null)}
        />
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
