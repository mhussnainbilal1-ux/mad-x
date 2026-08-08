"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import useIsMobile from "@/app/hooks/useIsMobile";

export default function ImageZoomWrapper({ children }) {
  const isMobile = useIsMobile();

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const resetImage = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (e) => {
    if (isMobile) return;

    setDragging(true);

    setStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isMobile || !dragging) return;

    setPosition({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });
  };

  const handlePointerUp = () => {
    if (isMobile) return;

    setDragging(false);
  };

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: "100%",
          overflow: "hidden",
          cursor: isMobile
            ? "default"
            : dragging
              ? "grabbing"
              : "grab",

          touchAction: isMobile ? "auto" : "none",
        }}
      >
        <div
          style={{
            transform: `
              translate(${position.x}px, ${position.y}px)
              scale(${zoom})
            `,
            transformOrigin: "center",
            transition: dragging
              ? "none"
              : "transform 0.15s ease",
          }}
        >
          {children}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "15px",
        }}
      >
        <span>−</span>

        <input
          type="range"
          min="0.3"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(e) =>
            setZoom(Number(e.target.value))
          }
          style={{
            flex: 1,
            cursor: "pointer",
          }}
        />

        <span>+</span>

        <span
          style={{
            minWidth: "50px",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={resetImage}
          title="Reset image"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            background: "var(--surface)",
            color: "var(--ink)",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          textAlign: "center",
        }}
      >
        {isMobile
          ? "Slide to zoom"
          : "Drag to explore details • Slide to zoom"}
      </p>
    </>
  );
}