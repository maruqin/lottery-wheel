export interface Prize {
  id: string;
  name: string;
  /** 中奖概率权重，0-100 */
  probability: number;
  /** 剩余奖品数量，为 0 时不可抽中 */
  quantity: number;
  color: string;
}

export interface WheelSegment {
  id: string;
  name: string;
  type: "prize" | "thanks";
  /** 抽奖权重 */
  selectWeight: number;
  /** 扇区显示权重 */
  displayWeight: number;
  color: string;
  prizeId?: string;
  depleted?: boolean;
}

export interface SpinResult {
  segment: WheelSegment;
  segmentIndex: number;
  targetRotation: number;
}

export const THANKS_ID = "thanks";
export const THANKS_NAME = "谢谢参与";

export const DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "一等奖", probability: 5, quantity: 1, color: "#FF3B30" },
  { id: "2", name: "二等奖", probability: 10, quantity: 3, color: "#FF9500" },
  { id: "3", name: "三等奖", probability: 15, quantity: 5, color: "#FFCC00" },
  { id: "4", name: "幸运奖", probability: 20, quantity: 10, color: "#34C759" },
];

export const PRIZE_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
];
