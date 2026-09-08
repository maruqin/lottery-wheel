import {
  Prize,
  SpinResult,
  THANKS_ID,
  THANKS_NAME,
  WheelSegment,
} from "./types";

const MIN_DEPLETED_DISPLAY_WEIGHT = 4;
const THANKS_COLOR = "#8E8E93";

/** 根据奖品列表构建转盘扇区 */
export function buildWheelSegments(prizes: Prize[]): WheelSegment[] {
  const prizeSegments: WheelSegment[] = prizes.map((prize) => {
    const available = prize.quantity > 0;
    return {
      id: prize.id,
      name: prize.name,
      type: "prize",
      selectWeight: available ? prize.probability : 0,
      displayWeight: available
        ? prize.probability
        : MIN_DEPLETED_DISPLAY_WEIGHT,
      color: prize.color,
      prizeId: prize.id,
      depleted: !available,
    };
  });

  const availableProbSum = prizes
    .filter((p) => p.quantity > 0)
    .reduce((s, p) => s + p.probability, 0);
  // 库存为 0 的奖项不参与抽奖，其概率自动归入「谢谢参与」
  const thanksSelectWeight = Math.max(0, 100 - availableProbSum);

  const thanksSegment: WheelSegment = {
    id: THANKS_ID,
    name: THANKS_NAME,
    type: "thanks",
    selectWeight: thanksSelectWeight,
    displayWeight: Math.max(thanksSelectWeight, 15),
    color: THANKS_COLOR,
  };

  return [...prizeSegments, thanksSegment];
}

/** 归一化显示权重，计算每个扇区的角度范围 */
export function getSegmentAngles(segments: WheelSegment[]): {
  start: number;
  end: number;
  mid: number;
}[] {
  const totalDisplay = segments.reduce((s, seg) => s + seg.displayWeight, 0);
  let cursor = -90; // 从顶部（指针方向）开始

  return segments.map((seg) => {
    const sweep = (seg.displayWeight / totalDisplay) * 360;
    const start = cursor;
    const end = cursor + sweep;
    const mid = start + sweep / 2;
    cursor = end;
    return { start, end, mid };
  });
}

/** 按权重随机抽取结果 */
export function pickWinner(segments: WheelSegment[]): SpinResult {
  const selectable = segments.filter((s) => s.selectWeight > 0);
  if (selectable.length === 0) {
    const thanksIdx = segments.findIndex((s) => s.id === THANKS_ID);
    const idx = thanksIdx >= 0 ? thanksIdx : 0;
    return buildSpinResult(segments, idx);
  }

  const totalWeight = selectable.reduce((s, seg) => s + seg.selectWeight, 0);
  let rand = Math.random() * totalWeight;

  for (const seg of selectable) {
    rand -= seg.selectWeight;
    if (rand <= 0) {
      const index = segments.findIndex((s) => s.id === seg.id);
      return buildSpinResult(segments, index);
    }
  }

  const lastSelectable = selectable[selectable.length - 1];
  const index = segments.findIndex((s) => s.id === lastSelectable.id);
  return buildSpinResult(segments, index);
}

function buildSpinResult(segments: WheelSegment[], index: number): SpinResult {
  const angles = getSegmentAngles(segments);
  const { mid } = angles[index];

  // 指针在顶部 (-90°)，转盘顺时针旋转后扇区中心对准指针
  const extraSpins = 5 + Math.floor(Math.random() * 4);
  const targetRotation = extraSpins * 360 + (-90 - mid);

  return {
    segment: segments[index],
    segmentIndex: index,
    targetRotation,
  };
}

/** 扣减中奖奖品库存 */
export function decrementPrizeQuantity(
  prizes: Prize[],
  prizeId: string
): Prize[] {
  return prizes.map((p) =>
    p.id === prizeId && p.quantity > 0
      ? { ...p, quantity: p.quantity - 1 }
      : p
  );
}
