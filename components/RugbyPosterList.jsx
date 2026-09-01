"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

export default function RugbyPosterList({
  posters,
  dialogLabel = "Catalogue poster viewer",
}) {
  const [activePoster, setActivePoster] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    if (!activePoster) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") setActivePoster(null);
      if (event.key === "+" || event.key === "=") {
        setZoom((value) => Math.min(3, value + 0.25));
      }
      if (event.key === "-") {
        setZoom((value) => Math.max(0.5, value - 0.25));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePoster]);

  function openPoster(poster) {
    setZoom(1);
    setActivePoster(poster);
  }

  function startDrag(event) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    setDragging(true);
  }

  function moveDrag(event) {
    if (!dragStart.current) return;
    event.currentTarget.scrollLeft =
      dragStart.current.scrollLeft - (event.clientX - dragStart.current.pointerX);
    event.currentTarget.scrollTop =
      dragStart.current.scrollTop - (event.clientY - dragStart.current.pointerY);
  }

  function stopDrag(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStart.current = null;
    setDragging(false);
  }

  return (
    <>
      <div className="rugbyPosterList">
        {posters.map((poster) => (
          <button
            className="rugbyListPoster"
            type="button"
            onClick={() => openPoster(poster)}
            key={poster.src}
            aria-label={`Enlarge ${poster.alt}`}
          >
            <img
              src={poster.src}
              alt={poster.alt}
              width="1536"
              height="1024"
              loading={poster.src === posters[0]?.src ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {activePoster && (
        <div
          className="rugbyLightbox"
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePoster(null);
          }}
        >
          <div className="rugbyLightboxToolbar">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
            >
              <Minus size={20} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
              aria-label="Zoom in"
              disabled={zoom >= 3}
            >
              <Plus size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                if (viewportRef.current) {
                  viewportRef.current.scrollTo({ top: 0, left: 0 });
                }
              }}
              aria-label="Reset zoom and position"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="rugbyLightboxClose"
              type="button"
              onClick={() => setActivePoster(null)}
              aria-label="Close poster viewer"
              autoFocus
            >
              <X size={22} />
            </button>
          </div>

          <div
            className={`rugbyLightboxViewport ${zoom > 1 ? "canDrag" : ""} ${dragging ? "dragging" : ""}`}
            ref={viewportRef}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
          >
            <div
              className="rugbyLightboxCanvas"
              style={{ width: `min(${1200 * zoom}px, ${92 * zoom}vw)` }}
            >
              <img
                src={activePoster.src}
                alt={activePoster.alt}
                width="1536"
                height="1024"
                draggable="false"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
