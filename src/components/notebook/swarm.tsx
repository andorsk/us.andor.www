"use client";

import { useEffect, useRef } from "react";

// Background swarm: agents flock, then coordinate into an & mark and stay there.
// Hovering or scrolling ripples the formed mark a little; it springs back.

type Phase = "explore" | "converge" | "hold";

const MARK = "&";
// A heavy sans & (like the favicon) reads far better as dots than the handwriting face.
const MARK_FONT = '900 SIZEpx "Helvetica Neue", Helvetica, Arial, sans-serif';
const AMBER = "251,176,64";
const CHALK = "236,235,230";
const NEIGHBOR_R = 28;
const POINTER_R = 70;
// How much scroll velocity jostles the mark.
const SCROLL_KICK = 0.6;
const DURATION: Record<Phase, number> = { explore: 6, converge: 3, hold: Infinity };
const FIRST_EXPLORE = 3.5;
const NEXT: Record<Phase, Phase> = { explore: "converge", converge: "hold", hold: "hold" };

type Agent = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  tx: number;
  ty: number;
  hasTarget: boolean;
};

export default function Swarm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let agents: Agent[] = [];
    let phase: Phase = "explore";
    let phaseLeft = FIRST_EXPLORE;
    let markX = 0;
    let markY = 0;
    const pointer = { x: -1e4, y: -1e4 };
    let scrollDelta = 0;
    let lastScroll = window.scrollY;
    let raf = 0;
    let last = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const sampleMark = (count: number) => {
      const mobile = W < 640;
      const size = mobile ? Math.min(W * 0.95, H * 0.42) : Math.min(W * 0.5, H * 0.8);
      markX = mobile ? W * 0.5 : W * 0.68;
      markY = mobile ? H * 0.26 : H * 0.48;

      const off = document.createElement("canvas");
      off.width = Math.ceil(W);
      off.height = Math.ceil(H);
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return [];
      o.font = MARK_FONT.replace("SIZE", String(Math.round(size)));
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(MARK, markX, markY);

      const data = o.getImageData(0, 0, off.width, off.height).data;
      const filled = (x: number, y: number) => data[(Math.round(y) * off.width + Math.round(x)) * 4 + 3] > 128;

      // Measure the glyph's area, then sample it on an even grid sized so ~90% of agents
      // get a spot. Even spacing is what makes the shape read clearly.
      let area = 0;
      for (let y = 0; y < off.height; y += 2) for (let x = 0; x < off.width; x += 2) if (filled(x, y)) area += 4;
      const want = Math.floor(count * 0.9);
      let gap = Math.max(3, Math.sqrt(area / want));
      let pts: Array<[number, number]> = [];
      for (let tries = 0; tries < 6; tries++) {
        pts = [];
        for (let y = gap / 2; y < off.height; y += gap) {
          for (let x = gap / 2; x < off.width; x += gap) if (filled(x, y)) pts.push([x, y]);
        }
        if (pts.length <= want) break;
        gap *= 1.08;
      }
      return pts;
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(650, Math.max(280, (W * H) / 2200)));
      while (agents.length < count) {
        const a = Math.random() * Math.PI * 2;
        agents.push({ x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, heading: a, tx: 0, ty: 0, hasTarget: false });
      }
      agents.length = count;

      const targets = sampleMark(count);
      agents.forEach((a, i) => {
        a.hasTarget = i < targets.length;
        if (a.hasTarget) [a.tx, a.ty] = targets[i];
        a.x = ((a.x % W) + W) % W;
        a.y = ((a.y % H) + H) % H;
      });
    };

    const draw = (alphaScale = 1) => {
      ctx.clearRect(0, 0, W, H);
      const settled = phase === "converge" || phase === "hold";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (const pass of [0, 1]) {
        ctx.beginPath();
        for (const a of agents) {
          const inPlace = settled && a.hasTarget && Math.abs(a.x - a.tx) + Math.abs(a.y - a.ty) < 8;
          if ((pass === 1) !== inPlace) continue;
          ctx.moveTo(a.x - a.vx * 0.06, a.y - a.vy * 0.06);
          ctx.lineTo(a.x + 0.01, a.y);
        }
        ctx.strokeStyle = pass === 1 ? `rgba(${AMBER},${alphaScale})` : `rgba(${CHALK},${0.4 * alphaScale})`;
        ctx.stroke();
      }
    };

    const step = (dt: number) => {
      phaseLeft -= dt;
      if (phaseLeft <= 0) {
        phase = NEXT[phase];
        phaseLeft = DURATION[phase];
      }

      // Scroll ripple: a vertical shove (with a little sideways noise) that the
      // seek force pulls back into shape.
      if (scrollDelta) {
        for (const a of agents) {
          a.vy -= scrollDelta * SCROLL_KICK * (0.6 + Math.random() * 0.8);
          a.vx += (Math.random() - 0.5) * Math.abs(scrollDelta) * SCROLL_KICK;
        }
        scrollDelta = 0;
      }

      // Spatial hash for neighbor lookups.
      const cols = Math.ceil(W / NEIGHBOR_R);
      const grid = new Map<number, Agent[]>();
      for (const a of agents) {
        const k = Math.floor(a.y / NEIGHBOR_R) * cols + Math.floor(a.x / NEIGHBOR_R);
        const cell = grid.get(k);
        if (cell) cell.push(a);
        else grid.set(k, [a]);
      }

      for (const a of agents) {
        let ax = 0;
        let ay = 0;
        const seeking = a.hasTarget && (phase === "converge" || phase === "hold");

        if (seeking) {
          const dx = a.tx - a.x;
          const dy = a.ty - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const speed = 280 * Math.min(1, d / 90);
          ax += ((dx / d) * speed - a.vx) * 4;
          ay += ((dy / d) * speed - a.vy) * 4;
          if (phase === "hold") {
            ax += (Math.random() - 0.5) * 25;
            ay += (Math.random() - 0.5) * 25;
          }
        } else {
          // Flocking: separation, alignment, cohesion, plus a wander heading.
          let n = 0, sx = 0, sy = 0, avx = 0, avy = 0, cx = 0, cy = 0;
          const gx = Math.floor(a.x / NEIGHBOR_R);
          const gy = Math.floor(a.y / NEIGHBOR_R);
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const cell = grid.get((gy + oy) * cols + gx + ox);
              if (!cell) continue;
              for (const b of cell) {
                if (b === a) continue;
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > NEIGHBOR_R * NEIGHBOR_R || d2 === 0) continue;
                n++;
                sx += dx / d2;
                sy += dy / d2;
                avx += b.vx;
                avy += b.vy;
                cx += b.x;
                cy += b.y;
              }
            }
          }
          if (n) {
            ax += sx * 900 + (avx / n - a.vx) * 0.9 + (cx / n - a.x) * 0.6;
            ay += sy * 900 + (avy / n - a.vy) * 0.9 + (cy / n - a.y) * 0.6;
          }
          a.heading += (Math.random() - 0.5) * 3 * dt;
          ax += Math.cos(a.heading) * 30;
          ay += Math.sin(a.heading) * 30;
        }

        const pdx = a.x - pointer.x;
        const pdy = a.y - pointer.y;
        const pd = Math.hypot(pdx, pdy);
        if (pd < POINTER_R && pd > 0) {
          const push = (1 - pd / POINTER_R) * 1400;
          ax += (pdx / pd) * push;
          ay += (pdy / pd) * push;
        }

        a.vx += ax * dt;
        a.vy += ay * dt;
        const maxV = seeking ? 320 : 75;
        const v = Math.hypot(a.vx, a.vy);
        if (v > maxV) {
          a.vx = (a.vx / v) * maxV;
          a.vy = (a.vy / v) * maxV;
        }
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        if (!seeking) {
          a.x = ((a.x % W) + W) % W;
          a.y = ((a.y % H) + H) % H;
        }
      }
    };

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000 || 0, 0.05);
      last = t;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const drawStatic = () => {
      phase = "hold";
      for (const a of agents) {
        if (a.hasTarget) {
          a.x = a.tx;
          a.y = a.ty;
        }
        a.vx = a.vy = 0;
      }
      draw(0.6);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };
    const onScroll = () => {
      const y = window.scrollY;
      scrollDelta += Math.max(-60, Math.min(60, y - lastScroll));
      lastScroll = y;
    };
    // Touch has no hover: release the repeller when the finger lifts.
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setup();
        if (reduced) drawStatic();
      }, 200);
    };

    {
      setup();
      if (reduced) {
        drawStatic();
        return;
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onMove);
      window.addEventListener("pointerup", onUp);
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame((t) => {
        last = t;
        frame(t);
      });
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}
