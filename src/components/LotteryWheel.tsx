"use client";

import { useMemo } from "react";
import { getSegmentAngles } from "@/lib/lottery";
import { WheelSegment } from "@/lib/types";

interface LotteryWheelProps {
  segments: WheelSegment[];
  rotation: number;
  spinning: boolean;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function LotteryWheel({
  segments,
  rotation,
  spinning,
}: LotteryWheelProps) {
  const angles = useMemo(() => getSegmentAngles(segments), [segments]);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* 指针 */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
        <div className="relative flex flex-col items-center">
          <div
            className="h-0 w-0 border-x-[14px] border-t-[24px] border-x-transparent border-t-[#FF3B30]"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
          />
          <div className="absolute -top-1 h-3 w-3 rounded-full bg-[#FF3B30] shadow-md" />
        </div>
      </div>

      {/* 外圈装饰 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(145deg, #fff 0%, #e8e8ed 100%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.8)",
        }}
      />

      {/* 转盘 */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 z-10"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        }}
      >
        {segments.map((seg, i) => {
          const { start, end, mid } = angles[i];
          const labelPos = polarToCartesian(cx, cy, r * 0.62, mid);
          const textRotate = mid + 90;

          return (
            <g key={seg.id}>
              <path
                d={describeArc(cx, cy, r, start, end)}
                fill={seg.depleted ? `${seg.color}55` : seg.color}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill={seg.depleted ? "#8E8E93" : "#fff"}
                fontSize={seg.name.length > 4 ? "11" : "13"}
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotate}, ${labelPos.x}, ${labelPos.y})`}
                style={{
                  textShadow: seg.depleted ? "none" : "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {seg.depleted ? `${seg.name}(空)` : seg.name}
              </text>
            </g>
          );
        })}

        {/* 中心圆 */}
        <circle cx={cx} cy={cy} r={36} fill="#fff" />
        <circle
          cx={cx}
          cy={cy}
          r={32}
          fill="url(#centerGrad)"
          stroke="#e5e5ea"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f2f2f7" />
          </linearGradient>
        </defs>
        <text
          x={cx}
          y={cy}
          fill="#007AFF"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          GO
        </text>
      </svg>
    </div>
  );
}
