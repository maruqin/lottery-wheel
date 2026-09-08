"use client";

import { Prize, PRIZE_COLORS } from "@/lib/types";

interface PrizeSettingsProps {
  open: boolean;
  prizes: Prize[];
  onClose: () => void;
  onChange: (prizes: Prize[]) => void;
  onReset: () => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function PrizeSettings({
  open,
  prizes,
  onClose,
  onChange,
  onReset,
}: PrizeSettingsProps) {
  if (!open) return null;

  const totalProb = prizes.reduce((s, p) => s + p.probability, 0);
  const thanksProb = Math.max(0, 100 - totalProb);

  const updatePrize = (id: string, patch: Partial<Prize>) => {
    onChange(prizes.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addPrize = () => {
    const color = PRIZE_COLORS[prizes.length % PRIZE_COLORS.length];
    onChange([
      ...prizes,
      {
        id: generateId(),
        name: `奖项 ${prizes.length + 1}`,
        probability: 5,
        quantity: 1,
        color,
      },
    ]);
  };

  const removePrize = (id: string) => {
    if (prizes.length <= 1) return;
    onChange(prizes.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[20px] bg-[#F2F2F7] shadow-2xl sm:rounded-[20px]">
        {/* 拖拽条 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#C7C7CC]" />
        </div>

        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-[#E5E5EA] bg-white/80 px-5 py-4 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="text-[17px] text-[#007AFF] active:opacity-60"
          >
            完成
          </button>
          <h2 className="text-[17px] font-semibold text-[#1C1C1E]">奖项设置</h2>
          <button
            onClick={onReset}
            className="text-[17px] text-[#FF3B30] active:opacity-60"
          >
            重置
          </button>
        </div>

        {/* 概率提示 */}
        <div className="mx-4 mt-4 rounded-xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#8E8E93]">奖品概率合计</span>
            <span
              className={`font-semibold ${totalProb > 100 ? "text-[#FF3B30]" : "text-[#1C1C1E]"}`}
            >
              {totalProb}%
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[13px]">
            <span className="text-[#8E8E93]">谢谢参与概率</span>
            <span className="font-semibold text-[#8E8E93]">{thanksProb}%</span>
          </div>
          {totalProb > 100 && (
            <p className="mt-2 text-[12px] text-[#FF3B30]">
              概率合计超过 100%，请调整各奖项概率
            </p>
          )}
        </div>

        {/* 奖品列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div
                key={prize.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-[#F2F2F7] px-4 py-3">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: prize.color }}
                  />
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) =>
                      updatePrize(prize.id, { name: e.target.value })
                    }
                    className="flex-1 bg-transparent text-[17px] font-medium text-[#1C1C1E] outline-none"
                    placeholder="奖项名称"
                  />
                  {prizes.length > 1 && (
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="text-[13px] text-[#FF3B30] active:opacity-60"
                    >
                      删除
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#F2F2F7]">
                  <div className="px-4 py-3">
                    <label className="mb-1 block text-[12px] text-[#8E8E93]">
                      中奖概率 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={prize.probability}
                      onChange={(e) =>
                        updatePrize(prize.id, {
                          probability: Math.max(
                            0,
                            Math.min(100, Number(e.target.value) || 0)
                          ),
                        })
                      }
                      className="w-full bg-transparent text-[17px] font-semibold text-[#007AFF] outline-none"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <label className="mb-1 block text-[12px] text-[#8E8E93]">
                      剩余数量
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={prize.quantity}
                      onChange={(e) =>
                        updatePrize(prize.id, {
                          quantity: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className={`w-full bg-transparent text-[17px] font-semibold outline-none ${
                        prize.quantity === 0
                          ? "text-[#FF3B30]"
                          : "text-[#34C759]"
                      }`}
                    />
                  </div>
                </div>

                {/* 颜色选择 */}
                <div className="flex items-center gap-2 border-t border-[#F2F2F7] px-4 py-2.5">
                  <span className="text-[12px] text-[#8E8E93]">颜色</span>
                  <div className="flex flex-wrap gap-2">
                    {PRIZE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updatePrize(prize.id, { color })}
                        className={`h-6 w-6 rounded-full transition-transform active:scale-90 ${
                          prize.color === color
                            ? "ring-2 ring-[#007AFF] ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addPrize}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[17px] font-medium text-[#007AFF] shadow-sm active:bg-[#F2F2F7]"
          >
            <span className="text-xl leading-none">+</span>
            添加奖项
          </button>
        </div>
      </div>
    </div>
  );
}
