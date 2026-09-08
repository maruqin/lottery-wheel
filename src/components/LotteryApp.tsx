"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fireworks from "@/components/Fireworks";
import LotteryWheel from "@/components/LotteryWheel";
import PrizeSettings from "@/components/PrizeSettings";
import ResultModal from "@/components/ResultModal";
import {
  buildWheelSegments,
  decrementPrizeQuantity,
  pickWinner,
} from "@/lib/lottery";
import { loadPrizes, savePrizes } from "@/lib/storage";
import { DEFAULT_PRIZES, Prize, THANKS_ID } from "@/lib/types";

export default function LotteryApp() {
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultName, setResultName] = useState("");
  const [isWin, setIsWin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const pendingResult = useRef<{
    segmentId: string;
    name: string;
    isWin: boolean;
  } | null>(null);

  const segments = useMemo(() => buildWheelSegments(prizes), [prizes]);

  useEffect(() => {
    setPrizes(loadPrizes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) savePrizes(prizes);
  }, [prizes, loaded]);

  const handleSpin = useCallback(() => {
    if (spinning) return;

    const result = pickWinner(segments);
    pendingResult.current = {
      segmentId: result.segment.id,
      name: result.segment.name,
      isWin: result.segment.type === "prize" && !result.segment.depleted,
    };

    setSpinning(true);

    // 累加旋转角度，保证每次都顺时针多转几圈
    setRotation((prev) => {
      const currentMod = ((prev % 360) + 360) % 360;
      const targetMod =
        ((result.targetRotation % 360) + 360) % 360;
      let delta = targetMod - currentMod;
      if (delta <= 0) delta += 360;
      return prev + delta + 360 * (5 + Math.floor(Math.random() * 3));
    });

    setTimeout(() => {
      setSpinning(false);

      const pending = pendingResult.current;
      if (!pending) return;

      const won = pending.isWin;
      setResultName(pending.name);
      setIsWin(won);
      setResultOpen(true);

      if (won && pending.segmentId !== THANKS_ID) {
        setPrizes((prev) => decrementPrizeQuantity(prev, pending.segmentId));
        setShowFireworks(true);
      }

      pendingResult.current = null;
    }, 4600);
  }, [spinning, segments]);

  const handleReset = () => {
    setPrizes(DEFAULT_PRIZES);
  };

  const remainingTotal = prizes.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="flex min-h-full flex-col bg-[#F2F2F7]">
      {/* 顶部导航栏 - iOS 风格 */}
      <header className="sticky top-0 z-30 border-b border-[#E5E5EA]/60 bg-white/72 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1C1C1E]">
              年会抽奖
            </h1>
            <p className="text-[13px] text-[#8E8E93]">
              剩余奖品 {remainingTotal} 份
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#007AFF] px-4 text-[15px] font-semibold text-white shadow-sm active:scale-95 active:opacity-80"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            设置
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-5 py-8">
        {/* 转盘区域 */}
        <div className="mb-8 mt-4">
          <LotteryWheel
            segments={segments}
            rotation={rotation}
            spinning={spinning}
          />
        </div>

        {/* 抽奖按钮 */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="group relative w-full max-w-xs overflow-hidden rounded-2xl py-4 text-[20px] font-bold text-white shadow-lg transition-all active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
          style={{
            background: spinning
              ? "linear-gradient(135deg, #8E8E93, #AEAEB2)"
              : "linear-gradient(135deg, #007AFF, #5856D6)",
            boxShadow: spinning
              ? "0 4px 16px rgba(0,0,0,0.1)"
              : "0 8px 24px rgba(0,122,255,0.35)",
          }}
        >
          {spinning ? "抽奖中..." : "开始抽奖"}
        </button>

        {/* 奖品概览卡片 */}
        <div className="mt-8 w-full rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            奖品一览
          </h3>
          <div className="space-y-2">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between rounded-xl bg-[#F2F2F7] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: prize.color }}
                  />
                  <span
                    className={`text-[15px] font-medium ${
                      prize.quantity === 0
                        ? "text-[#C7C7CC] line-through"
                        : "text-[#1C1C1E]"
                    }`}
                  >
                    {prize.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px]">
                  <span className="text-[#8E8E93]">{prize.probability}%</span>
                  <span
                    className={`min-w-[2.5rem] text-right font-semibold ${
                      prize.quantity === 0 ? "text-[#FF3B30]" : "text-[#34C759]"
                    }`}
                  >
                    ×{prize.quantity}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-[#F2F2F7] px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-[#8E8E93]" />
                <span className="text-[15px] font-medium text-[#8E8E93]">
                  谢谢参与
                </span>
              </div>
              <span className="text-[13px] text-[#8E8E93]">
                {Math.max(
                  0,
                  100 - prizes.reduce((s, p) => s + p.probability, 0)
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 设置面板 */}
      <PrizeSettings
        open={settingsOpen}
        prizes={prizes}
        onClose={() => setSettingsOpen(false)}
        onChange={setPrizes}
        onReset={handleReset}
      />

      {/* 结果弹窗 */}
      <ResultModal
        open={resultOpen}
        prizeName={resultName}
        isWin={isWin}
        onClose={() => setResultOpen(false)}
      />

      {/* 烟花 */}
      <Fireworks
        active={showFireworks}
        onComplete={() => setShowFireworks(false)}
      />
    </div>
  );
}
