"use client";

interface ResultModalProps {
  open: boolean;
  prizeName: string;
  isWin: boolean;
  onClose: () => void;
}

export default function ResultModal({
  open,
  prizeName,
  isWin,
  onClose,
}: ResultModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm animate-[scaleIn_0.35s_ease-out] overflow-hidden rounded-[20px] bg-white shadow-2xl"
        style={{
          animation: "scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="mb-4 text-5xl">{isWin ? "🎉" : "😊"}</div>
          <h3 className="mb-1 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
            {isWin ? "恭喜中奖" : "很遗憾"}
          </h3>
          <p className="text-[28px] font-bold text-[#1C1C1E]">{prizeName}</p>
          {isWin && (
            <p className="mt-2 text-[15px] text-[#8E8E93]">
              请到工作人员处领取奖品
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full border-t border-[#E5E5EA] py-4 text-[17px] font-semibold text-[#007AFF] active:bg-[#F2F2F7]"
        >
          好的
        </button>
      </div>
    </div>
  );
}
