import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimWorld } from '../sim/SimWorld';
import { PlacedTower, TowerType } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { sound } from '../services/soundService';

export interface GameCanvasProps {
  sim: SimWorld;
  selectedTower: PlacedTower | null;
  onSelectTower: (tower: PlacedTower | null) => void;
  buildCandidateType: TowerType | null;
  onSelectSlotToBuild: (slotIndex: number, candidateOverride?: TowerType) => void;
  selectedSlotIndex?: number | null;
  onSelectEmptySlot?: (slotIndex: number | null) => void;
  showGrid?: boolean;
  draggedTowerType?: TowerType | null;
  dragClientPos?: { clientX: number; clientY: number } | null;
  onDropTowerOnSlot?: (slotIndex: number, type: TowerType) => void;
  onCancelDrag?: () => void;
  onSelectEnemyForAnalysis?: (enemy: any) => void;
  analyzedEnemyId?: string | null;
}

const LOGICAL_WIDTH = 920;
const LOGICAL_HEIGHT = 600;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  sim,
  selectedTower,
  onSelectTower,
  buildCandidateType,
  onSelectSlotToBuild,
  selectedSlotIndex = null,
  onSelectEmptySlot,
  showGrid = true,
  draggedTowerType = null,
  dragClientPos = null,
  onDropTowerOnSlot,
  onCancelDrag,
  onSelectEnemyForAnalysis,
  analyzedEnemyId = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoveredSlotRef = useRef<number | null>(null);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // Internal canvas drag state (allows dragging candidate or slot directly on canvas)
  const [internalDrag, setInternalDrag] = useState<{
    active: boolean;
    type: TowerType;
    x: number;
    y: number;
  } | null>(null);

  // Measure and adjust canvas resolution for crisp HiDPI rendering
  const updateCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(LOGICAL_WIDTH * dpr);
    const targetH = Math.round(LOGICAL_HEIGHT * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }, []);

  useEffect(() => {
    updateCanvasResolution();
    window.addEventListener('resize', updateCanvasResolution);
    return () => window.removeEventListener('resize', updateCanvasResolution);
  }, [updateCanvasResolution]);

  /**
   * Precise coordinate calculation that mathematically corrects for CSS letterboxing / aspect-ratio bars.
   * Maps clientX/clientY directly into logical 920x600 coordinates.
   */
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, inside: false };
    const rect = canvas.getBoundingClientRect();

    const canvasAspect = LOGICAL_WIDTH / LOGICAL_HEIGHT;
    const elemAspect = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (elemAspect > canvasAspect) {
      // Letterboxed on left & right
      renderWidth = rect.height * canvasAspect;
      offsetX = (rect.width - renderWidth) / 2;
    } else {
      // Letterboxed on top & bottom
      renderHeight = rect.width / canvasAspect;
      offsetY = (rect.height - renderHeight) / 2;
    }

    const clickX = clientX - rect.left - offsetX;
    const clickY = clientY - rect.top - offsetY;

    const scale = LOGICAL_WIDTH / renderWidth;
    const x = clickX * scale;
    const y = clickY * scale;

    const inside = clickX >= 0 && clickX <= renderWidth && clickY >= 0 && clickY <= renderHeight;
    return { x, y, inside };
  }, []);

  // Compute active drag state (either from external tray or internal on-canvas drag)
  const activeDragType = draggedTowerType || internalDrag?.type || null;

  let activeDragCoords: { x: number; y: number } | null = null;
  if (draggedTowerType && dragClientPos) {
    const c = getCanvasCoords(dragClientPos.clientX, dragClientPos.clientY);
    activeDragCoords = { x: c.x, y: c.y };
  } else if (internalDrag && internalDrag.active) {
    activeDragCoords = { x: internalDrag.x, y: internalDrag.y };
  }

  // Find magnetically snapped slot if dragging near one (32px snap radius centered on grid box)
  let snappedSlotIndex: number | null = null;
  if (activeDragType && activeDragCoords) {
    let bestDistSq = 32 * 32;
    for (let i = 0; i < sim.map.slots.length; i++) {
      const slot = sim.map.slots[i];
      const dSq = (slot.x - activeDragCoords.x) ** 2 + (slot.y - activeDragCoords.y) ** 2;
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        snappedSlotIndex = i;
      }
    }
  }

  // Handle drops when external drag ends over a valid slot
  const prevDragState = useRef<{ active: boolean; slot: number | null; type: TowerType | null }>({
    active: false,
    slot: null,
    type: null
  });

  useEffect(() => {
    const wasActive = prevDragState.current.active;
    const isNowActive = !!draggedTowerType;

    if (wasActive && !isNowActive) {
      // Drag just finished!
      const lastSlot = prevDragState.current.slot;
      const lastType = prevDragState.current.type;

      if (lastSlot !== null && lastType) {
        const isOccupied = sim.towers.some(t => t.slotIndex === lastSlot);
        const def = TOWERS_DATA[lastType];
        const cost = Math.round(def.baseCost * sim.techModifiers.costDiscountMult);
        const canAfford = sim.gold >= cost;

        if (!isOccupied && canAfford) {
          if (onDropTowerOnSlot) {
            onDropTowerOnSlot(lastSlot, lastType);
          } else {
            onSelectSlotToBuild(lastSlot, lastType);
          }
          sound.playPlaceTower();
        }
      }
    }

    prevDragState.current = {
      active: isNowActive,
      slot: snappedSlotIndex,
      type: draggedTowerType
    };
  }, [draggedTowerType, snappedSlotIndex, sim, onDropTowerOnSlot, onSelectSlotToBuild]);

  // Main Canvas Render Loop (60FPS high-fidelity rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // 1. Draw Map Background & Tactical Grid Hashes
      drawBackground(ctx, sim, showGrid);

      // 2. Draw Enemy Road / Path with Demonic Rift Energy and Portals
      drawPath(ctx, sim);

      // 3. Draw Placement Slots (3-Block Perimeter Defensive Grid)
      drawPlacementSlots(
        ctx,
        sim,
        hoveredSlotRef.current,
        buildCandidateType,
        selectedTower,
        selectedSlotIndex,
        showGrid,
        snappedSlotIndex,
        activeDragType
      );

      // 4. Draw Tactical Range Preview for Dragged Tower or Selected Candidate / Placed Tower
      drawTacticalRangeView(
        ctx,
        sim,
        selectedTower,
        buildCandidateType,
        selectedSlotIndex,
        hoveredSlotRef.current,
        activeDragType,
        activeDragCoords,
        snappedSlotIndex
      );

      // 5. Draw Placed Towers
      drawTowers(ctx, sim, selectedTower);

      // 6. Draw Continuous Laser Beams (Obelisk / Beam weapons)
      drawBeams(ctx, sim);

      // 7. Draw Enemies (Ground first, then Flyers with shadows)
      drawEnemies(ctx, sim, analyzedEnemyId);

      // 8. Draw Flying Projectiles
      drawProjectiles(ctx, sim);

      // 9. Draw Particles & Explosions
      drawParticles(ctx, sim);

      // 10. Draw Floating Combat Text
      drawFloatingTexts(ctx, sim);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    sim,
    selectedTower,
    buildCandidateType,
    selectedSlotIndex,
    showGrid,
    activeDragType,
    activeDragCoords,
    snappedSlotIndex,
    analyzedEnemyId
  ]);

  /**
   * Generous hit-testing for both mouse clicks and mobile finger touches.
   */
  const handleSelectAtCoords = (x: number, y: number) => {
    // 0. If a tower is selected, allow tapping an enemy for "Why didn't my tower kill that?" Target Analysis!
    if (selectedTower) {
      let bestEnemy: any = null;
      let bestEnemyDistSq = 32 * 32;
      for (const enemy of sim.enemies) {
        if (!enemy.alive || enemy.leaked) continue;
        const distSq = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
        if (distSq < bestEnemyDistSq) {
          bestEnemyDistSq = distSq;
          bestEnemy = enemy;
        }
      }
      if (bestEnemy) {
        sound.playClick();
        onSelectEnemyForAnalysis?.(bestEnemy);
        return;
      }
    }

    // 1. Check if clicked/tapped an existing tower (radius 32px)
    let bestTower: PlacedTower | null = null;
    let bestTowerDistSq = 32 * 32;
    for (const tower of sim.towers) {
      const distSq = (tower.x - x) ** 2 + (tower.y - y) ** 2;
      if (distSq < bestTowerDistSq) {
        bestTowerDistSq = distSq;
        bestTower = tower;
      }
    }

    if (bestTower) {
      sound.playClick();
      onSelectTower(bestTower);
      onSelectEmptySlot?.(null);
      onSelectEnemyForAnalysis?.(null);
      return;
    }

    // 2. Check if clicked/tapped a slot (26px radius covers the 40x40 box)
    let bestSlotIndex = -1;
    let bestSlotDistSq = 26 * 26;
    for (let i = 0; i < sim.map.slots.length; i++) {
      const slot = sim.map.slots[i];
      const distSq = (slot.x - x) ** 2 + (slot.y - y) ** 2;
      if (distSq < bestSlotDistSq) {
        bestSlotDistSq = distSq;
        bestSlotIndex = i;
      }
    }

    if (bestSlotIndex !== -1) {
      // If an existing tower is on this slot, select the tower
      const existing = sim.towers.find(t => t.slotIndex === bestSlotIndex);
      if (existing) {
        sound.playClick();
        onSelectTower(existing);
        onSelectEmptySlot?.(null);
        onSelectEnemyForAnalysis?.(null);
        return;
      }

      // If building candidate active, build tower
      if (buildCandidateType) {
        onSelectSlotToBuild(bestSlotIndex);
        onSelectEmptySlot?.(null);
      } else {
        // Empty slot selected!
        sound.playClick();
        onSelectTower(null);
        onSelectEmptySlot?.(bestSlotIndex);
      }
      onSelectEnemyForAnalysis?.(null);
      return;
    }

    // Clicked empty ground outside any slot or tower
    onSelectTower(null);
    onSelectEmptySlot?.(null);
    onSelectEnemyForAnalysis?.(null);
  };

  const updateHoveredSlot = (x: number, y: number) => {
    let foundSlot: number | null = null;
    let bestDistSq = 26 * 26;
    for (let i = 0; i < sim.map.slots.length; i++) {
      const slot = sim.map.slots[i];
      const distSq = (slot.x - x) ** 2 + (slot.y - y) ** 2;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        foundSlot = i;
      }
    }
    hoveredSlotRef.current = foundSlot;
  };

  // Mouse / Pointer handlers for click-to-drag on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords.inside) return;

    // If a build candidate is already chosen or slot is selected, initiate on-canvas drag
    if (buildCandidateType) {
      setInternalDrag({
        active: true,
        type: buildCandidateType,
        x: coords.x,
        y: coords.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords.inside) {
      updateHoveredSlot(coords.x, coords.y);
      if (internalDrag?.active) {
        setInternalDrag(prev => (prev ? { ...prev, x: coords.x, y: coords.y } : null));
      }
    } else {
      hoveredSlotRef.current = null;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (internalDrag?.active) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      // Check if dropped onto an unoccupied slot
      if (snappedSlotIndex !== null) {
        const isOccupied = sim.towers.some(t => t.slotIndex === snappedSlotIndex);
        const def = TOWERS_DATA[internalDrag.type];
        const cost = Math.round(def.baseCost * sim.techModifiers.costDiscountMult);
        if (!isOccupied && sim.gold >= cost) {
          onSelectSlotToBuild(snappedSlotIndex, internalDrag.type);
          sound.playPlaceTower();
        }
      }
      setInternalDrag(null);
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords.inside) {
      handleSelectAtCoords(coords.x, coords.y);
    }
  };

  // Touch handlers for mobile click-and-drag
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartPos.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      const coords = getCanvasCoords(t.clientX, t.clientY);
      if (coords.inside) {
        updateHoveredSlot(coords.x, coords.y);
        if (buildCandidateType) {
          setInternalDrag({
            active: true,
            type: buildCandidateType,
            x: coords.x,
            y: coords.y
          });
        }
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const coords = getCanvasCoords(t.clientX, t.clientY);
      if (coords.inside) {
        updateHoveredSlot(coords.x, coords.y);
        if (internalDrag?.active) {
          setInternalDrag(prev => (prev ? { ...prev, x: coords.x, y: coords.y } : null));
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (internalDrag?.active) {
      if (snappedSlotIndex !== null) {
        const isOccupied = sim.towers.some(t => t.slotIndex === snappedSlotIndex);
        const def = TOWERS_DATA[internalDrag.type];
        const cost = Math.round(def.baseCost * sim.techModifiers.costDiscountMult);
        if (!isOccupied && sim.gold >= cost) {
          onSelectSlotToBuild(snappedSlotIndex, internalDrag.type);
          sound.playPlaceTower();
        }
      }
      setInternalDrag(null);
      touchStartPos.current = null;
      return;
    }

    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    if (touch) {
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      const dist = Math.hypot(dx, dy);
      const elapsed = Date.now() - touchStartPos.current.time;

      if (dist < 14 && elapsed < 800) {
        const coords = getCanvasCoords(touch.clientX, touch.clientY);
        if (coords.inside) {
          handleSelectAtCoords(coords.x, coords.y);
        }
      }
    }
    touchStartPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#05070d] p-1 sm:p-2 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        width={LOGICAL_WIDTH}
        height={LOGICAL_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          hoveredSlotRef.current = null;
          if (internalDrag) setInternalDrag(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="cursor-crosshair rounded-xl shadow-2xl border border-slate-800/80 bg-slate-950 block"
        style={{
          aspectRatio: `${LOGICAL_WIDTH} / ${LOGICAL_HEIGHT}`,
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          touchAction: 'none'
        }}
      />
    </div>
  );
};

// --- RENDER HELPERS ---

function drawBackground(ctx: CanvasRenderingContext2D, sim: SimWorld, showGrid: boolean) {
  // Biome gradient
  const grad = ctx.createLinearGradient(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  grad.addColorStop(0, sim.map.bgGradient[0]);
  grad.addColorStop(1, sim.map.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Subtle tactical coordinate grid with crisp 1px lines
  ctx.strokeStyle = showGrid ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 40;

  for (let x = 0; x <= LOGICAL_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, LOGICAL_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= LOGICAL_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(LOGICAL_WIDTH, y + 0.5);
    ctx.stroke();
  }

  // Tactical crosshair intersection dots when grid is enabled
  if (showGrid) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    for (let x = gridSize; x < LOGICAL_WIDTH; x += gridSize * 2) {
      for (let y = gridSize; y < LOGICAL_HEIGHT; y += gridSize * 2) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }
  }

  // Biome-specific ambient features (glowing crags or void runes)
  if (sim.map.theme === 'caldera') {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
    ctx.beginPath();
    ctx.ellipse(300, 320, 180, 100, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (sim.map.theme === 'cold_hell') {
    ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.beginPath();
    ctx.ellipse(500, 280, 220, 120, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPath(ctx: CanvasRenderingContext2D, sim: SimWorld) {
  const pts = sim.map.waypoints;
  if (pts.length < 2) return;

  // 1. Path outer border / fortified trench
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.lineWidth = sim.map.pathWidth + 12;
  ctx.stroke();

  // 2. Path main bed
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = sim.map.pathColor;
  ctx.lineWidth = sim.map.pathWidth;
  ctx.stroke();

  // 3. Demonic pulsating rift centerline with directional arrows
  const time = Date.now() * 0.003;
  const pulseAlpha = 0.3 + Math.sin(time) * 0.15;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = sim.map.theme === 'cold_hell'
    ? `rgba(56, 189, 248, ${pulseAlpha})`
    : `rgba(239, 68, 68, ${pulseAlpha})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.lineDashOffset = -time * 28;
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Directional marching chevrons along path
  ctx.strokeStyle = sim.map.theme === 'cold_hell' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);

    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(2, 0);
    ctx.lineTo(-6, 4);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Spawn Breach Portal (Start) with swirling vortex
  const start = pts[0];
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.rotate(time);
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 9px Rajdhani';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BREACH', start.x, start.y);

  // 6. Reality Sanctuary Nexus (End) with protective energy field
  const end = pts[pts.length - 1];
  ctx.save();
  ctx.translate(end.x, end.y);
  ctx.rotate(-time * 0.8);
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px Rajdhani';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SANCTUARY', end.x, end.y);
}

function drawPlacementSlots(
  ctx: CanvasRenderingContext2D,
  sim: SimWorld,
  hoveredSlot: number | null,
  buildCandidateType: TowerType | null,
  selectedTower: PlacedTower | null,
  selectedSlotIndex: number | null = null,
  showGrid: boolean = true,
  snappedSlotIndex: number | null = null,
  activeDragType: TowerType | null = null
) {
  const isBuildMode = buildCandidateType !== null || activeDragType !== null;
  const time = Date.now() * 0.004;
  const pulse = 0.5 + 0.5 * Math.sin(time);

  for (let i = 0; i < sim.map.slots.length; i++) {
    const slot = sim.map.slots[i];
    const isOccupied = sim.towers.some(t => t.slotIndex === i);
    const isHovered = hoveredSlot === i;
    const isSelected = selectedSlotIndex === i;
    const isSnapped = snappedSlotIndex === i;

    // 1. Occupied slots: foundation rim underneath the tower
    if (isOccupied) {
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = isSnapped ? '#ef4444' : '#1e293b';
      ctx.lineWidth = isSnapped ? 2 : 1;
      ctx.stroke();
      continue;
    }

    // 2. Snapped Slot during Drag-to-Place (Vibrant Emerald Beacon)
    if (isSnapped) {
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 22 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Precision Corner Reticles
      const r = 18;
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(slot.x - r, slot.y - r + 6);
      ctx.lineTo(slot.x - r, slot.y - r);
      ctx.lineTo(slot.x - r + 6, slot.y - r);

      ctx.moveTo(slot.x + r - 6, slot.y - r);
      ctx.lineTo(slot.x + r, slot.y - r);
      ctx.lineTo(slot.x + r, slot.y - r + 6);

      ctx.moveTo(slot.x - r, slot.y + r - 6);
      ctx.lineTo(slot.x - r, slot.y + r);
      ctx.lineTo(slot.x - r + 6, slot.y + r);

      ctx.moveTo(slot.x + r - 6, slot.y + r);
      ctx.lineTo(slot.x + r, slot.y + r);
      ctx.lineTo(slot.x + r, slot.y + r - 6);
      ctx.stroke();
      continue;
    }

    // 3. Actively Selected Slot (Cyan beacon)
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 18 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Targeting reticle brackets
      const r = 16;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(slot.x - r, slot.y - r + 5);
      ctx.lineTo(slot.x - r, slot.y - r);
      ctx.lineTo(slot.x - r + 5, slot.y - r);

      ctx.moveTo(slot.x + r - 5, slot.y - r);
      ctx.lineTo(slot.x + r, slot.y - r);
      ctx.lineTo(slot.x + r, slot.y - r + 5);

      ctx.moveTo(slot.x - r, slot.y + r - 5);
      ctx.lineTo(slot.x - r, slot.y + r);
      ctx.lineTo(slot.x - r + 5, slot.y + r);

      ctx.moveTo(slot.x + r - 5, slot.y + r);
      ctx.lineTo(slot.x + r, slot.y + r);
      ctx.lineTo(slot.x + r, slot.y + r - 5);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(`MOUNT #${i + 1}`, slot.x, slot.y + 26);
      continue;
    }

    // 4. Build Mode Active: highlight all 3-block available defense tiles
    if (isBuildMode) {
      const radius = isHovered ? 18 : 14;
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? 'rgba(34, 197, 94, 0.28)' : 'rgba(34, 197, 94, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = isHovered ? '#4ade80' : 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(slot.x - 4, slot.y);
      ctx.lineTo(slot.x + 4, slot.y);
      ctx.moveTo(slot.x, slot.y - 4);
      ctx.lineTo(slot.x, slot.y + 4);
      ctx.stroke();

      if (isHovered && !activeDragType) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 9px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO PLACE', slot.x, slot.y - 20);
      }
      continue;
    }

    // 5. Passive / Tactical Combat View: clean defense pedestal
    // Highlight the 40x40 grid box on hover to emphasize centered placement
    if (isHovered && !isBuildMode) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(slot.x - 19.5, slot.y - 19.5, 39, 39);
    }

    const radius = isHovered ? 13 : 7;
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.22)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fill();
    ctx.strokeStyle = isHovered
      ? '#38bdf8'
      : (showGrid ? 'rgba(100, 116, 139, 0.4)' : 'rgba(71, 85, 105, 0.25)');
    ctx.lineWidth = isHovered ? 1.5 : 1;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, isHovered ? 2.5 : 1.5, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)';
    ctx.fill();

    // Slot number label when tactical grid is active
    if (showGrid) {
      ctx.fillStyle = isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
      ctx.font = '8px Rajdhani';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, slot.x, slot.y - 10);
    }
  }
}

/**
 * Tactical Range View & Live Ghost Tower:
 * Displays dynamic attack radius, road kill-zone highlighting, line of fire, and floating stats HUD
 */
function drawTacticalRangeView(
  ctx: CanvasRenderingContext2D,
  sim: SimWorld,
  selectedTower: PlacedTower | null,
  buildCandidateType: TowerType | null,
  selectedSlotIndex: number | null,
  hoveredSlot: number | null,
  activeDragType: TowerType | null,
  activeDragCoords: { x: number; y: number } | null,
  snappedSlotIndex: number | null
) {
  const time = Date.now() * 0.003;

  // Case A: Active Dragging (from Tray or Canvas)
  if (activeDragType && activeDragCoords) {
    const def = TOWERS_DATA[activeDragType];
    if (!def) return;

    const cost = Math.round(def.baseCost * sim.techModifiers.costDiscountMult);
    const canAfford = sim.gold >= cost;
    const range = def.baseRange * sim.techModifiers.rangeMult;

    const isSnapped = snappedSlotIndex !== null;
    const snappedSlot = isSnapped ? sim.map.slots[snappedSlotIndex!] : null;
    const isOccupied = isSnapped ? sim.towers.some(t => t.slotIndex === snappedSlotIndex) : false;

    const targetX = snappedSlot ? snappedSlot.x : activeDragCoords.x;
    const targetY = snappedSlot ? snappedSlot.y : activeDragCoords.y;

    // 1. Road Kill-Zone Coverage Highlight: highlight all path segments in range
    if (isSnapped && !isOccupied) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < sim.map.waypoints.length - 1; i++) {
        const p0 = sim.map.waypoints[i];
        const p1 = sim.map.waypoints[i + 1];
        const d0 = Math.hypot(p0.x - targetX, p0.y - targetY);
        const d1 = Math.hypot(p1.x - targetX, p1.y - targetY);

        if (d0 <= range || d1 <= range) {
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
        }
      }
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = sim.map.pathWidth + 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.restore();

      // 2. Dotted Line-of-Fire Laser connecting tower to closest waypoint
      let nearestWp = sim.map.waypoints[0];
      let minWpDistSq = Infinity;
      for (const wp of sim.map.waypoints) {
        const dSq = (wp.x - targetX) ** 2 + (wp.y - targetY) ** 2;
        if (dSq < minWpDistSq) {
          minWpDistSq = dSq;
          nearestWp = wp;
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(nearestWp.x, nearestWp.y);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Range Radius Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetX, targetY, range, 0, Math.PI * 2);

    if (isSnapped && isOccupied) {
      // Occupied error: red
      ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
      ctx.strokeStyle = '#ef4444';
    } else if (!canAfford) {
      // Insufficient gold: yellow/amber
      ctx.fillStyle = 'rgba(234, 179, 8, 0.14)';
      ctx.strokeStyle = '#eab308';
    } else if (isSnapped) {
      // Valid snap: emerald
      ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
      ctx.strokeStyle = '#22c55e';
    } else {
      // Free floating drag: sky blue
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = '#38bdf8';
    }

    ctx.fill();
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -time * 20;
    ctx.stroke();
    ctx.setLineDash([]);

    // Concentric inner reference ring at 50% range
    ctx.beginPath();
    ctx.arc(targetX, targetY, range * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Ghost Tower Rendering
    ctx.translate(targetX, targetY);
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = def.accentColor;
    ctx.fillRect(-3, -14, 6, 14);

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.restore();

    // 5. Floating Tactical HUD Badge
    const badgeY = targetY > 90 ? targetY - range - 18 : targetY + range + 18;
    ctx.save();
    ctx.translate(targetX, badgeY);

    const badgeWidth = 240;
    const badgeHeight = 36;
    ctx.beginPath();
    ctx.roundRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 8);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fill();
    ctx.strokeStyle = isSnapped && !isOccupied && canAfford
      ? '#22c55e'
      : (isSnapped && isOccupied ? '#ef4444' : '#38bdf8');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Rajdhani';
    ctx.textAlign = 'center';
    const titleText = isSnapped
      ? (isOccupied ? `MOUNT #${snappedSlotIndex! + 1} OCCUPIED` : `SNAPPED: MOUNT #${snappedSlotIndex! + 1}`)
      : `DRAG TO ANY DEFENSIVE MOUNT`;
    ctx.fillText(titleText, 0, -4);

    // Subtext Stats
    ctx.font = '10px Rajdhani';
    if (isSnapped && !isOccupied) {
      ctx.fillStyle = canAfford ? '#4ade80' : '#f87171';
      ctx.fillText(
        canAfford ? `RELEASE TO DEPLOY (${cost}g) • RNG: ${Math.round(range)}px` : `INSUFFICIENT GOLD (NEED ${cost}g)`,
        0,
        10
      );
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${def.name.toUpperCase()} • RNG: ${Math.round(range)}px • COST: ${cost}g`, 0, 10);
    }
    ctx.restore();
    return;
  }

  // Case B: Placed Tower Selected -> Draw its range circle and targeting laser
  if (selectedTower) {
    const stats = sim.getEffectiveTowerStats(selectedTower);
    ctx.save();
    ctx.beginPath();
    ctx.arc(selectedTower.x, selectedTower.y, stats.range, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -time * 12;
    ctx.stroke();
    ctx.setLineDash([]);

    // Line of fire to current target if targeting
    const targetId = selectedTower.lockedTargetId;
    const target = targetId ? sim.enemies.find(e => e.id === targetId && e.alive) : null;
    if (target) {
      ctx.beginPath();
      ctx.moveTo(selectedTower.x, selectedTower.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Case C: Candidate Selected (Ready to click on slot)
  if (buildCandidateType !== null) {
    const activeSlotIndex = hoveredSlot ?? selectedSlotIndex ?? null;
    if (activeSlotIndex !== null) {
      const def = TOWERS_DATA[buildCandidateType];
      const slot = sim.map.slots[activeSlotIndex];
      if (def && slot) {
        const range = def.baseRange * sim.techModifiers.rangeMult;
        ctx.save();
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, range, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -time * 15;
        ctx.stroke();
        ctx.restore();
      }
    }
  } else if (selectedSlotIndex !== null) {
    // Empty slot selected
    const slot = sim.map.slots[selectedSlotIndex];
    if (slot) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 140, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawTowers(ctx: CanvasRenderingContext2D, sim: SimWorld, selectedTower: PlacedTower | null) {
  for (const tower of sim.towers) {
    const def = TOWERS_DATA[tower.type];
    const isSelected = selectedTower?.id === tower.id;

    ctx.save();
    ctx.translate(tower.x, tower.y);

    // Selected tower animated outer aura
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Tower base octagon
    ctx.beginPath();
    const sides = 8;
    const r = 16;
    for (let s = 0; s < sides; s++) {
      const a = (Math.PI * 2 * s) / sides;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Turret rotating head towards target
    ctx.rotate(tower.aimAngle);

    // Turret barrel
    ctx.fillStyle = def.accentColor;
    if (tower.type === 'cannon' || tower.type === 'mortar') {
      ctx.fillRect(0, -5, 16, 10);
    } else if (tower.type === 'gatling') {
      ctx.fillRect(0, -3, 18, 6);
    } else if (tower.type === 'ballista') {
      ctx.fillRect(0, -2, 20, 4);
      // Bow cross arms
      ctx.fillRect(6, -10, 3, 20);
    } else {
      ctx.fillRect(0, -3, 15, 6);
    }

    // Turret central core
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Tower Tier Insignia Badge (e.g. T1, T2...)
    const maxRank = Math.max(...tower.pathRanks);
    if (maxRank > 0) {
      ctx.fillStyle = maxRank >= 4 ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 9px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(`T${maxRank}`, tower.x, tower.y - 18);
    }

    // Visible Targeting Mode on the Tower UI
    if (isSelected) {
      const priorityLabel = tower.targetPriority === 'nearest' ? 'CLOSEST' : tower.targetPriority.toUpperCase();
      ctx.save();
      ctx.font = 'bold 8px Rajdhani, monospace';
      const textWidth = ctx.measureText(priorityLabel).width;
      const boxW = textWidth + 8;
      const boxH = 12;
      const boxX = tower.x - boxW / 2;
      const boxY = tower.y + 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(priorityLabel, tower.x, boxY + boxH / 2);
      ctx.restore();
    }
  }
}

function drawBeams(ctx: CanvasRenderingContext2D, sim: SimWorld) {
  for (const beam of sim.laserBeams) {
    // Outer bloom
    ctx.beginPath();
    ctx.moveTo(beam.startX, beam.startY);
    ctx.lineTo(beam.endX, beam.endY);
    ctx.strokeStyle = beam.color;
    ctx.lineWidth = beam.width * 2;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.4;
    ctx.stroke();

    // Inner hot white core
    ctx.beginPath();
    ctx.moveTo(beam.startX, beam.startY);
    ctx.lineTo(beam.endX, beam.endY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = beam.width * 0.6;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, sim: SimWorld, analyzedEnemyId: string | null = null) {
  // Sort ground first, then flying so flying enemies render visibly overhead
  const sorted = [...sim.enemies].sort((a, b) => (a.isFlying ? 1 : 0) - (b.isFlying ? 1 : 0));

  for (const enemy of sorted) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Flyer shadow on ground
    if (enemy.isFlying) {
      ctx.beginPath();
      ctx.ellipse(0, 16, enemy.size, enemy.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();
    }

    // Freeze ice block overlay if frozen
    if (enemy.status.freezeTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Enemy body
    ctx.beginPath();
    if (enemy.isBoss) {
      // Boss: Spiked octagon with burning molten core
      const sides = 8;
      for (let s = 0; s < sides; s++) {
        const a = (Math.PI * 2 * s) / sides;
        const r = enemy.size + (s % 2 === 0 ? 4 : 0);
        const bx = Math.cos(a) * r;
        const by = Math.sin(a) * r;
        if (s === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.closePath();
      ctx.fillStyle = enemy.color;
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Burning core
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else if (enemy.isFlying) {
      // Winged Demon
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Animated wings
      const wingFlap = Math.sin(Date.now() * 0.02) * 6;
      ctx.beginPath();
      ctx.moveTo(-enemy.size * 1.5, wingFlap);
      ctx.lineTo(0, -enemy.size * 0.4);
      ctx.lineTo(enemy.size * 1.5, wingFlap);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (enemy.type === 'armored') {
      // Heavy Slag Plate
      ctx.rect(-enemy.size, -enemy.size, enemy.size * 2, enemy.size * 2);
      ctx.fillStyle = enemy.color;
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Standard demonic mite
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Marked reticle
    if (enemy.status.markedTimer > 0) {
      const reticleAngle = (Date.now() * 0.003) % (Math.PI * 2);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size + 5, reticleAngle, reticleAngle + Math.PI * 1.5);
      ctx.stroke();
    }

    // Target Analyzed Brackets
    if (analyzedEnemyId === enemy.id) {
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      const bracketSize = (enemy.size + 8) * pulse;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-bracketSize, -bracketSize + 6);
      ctx.lineTo(-bracketSize, -bracketSize);
      ctx.lineTo(-bracketSize + 6, -bracketSize);

      ctx.moveTo(bracketSize - 6, -bracketSize);
      ctx.lineTo(bracketSize, -bracketSize);
      ctx.lineTo(bracketSize, -bracketSize + 6);

      ctx.moveTo(bracketSize, bracketSize - 6);
      ctx.lineTo(bracketSize, bracketSize);
      ctx.lineTo(bracketSize - 6, bracketSize);

      ctx.moveTo(-bracketSize + 6, bracketSize);
      ctx.lineTo(-bracketSize, bracketSize);
      ctx.lineTo(-bracketSize, bracketSize - 6);
      ctx.stroke();

      ctx.font = 'bold 8px Rajdhani, monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('ANALYZING', 0, -bracketSize - 4);
    }

    ctx.restore();

    // Overhead Health bar
    const barWidth = enemy.isBoss ? 48 : 28;
    const barHeight = enemy.isBoss ? 5 : 3.5;
    const barY = enemy.y - enemy.size - (enemy.isBoss ? 16 : 12);
    const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * hpRatio, barHeight);

    // Tactical Armor Bar underneath HP
    if (enemy.armor > 0) {
      const armorBarY = barY + barHeight + 1.5;
      const armorRatio = Math.min(1, enemy.armor / 45);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(enemy.x - barWidth / 2, armorBarY, barWidth, 2);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(enemy.x - barWidth / 2, armorBarY, barWidth * armorRatio, 2);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 8px Rajdhani, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`🛡${enemy.armor}`, enemy.x + barWidth / 2 + 3, barY + 4);
    }

    // Status effect badges overhead
    let badgeX = enemy.x - 14;
    if (enemy.status.slowTimer > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px sans-serif';
      ctx.fillText('❄', badgeX, barY - 4);
      badgeX += 10;
    }
    if (enemy.status.burnTimer > 0) {
      ctx.fillStyle = '#f97316';
      ctx.font = '9px sans-serif';
      ctx.fillText('🔥', badgeX, barY - 4);
      badgeX += 10;
    }
    if (enemy.status.poisonTimer > 0 || (enemy.status.poisonStacks && enemy.status.poisonStacks > 0)) {
      ctx.fillStyle = '#a855f7';
      ctx.font = '9px sans-serif';
      ctx.fillText('🧪', badgeX, barY - 4);
      badgeX += 10;
    }
    if (enemy.status.markedTimer > 0) {
      ctx.fillStyle = '#facc15';
      ctx.font = '9px sans-serif';
      ctx.fillText('🎯', badgeX, barY - 4);
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, sim: SimWorld) {
  for (const p of sim.projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Glowing rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, sim: SimWorld) {
  for (const pt of sim.particles) {
    const alpha = pt.life / pt.maxLife;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.radius * alpha, 0, Math.PI * 2);
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, sim: SimWorld) {
  for (const ft of sim.floatingTexts) {
    const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
    ctx.save();
    ctx.globalAlpha = alpha;

    // Render Tactical Synergy or Resistance Tag
    if (ft.tag) {
      ctx.font = 'bold 8px Rajdhani, monospace';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.tag, ft.x, ft.y - 11);
    }

    ctx.fillStyle = ft.color;
    ctx.font = ft.isCrit || ft.tag === 'EXECUTE' || ft.tag === 'SHATTER' ? 'bold 13px Rajdhani, monospace' : 'bold 11px Rajdhani, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
