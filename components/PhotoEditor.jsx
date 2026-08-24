"use client";

import {
  BringToFront,
  Download,
  FlipHorizontal2,
  ImagePlus,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Scissors,
  SendToBack,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CANVAS_W = 1000;
const CANVAS_H = 700;

export default function PhotoEditor() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [patternIds, setPatternIds] = useState([]);
  const [patternOutlines, setPatternOutlines] = useState({});
  const [patternMasks, setPatternMasks] = useState({});
  const [background, setBackground] = useState("#f6f4ef");
  const [patternBorderColor, setPatternBorderColor] = useState("#e3182a");
  const [printDpi, setPrintDpi] = useState(300);
  const [artboardWidth, setArtboardWidth] = useState(10);
  const [artboardHeight, setArtboardHeight] = useState(7);
  const [zoom, setZoom] = useState(1);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("png");
  const [draggingOver, setDraggingOver] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState({ x: null, y: null });
  const stageRef = useRef(null);
  const inputRef = useRef(null);
  const actionRef = useRef(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const selectAll = (event) => {
      if ((event.ctrlKey || event.metaKey) && (event.code === "KeyA" || event.key.toLowerCase() === "a")) {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable
        ) return;
        event.preventDefault();
        event.stopPropagation();
        const ids = itemsRef.current?.map((item) => item.id);
        setSelectedIds(ids);
        setSelectedId(ids.at(-1) || null);
      }
    };
    document.addEventListener("keydown", selectAll, true);
    return () => document.removeEventListener("keydown", selectAll, true);
  }, []);

  useEffect(() => {
    const move = (event) => {
      const action = actionRef.current;
      if (!action) return;
      event.preventDefault();
      const rect = stageRef.current.getBoundingClientRect();
      const point = {
        x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
        y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
      };

      let movePosition = null;
      let resizeTransform = null;
      if (action.type === "move") {
        let x = action.startItem.x + point.x - action.start.x;
        let y = action.startItem.y + point.y - action.start.y;
        const movingX = [x, x + action.startItem.w / 2, x + action.startItem.w];
        const movingY = [y, y + action.startItem.h / 2, y + action.startItem.h];
        let closestX = { distance: 7, delta: 0, guide: null };
        let closestY = { distance: 7, delta: 0, guide: null };

        itemsRef.current.forEach((other) => {
          if (other.id === action.id) return;
          const otherX = [other.x, other.x + other.w / 2, other.x + other.w];
          const otherY = [other.y, other.y + other.h / 2, other.y + other.h];
          movingX.forEach((movingAnchor) => otherX.forEach((otherAnchor) => {
            const distance = Math.abs(movingAnchor - otherAnchor);
            if (distance < closestX.distance) closestX = { distance, delta: otherAnchor - movingAnchor, guide: otherAnchor };
          }));
          movingY.forEach((movingAnchor) => otherY.forEach((otherAnchor) => {
            const distance = Math.abs(movingAnchor - otherAnchor);
            if (distance < closestY.distance) closestY = { distance, delta: otherAnchor - movingAnchor, guide: otherAnchor };
          }));
        });

        x += closestX.delta;
        y += closestY.delta;
        movePosition = { x, y };
        setAlignmentGuides({ x: closestX.guide, y: closestY.guide });
      } else {
        setAlignmentGuides({ x: null, y: null });
      }

      if (action.type === "resize") {
        const deltaX = point.x - action.start.x;
        const deltaY = point.y - action.start.y;
        const radians = (action.startItem.rotation * Math.PI) / 180;
        const localX = deltaX * Math.cos(radians) + deltaY * Math.sin(radians);
        const localY = -deltaX * Math.sin(radians) + deltaY * Math.cos(radians);
        const changesWidth = action.handle.includes("e") || action.handle.includes("w");
        const changesHeight = action.handle.includes("n") || action.handle.includes("s");
        const widthDelta = action.handle.includes("w") ? -localX : localX;
        const heightDelta = action.handle.includes("n") ? -localY : localY;
        const scaleX = changesWidth
          ? Math.max(action.minScaleX, (action.startItem.w + widthDelta) / action.startItem.w)
          : 1;
        const scaleY = changesHeight
          ? Math.max(action.minScaleY, (action.startItem.h + heightDelta) / action.startItem.h)
          : 1;
        const anchorX = action.handle.includes("w")
          ? action.groupBounds.right
          : action.handle.includes("e") ? action.groupBounds.left : action.groupCenter.x;
        const anchorY = action.handle.includes("n")
          ? action.groupBounds.bottom
          : action.handle.includes("s") ? action.groupBounds.top : action.groupCenter.y;
        resizeTransform = { scaleX, scaleY, anchorX, anchorY };
      }

      setItems((current) =>
        current?.map((item) => {
          const isGroupResize = action.type === "resize" && action.targetIds.includes(item.id);
          if (item.id !== action.id && !isGroupResize) return item;
          if (action.type === "move") {
            return {
              ...item,
              x: movePosition.x,
              y: movePosition.y,
            };
          }
          if (action.type === "resize") {
            const original = action.startItems[item.id];
            const originalCenterX = original.x + original.w / 2;
            const originalCenterY = original.y + original.h / 2;
            const centerX = resizeTransform.anchorX + (originalCenterX - resizeTransform.anchorX) * resizeTransform.scaleX;
            const centerY = resizeTransform.anchorY + (originalCenterY - resizeTransform.anchorY) * resizeTransform.scaleY;
            const nextW = original.w * resizeTransform.scaleX;
            const nextH = original.h * resizeTransform.scaleY;
            return {
              ...item,
              x: centerX - nextW / 2,
              y: centerY - nextH / 2,
              w: nextW,
              h: nextH,
            };
          }
          const centerX = action.startItem.x + action.startItem.w / 2;
          const centerY = action.startItem.y + action.startItem.h / 2;
          const angle = Math.atan2(point.y - centerY, point.x - centerX) * (180 / Math.PI);
          return { ...item, rotation: action.startItem.rotation + angle - action.startAngle };
        }),
      );
    };

    const end = () => {
      actionRef.current = null;
      setAlignmentGuides({ x: null, y: null });
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, []);

  function addFiles(fileList) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxSize = 360;
          const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
          const w = image.width * scale;
          const h = image.height * scale;
          const id = `${Date.now()}-${index}-${Math.random()}`;
          const offset = (itemsRef.current.length % 6) * 24;
          const next = {
            id,
            src: reader.result,
            name: file.name,
            x: CANVAS_W / 2 - w / 2 + offset,
            y: CANVAS_H / 2 - h / 2 + offset,
            w,
            h,
            rotation: 0,
            flipX: false,
          };
          setItems((current) => [...current, next]);
          setSelectedId(id);
          setSelectedIds([id]);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function pointerPoint(event) {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function beginAction(event, item, type, handle = "se") {
    event.preventDefault();
    event.stopPropagation();
    if (type === "move" && (event.ctrlKey || event.metaKey)) {
      const alreadySelected = selectedIds.includes(item.id);
      const nextSelection = alreadySelected
        ? selectedIds.filter((id) => id !== item.id)
        : [...selectedIds, item.id];
      setSelectedIds(nextSelection);
      setSelectedId(alreadySelected ? (nextSelection.at(-1) || null) : item.id);
      return;
    }
    const targetIds = selectedIds.includes(item.id) ? selectedIds : [item.id];
    setSelectedId(item.id);
    if (!selectedIds.includes(item.id)) setSelectedIds([item.id]);
    const start = pointerPoint(event);
    const centerX = item.x + item.w / 2;
    const centerY = item.y + item.h / 2;
    const selectedItems = items.filter((candidate) => targetIds.includes(candidate.id));
    const left = Math.min(...selectedItems?.map((candidate) => candidate.x));
    const top = Math.min(...selectedItems?.map((candidate) => candidate.y));
    const right = Math.max(...selectedItems?.map((candidate) => candidate.x + candidate.w));
    const bottom = Math.max(...selectedItems?.map((candidate) => candidate.y + candidate.h));
    actionRef.current = {
      id: item.id,
      type,
      start,
      startItem: { ...item },
      targetIds,
      startItems: Object.fromEntries(
        selectedItems?.map((candidate) => [candidate.id, { ...candidate }]),
      ),
      groupCenter: { x: (left + right) / 2, y: (top + bottom) / 2 },
      groupBounds: { left, top, right, bottom },
      minScaleX: Math.max(...selectedItems?.map((candidate) => 40 / candidate.w)),
      minScaleY: Math.max(...selectedItems?.map((candidate) => 40 / candidate.h)),
      handle,
      startAngle: Math.atan2(start.y - centerY, start.x - centerX) * (180 / Math.PI),
    };
  }

  function removeSelected() {
    if (!selectedIds.length) return;
    setItems((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setPatternIds((current) => current.filter((id) => !selectedIds.includes(id)));
    setPatternOutlines((current) => Object.fromEntries(
      Object.entries(current).filter(([id]) => !selectedIds.includes(id)),
    ));
    setPatternMasks((current) => Object.fromEntries(
      Object.entries(current).filter(([id]) => !selectedIds.includes(id)),
    ));
    setSelectedId(null);
    setSelectedIds([]);
  }

  function moveLayer(direction) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === selectedId);
      if (index < 0) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      direction === "front" ? next.push(item) : next.unshift(item);
      return next;
    });
  }

  function resetSelected() {
    setItems((current) =>
      current?.map((item) =>
        selectedIds.includes(item.id) ? { ...item, rotation: 0 } : item,
      ),
    );
  }

  function createMirrorCopy() {
    const selected = items.find((item) => item.id === selectedId);
    if (!selected) return;
    const id = `${Date.now()}-mirror-${Math.random()}`;
    const mirrored = {
      ...selected,
      id,
      name: `${selected.name} (mirrored)`,
      x: selected.x + 28,
      y: selected.y + 28,
      flipX: !selected.flipX,
    };
    setItems((current) => [...current, mirrored]);
    setSelectedId(id);
    setSelectedIds([id]);
  }

  async function createPatternOutline(item) {
    const source = await loadCanvasImage(item.src);
    const scale = Math.min(1200 / source.width, 1200 / source.height, 1);
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const sourceCanvas = document.createElement("canvas");
    const outlineCanvas = document.createElement("canvas");
    sourceCanvas.width = outlineCanvas.width = width;
    sourceCanvas.height = outlineCanvas.height = height;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(source, 0, 0, width, height);
    const pixels = sourceContext.getImageData(0, 0, width, height).data;
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskContext = maskCanvas.getContext("2d");
    const outlineContext = outlineCanvas.getContext("2d");
    const mask = maskContext.createImageData(width, height);
    const outline = outlineContext.createImageData(width, height);
    const radius = 2;
    let transparentPixels = 0;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 20) transparentPixels += 1;
    }
    const hasTransparentBackground = transparentPixels > width * height * 0.002;
    const cornerPoints = [
      0,
      (width - 1) * 4,
      ((height - 1) * width) * 4,
      ((height * width) - 1) * 4,
    ];
    const background = cornerPoints.reduce(
      (color, index) => ({
        r: color.r + pixels[index] / 4,
        g: color.g + pixels[index + 1] / 4,
        b: color.b + pixels[index + 2] / 4,
      }),
      { r: 0, g: 0, b: 0 },
    );
    const objectPixels = new Uint8Array(width * height);
    const exteriorBackground = new Uint8Array(width * height);

    if (!hasTransparentBackground) {
      const queue = new Int32Array(width * height);
      let head = 0;
      let tail = 0;
      const isBackgroundColor = (position) => {
        const pixelIndex = position * 4;
        return Math.sqrt(
          (pixels[pixelIndex] - background.r) ** 2 +
          (pixels[pixelIndex + 1] - background.g) ** 2 +
          (pixels[pixelIndex + 2] - background.b) ** 2,
        ) <= 42;
      };
      const addBackground = (position) => {
        if (exteriorBackground[position] || !isBackgroundColor(position)) return;
        exteriorBackground[position] = 1;
        queue[tail++] = position;
      };
      for (let x = 0; x < width; x += 1) {
        addBackground(x);
        addBackground((height - 1) * width + x);
      }
      for (let y = 0; y < height; y += 1) {
        addBackground(y * width);
        addBackground(y * width + width - 1);
      }
      while (head < tail) {
        const position = queue[head++];
        const x = position % width;
        const y = Math.floor(position / width);
        if (x > 0) addBackground(position - 1);
        if (x < width - 1) addBackground(position + 1);
        if (y > 0) addBackground(position - width);
        if (y < height - 1) addBackground(position + width);
      }
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixelIndex = (y * width + x) * 4;
        const alpha = pixels[pixelIndex + 3];
        const isObject = hasTransparentBackground
          ? alpha >= 20
          : alpha >= 20 && !exteriorBackground[y * width + x];
        if (isObject) {
          objectPixels[y * width + x] = 1;
          mask.data[pixelIndex] = 255;
          mask.data[pixelIndex + 1] = 255;
          mask.data[pixelIndex + 2] = 255;
          mask.data[pixelIndex + 3] = hasTransparentBackground ? alpha : 255;
        }
      }
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!objectPixels[y * width + x]) continue;
        let edge = false;
        for (let offsetY = -radius; offsetY <= radius && !edge; offsetY += 1) {
          for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
            const checkX = x + offsetX;
            const checkY = y + offsetY;
            if (
              checkX < 0 || checkY < 0 || checkX >= width || checkY >= height ||
              !objectPixels[checkY * width + checkX]
            ) {
              edge = true;
              break;
            }
          }
        }
        if (edge) {
          const index = (y * width + x) * 4;
          outline.data[index] = 227;
          outline.data[index + 1] = 24;
          outline.data[index + 2] = 42;
          outline.data[index + 3] = 255;
        }
      }
    }
    maskContext.putImageData(mask, 0, 0);
    outlineContext.putImageData(outline, 0, 0);
    return {
      outline: outlineCanvas.toDataURL("image/png"),
      mask: maskCanvas.toDataURL("image/png"),
    };
  }

  async function togglePatternRole() {
    if (!selectedIds.length) return;
    const allAlreadyPatterns = selectedIds.every((id) => patternIds.includes(id));
    if (allAlreadyPatterns) {
      setPatternIds((current) => current.filter((id) => !selectedIds.includes(id)));
      setPatternOutlines((current) => Object.fromEntries(
        Object.entries(current).filter(([id]) => !selectedIds.includes(id)),
      ));
      setPatternMasks((current) => Object.fromEntries(
        Object.entries(current).filter(([id]) => !selectedIds.includes(id)),
      ));
      return;
    }
    const newlyMarked = items.filter(
      (item) => selectedIds.includes(item.id) && !patternIds.includes(item.id),
    );
    setPatternIds((current) => [...new Set([...current, ...selectedIds])]);
    const generated = await Promise.all(
      newlyMarked?.map(async (item) => ({ id: item.id, ...(await createPatternOutline(item)) })),
    );
    setPatternOutlines((current) => ({
      ...current,
      ...Object.fromEntries(generated?.map((entry) => [entry.id, entry.outline])),
    }));
    setPatternMasks((current) => ({
      ...current,
      ...Object.fromEntries(generated?.map((entry) => [entry.id, entry.mask])),
    }));
  }

  function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawItem(context, image, item) {
    context.save();
    context.translate(item.x + item.w / 2, item.y + item.h / 2);
    context.rotate((item.rotation * Math.PI) / 180);
    context.scale(item.flipX ? -1 : 1, 1);
    context.drawImage(image, -item.w / 2, -item.h / 2, item.w, item.h);
    context.restore();
  }

  async function clipToPatterns() {
    const patterns = items.filter((item) => patternIds.includes(item.id));
    const themes = items.filter((item) => selectedIds.includes(item.id) && !patternIds.includes(item.id));
    if (!patterns.length || !themes.length) return;

    const artworkCanvas = document.createElement("canvas");
    const maskCanvas = document.createElement("canvas");
    artworkCanvas.width = maskCanvas.width = CANVAS_W;
    artworkCanvas.height = maskCanvas.height = CANVAS_H;
    const artwork = artworkCanvas.getContext("2d");
    const mask = maskCanvas.getContext("2d");

    for (const item of themes) drawItem(artwork, await loadCanvasImage(item.src), item);
    for (const item of patterns) {
      drawItem(mask, await loadCanvasImage(patternMasks[item.id] || item.src), item);
    }
    artwork.globalCompositeOperation = "destination-in";
    artwork.drawImage(maskCanvas, 0, 0);
    artwork.globalCompositeOperation = "source-over";

    const pixels = artwork.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
    let minX = CANVAS_W;
    let minY = CANVAS_H;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < CANVAS_H; y += 1) {
      for (let x = 0; x < CANVAS_W; x += 1) {
        if (pixels[(y * CANVAS_W + x) * 4 + 3] > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX < minX || maxY < minY) return;

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cropped = document.createElement("canvas");
    cropped.width = width;
    cropped.height = height;
    cropped.getContext("2d").drawImage(artworkCanvas, minX, minY, width, height, 0, 0, width, height);
    const id = `${Date.now()}-clipped-${Math.random()}`;
    const result = {
      id,
      src: cropped.toDataURL("image/png"),
      name: "Clipped artwork",
      x: minX,
      y: minY,
      w: width,
      h: height,
      rotation: 0,
      flipX: false,
    };
    setItems((current) => [...current.filter((item) => !themes.some((theme) => theme.id === item.id)), result]);
    setSelectedIds([id]);
    setSelectedId(id);
  }

  async function exportImage() {
    const canvas = document.createElement("canvas");
    const outputWidth = Math.round(artboardWidth * printDpi);
    const outputHeight = Math.round(artboardHeight * printDpi);
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    context.scale(outputWidth / CANVAS_W, outputHeight / CANVAS_H);
    context.fillStyle = background;
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (const item of items) {
      const image = new Image();
      image.src = item.src;
      await image.decode();
      context.save();
      context.translate(item.x + item.w / 2, item.y + item.h / 2);
      context.rotate((item.rotation * Math.PI) / 180);
      context.scale(item.flipX ? -1 : 1, 1);
      context.drawImage(image, -item.w / 2, -item.h / 2, item.w, item.h);
      context.restore();
    }
    context.save();
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.font = "700 14px Arial, sans-serif";
    context.fillStyle = "rgba(17, 20, 18, 0.72)";
    context.fillText("Powered by Hussnain Bilal", CANVAS_W - 18, CANVAS_H - 16);
    context.restore();

    if (exportFormat === "pdf") {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: artboardWidth >= artboardHeight ? "landscape" : "portrait",
        unit: "in",
        format: [artboardWidth, artboardHeight],
      });
      const pdfImage = canvas.toDataURL("image/jpeg", 0.96);
      pdf.addImage(pdfImage, "JPEG", 0, 0, artboardWidth, artboardHeight, undefined, "FAST");
      pdf.save("madx-collage.pdf");
    } else {
      const mimeType = exportFormat === "jpeg" ? "image/jpeg" : "image/png";
      const link = document.createElement("a");
      link.download = `madx-collage.${exportFormat}`;
      link.href = canvas.toDataURL(mimeType, 0.94);
      link.click();
    }
    setExportDialogOpen(false);
  }

  return (
    <main className="photoEditorPage">
      <section className="editorIntro">
        <span>CREATIVE STUDIO</span>
        <h1>Arrange your ideas.</h1>
        <p>Drop in multiple images, then drag, resize, rotate and layer them on a single canvas.</p>
      </section>

      <section className="editorApp" aria-label="Photo collage editor">
        <div className="editorToolbar">
          <div className="editorToolbarGroup">
            <button className="editorPrimaryButton" onClick={() => inputRef.current?.click()}>
              <ImagePlus size={18} /> Add images
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => addFiles(event.target.files)}
            />
            <span className="editorCount"><Layers size={16} /> {items.length} {items.length === 1 ? "image" : "images"}</span>
          </div>
          <div className="editorToolbarGroup">
            <label className="colorControl">Canvas <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label>
            <label className="colorControl">Outline <input type="color" value={patternBorderColor} onChange={(event) => setPatternBorderColor(event.target.value)} /></label>
            <div className="zoomControl" aria-label="Canvas zoom controls">
              <button type="button" onClick={() => setZoom((value) => Math.max(.25, value - .25))} aria-label="Zoom out"><Minus size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(2, value + .25))} aria-label="Zoom in"><Plus size={16} /></button>
            </div>
            <button className="hasTooltip" disabled={!selectedIds.length} onClick={() => moveLayer("back")} aria-label="Send selected image to back" data-tooltip="Send to back"><SendToBack size={18} /></button>
            <button className="hasTooltip" disabled={!selectedId} onClick={() => moveLayer("front")} aria-label="Bring selected image to front" data-tooltip="Bring to front"><BringToFront size={18} /></button>
            <button className="hasTooltip" disabled={!selectedId} onClick={createMirrorCopy} aria-label="Create mirrored copy" data-tooltip="Duplicate and mirror the selected image"><FlipHorizontal2 size={18} /> Mirror copy</button>
            <button className="hasTooltip" disabled={!selectedIds.length} onClick={togglePatternRole} aria-label="Mark selected images as patterns" data-tooltip="Mark or unmark selected images as pattern shapes"><Layers size={18} /> Pattern</button>
            <button className="hasTooltip" disabled={!patternIds.length || !selectedIds.some((id) => !patternIds.includes(id))} onClick={clipToPatterns} aria-label="Clip selected artwork to marked patterns" data-tooltip="Keep selected artwork only inside all marked patterns"><Scissors size={18} /> Clip</button>
            <button className="hasTooltip" disabled={!selectedIds.length} onClick={resetSelected} aria-label="Reset rotation" data-tooltip="Reset rotation"><RotateCcw size={18} /></button>
            <button className="dangerTool hasTooltip" disabled={!selectedIds.length} onClick={removeSelected} aria-label="Delete selected images" data-tooltip="Delete selected"><Trash2 size={18} /></button>
            <button className="editorExport" disabled={!items.length} onClick={() => setExportDialogOpen(true)}><Download size={18} /> Download</button>
          </div>
        </div>

        <div className="editorBody">
          <aside className="editorSizePanel">
            <div className="sizePanelHeading">
              <span>OUTPUT</span>
              <strong>Print resolution</strong>
            </div>
            <div className="sizePanelControls">
              <label>
                <span>Canvas width</span>
                <div><input type="number" min="1" max="100" step="0.25" value={artboardWidth} onChange={(event) => setArtboardWidth(Math.max(1, Number(event.target.value) || 1))} /><b>in</b></div>
              </label>
              <label>
                <span>Canvas height</span>
                <div><input type="number" min="1" max="100" step="0.25" value={artboardHeight} onChange={(event) => setArtboardHeight(Math.max(1, Number(event.target.value) || 1))} /><b>in</b></div>
              </label>
              <label>
                <span>Resolution</span>
                <div><input type="number" min="72" max="1200" step="1" value={printDpi} onChange={(event) => setPrintDpi(Math.max(72, Number(event.target.value) || 72))} /><b>DPI</b></div>
              </label>
              <small>Export: {Math.round(artboardWidth * printDpi)} × {Math.round(artboardHeight * printDpi)} pixels</small>
              {selectedId && (() => {
                const activeItem = items.find((item) => item.id === selectedId);
                if (!activeItem) return null;
                return (
                  <div className="selectedMeasurements">
                    <strong>SELECTED IMAGE</strong>
                    <dl>
                      <div><dt>Width</dt><dd>{((activeItem.w / CANVAS_W) * artboardWidth).toFixed(2)} in</dd></div>
                      <div><dt>Height</dt><dd>{((activeItem.h / CANVAS_H) * artboardHeight).toFixed(2)} in</dd></div>
                      <div><dt>X position</dt><dd>{((activeItem.x / CANVAS_W) * artboardWidth).toFixed(2)} in</dd></div>
                      <div><dt>Y position</dt><dd>{((activeItem.y / CANVAS_H) * artboardHeight).toFixed(2)} in</dd></div>
                    </dl>
                  </div>
                );
              })()}
            </div>
          </aside>
          <div className="editorWorkspace">
          <div className="canvasFrame" style={{ width: `${zoom * 100}%`, maxWidth: `${zoom * 1000}px` }}>
            <div className="canvasRuler canvasRulerTop" aria-hidden="true">
              {Array.from({ length: Math.floor(artboardWidth * 4) + 1 }, (_, index) => (
                <i key={index} className={index % 4 === 0 ? "major" : "minor"} style={{ left: `${(index / (artboardWidth * 4)) * 100}%` }}>
                  {index % 4 === 0 && <b>{index / 4}</b>}
                </i>
              ))}
            </div>
            <div className="canvasRuler canvasRulerLeft" aria-hidden="true">
              {Array.from({ length: Math.floor(artboardHeight * 4) + 1 }, (_, index) => (
                <i key={index} className={index % 4 === 0 ? "major" : "minor"} style={{ top: `${(index / (artboardHeight * 4)) * 100}%` }}>
                  {index % 4 === 0 && <b>{index / 4}</b>}
                </i>
              ))}
            </div>
            <div
            ref={stageRef}
            className={`editorCanvas ${draggingOver ? "isDraggingOver" : ""}`}
            style={{
              backgroundColor: background,
              aspectRatio: `${artboardWidth} / ${artboardHeight}`,
              backgroundImage: "linear-gradient(to right, rgba(50,55,51,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(50,55,51,.12) 1px, transparent 1px), linear-gradient(to right, rgba(50,55,51,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(50,55,51,.25) 1px, transparent 1px)",
              backgroundSize: `${100 / (artboardWidth * 4)}% 100%, 100% ${100 / (artboardHeight * 4)}%, ${100 / artboardWidth}% 100%, 100% ${100 / artboardHeight}%`,
            }}
            onPointerDown={() => { setSelectedId(null); setSelectedIds([]); }}
            onDragOver={(event) => { event.preventDefault(); setDraggingOver(true); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDraggingOver(false); }}
            onDrop={(event) => { event.preventDefault(); setDraggingOver(false); addFiles(event.dataTransfer.files); }}
          >
            {(alignmentGuides.x !== null || alignmentGuides.y !== null) && (
              <div className="canvasGuides" aria-hidden="true">
                {alignmentGuides.x !== null && (
                  <span
                    className="canvasGuide canvasGuideVertical"
                    style={{ left: `${(alignmentGuides.x / CANVAS_W) * 100}%` }}
                  >{selectedId && <b>{Math.round(items.find((item) => item.id === selectedId)?.h || 0)} px high</b>}</span>
                )}
                {alignmentGuides.y !== null && (
                  <span
                    className="canvasGuide canvasGuideHorizontal"
                    style={{ top: `${(alignmentGuides.y / CANVAS_H) * 100}%` }}
                  >{selectedId && <b>{Math.round(items.find((item) => item.id === selectedId)?.w || 0)} px wide</b>}</span>
                )}
              </div>
            )}
            {!items.length && (
              <button className="editorEmpty" onClick={() => inputRef.current?.click()}>
                <span><Upload size={28} /></span>
                <strong>Drop your images here</strong>
                <small>or click to choose multiple files</small>
              </button>
            )}
            {items?.map((item) => (
              <div
                key={item.id}
                className={`canvasItem ${selectedIds.includes(item.id) ? "isSelected" : ""}`}
                style={{
                  left: `${(item.x / CANVAS_W) * 100}%`,
                  top: `${(item.y / CANVAS_H) * 100}%`,
                  width: `${(item.w / CANVAS_W) * 100}%`,
                  height: `${(item.h / CANVAS_H) * 100}%`,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                onPointerDown={(event) => beginAction(event, item, "move")}
              >
                <img
                  src={item.src}
                  alt={item.name}
                  draggable="false"
                  style={{ transform: `scaleX(${item.flipX ? -1 : 1})` }}
                />
                {selectedIds.includes(item.id) && (
                  <>
                    <button className="rotateHandle" aria-label="Rotate image" onPointerDown={(event) => beginAction(event, item, "rotate")} />
                    {["nw", "n", "ne", "e", "se", "s", "sw", "w"]?.map((handle) => (
                      <button
                        key={handle}
                        className={`resizeHandle resizeHandle-${handle}`}
                        aria-label={`Resize image from ${handle}`}
                        onPointerDown={(event) => beginAction(event, item, "resize", handle)}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}
            {items.filter((item) => patternIds.includes(item.id))?.map((item) => (
              <div
                key={`outline-${item.id}`}
                className="patternOutlineOverlay"
                style={{
                  left: `${(item.x / CANVAS_W) * 100}%`,
                  top: `${(item.y / CANVAS_H) * 100}%`,
                  width: `${(item.w / CANVAS_W) * 100}%`,
                  height: `${(item.h / CANVAS_H) * 100}%`,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                aria-hidden="true"
              >
                {patternOutlines[item.id] && (
                  <div
                    className="patternOutlineInk"
                    style={{
                      backgroundColor: patternBorderColor,
                      WebkitMaskImage: `url(${patternOutlines[item.id]})`,
                      maskImage: `url(${patternOutlines[item.id]})`,
                      transform: `scaleX(${item.flipX ? -1 : 1})`,
                    }}
                  />
                )}
                <span>PATTERN</span>
              </div>
            ))}
            <div className="canvasCredit" aria-label="Powered by Hussnain Bilal">Powered by Hussnain Bilal</div>
            </div>
          </div>
        </div>
        </div>
        <div className="editorHint"><span>Drag to move</span><span>Corner handle to resize</span><span>Top handle to rotate</span><span>Ctrl/Cmd + A selects all</span></div>
      </section>
      {exportDialogOpen && (
        <div className="exportDialogBackdrop" role="presentation" onPointerDown={() => setExportDialogOpen(false)}>
          <div className="exportDialog" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title" onPointerDown={(event) => event.stopPropagation()}>
            <span>EXPORT DESIGN</span>
            <h2 id="export-dialog-title">Choose a file type</h2>
            <p>{artboardWidth} × {artboardHeight} inches at {printDpi} DPI. The “Powered by Hussnain Bilal” credit will be included.</p>
            <div className="exportFormatOptions">
              {["png", "jpeg", "pdf"]?.map((format) => (
                <label key={format} className={exportFormat === format ? "isActive" : ""}>
                  <input type="radio" name="export-format" value={format} checked={exportFormat === format} onChange={() => setExportFormat(format)} />
                  <strong>{format.toUpperCase()}</strong>
                  <small>{format === "png" ? "Best quality" : format === "jpeg" ? "Smaller image" : "Print document"}</small>
                </label>
              ))}
            </div>
            <div className="exportDialogActions">
              <button type="button" onClick={() => setExportDialogOpen(false)}>Cancel</button>
              <button type="button" className="confirmExport" onClick={exportImage}><Download size={17} /> Download {exportFormat.toUpperCase()}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
