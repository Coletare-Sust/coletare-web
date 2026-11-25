"use client";

import { useEffect, useRef, useState } from "react";

const ROUTE_PATH =
  "M40 130 L200 130 Q240 130 240 170 L240 260 Q240 300 280 300 L480 300 Q520 300 520 260 L520 170 Q520 130 560 130 L640 130 Q680 130 680 170 L680 340 Q680 380 720 380 L960 380";

const STOP_POSITIONS = [0.1, 0.27, 0.43, 0.6, 0.77, 0.94];
const LOOP_MS = 16000;
const HOLD = 0.08;

const STREETS_H = [50, 130, 210, 300, 380, 460];
const STREETS_V = [-80, 40, 240, 360, 520, 600, 680, 800, 960, 1080];

type Stop = { x: number; y: number };

export default function LoginRouteMap() {
  const progressRef = useRef<SVGPathElement>(null);
  const truckRef = useRef<SVGGElement>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [collected, setCollected] = useState(0);

  useEffect(() => {
    const progress = progressRef.current;
    const truck = truckRef.current;
    if (!progress || !truck) return undefined;

    // Mede a rota num <path> fora da tela: o mapa fica com display:none em
    // telas pequenas e, nesse caso, medir o elemento visível devolve zeros.
    const route = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    route.setAttribute("d", ROUTE_PATH);

    const total = route.getTotalLength();
    setStops(
      STOP_POSITIONS.map((p) => {
        const point = route.getPointAtLength(total * p);
        return { x: point.x, y: point.y };
      })
    );
    progress.style.strokeDasharray = `${total}`;

    const paint = (t: number) => {
      const point = route.getPointAtLength(total * t);
      const ahead = route.getPointAtLength(Math.min(total, total * t + 2));
      const angle =
        (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      truck.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${angle})`
      );
      progress.style.strokeDashoffset = `${total * (1 - t)}`;
      const done = STOP_POSITIONS.filter((p) => p <= t).length;
      setCollected((prev) => (prev === done ? prev : done));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      paint(0.62);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const cycle = ((now - start) % LOOP_MS) / LOOP_MS;
      // percorre a rota e segura um instante no final antes de recomeçar
      const t = Math.min(1, cycle / (1 - HOLD));
      paint(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <g stroke="#00ADB4" strokeOpacity="0.14" strokeWidth="1.5">
          {STREETS_H.map((y) => (
            <line key={`h${y}`} x1="-400" x2="1400" y1={y} y2={y} />
          ))}
          {STREETS_V.map((x) => (
            <line key={`v${x}`} x1={x} x2={x} y1="-300" y2="800" />
          ))}
        </g>

        {/* quarteirões em destaque */}
        <g fill="#C4E7E8" fillOpacity="0.45">
          <rect x="68" y="160" width="140" height="110" rx="14" />
          <rect x="272" y="160" width="220" height="110" rx="14" />
          <rect x="548" y="160" width="110" height="110" rx="14" />
          <rect x="712" y="230" width="120" height="110" rx="14" />
          <rect x="272" y="330" width="220" height="100" rx="14" />
          <rect x="392" y="-10" width="110" height="80" rx="14" />
        </g>

        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#00ADB4"
          strokeOpacity="0.35"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="2 14"
        />
        <path
          ref={progressRef}
          d={ROUTE_PATH}
          fill="none"
          stroke="#00ADB4"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {stops.map((stop, i) => {
          const done = i < collected;
          return (
            <g
              key={`${stop.x}-${stop.y}`}
              transform={`translate(${stop.x} ${stop.y})`}
            >
              {done && (
                <circle
                  r="16"
                  fill="none"
                  stroke="#00ADB4"
                  strokeWidth="2"
                  className="login-stop-pop"
                />
              )}
              <circle
                r="13"
                fill={done ? "#00ADB4" : "#FAF7FA"}
                stroke="#00ADB4"
                strokeWidth="4"
                style={{ transition: "fill 0.3s" }}
              />
              {done && (
                <path
                  d="M-5 0 L-1.5 4 L5 -4"
                  fill="none"
                  stroke="#FAF7FA"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          );
        })}

        {/* caminhão */}
        <g ref={truckRef}>
          <circle
            r="38"
            fill="#00ADB4"
            fillOpacity="0.18"
            className="login-truck-pulse"
          />
          {/* visto de cima, de frente para a direita */}
          <rect
            x="-32"
            y="-14"
            width="68"
            height="28"
            rx="8"
            fill="#232B22"
            fillOpacity="0.14"
          />
          {/* rodas */}
          <g fill="#232B22">
            <rect x="-24" y="-17" width="11" height="6" rx="2" />
            <rect x="-24" y="11" width="11" height="6" rx="2" />
            <rect x="13" y="-17" width="11" height="6" rx="2" />
            <rect x="13" y="11" width="11" height="6" rx="2" />
          </g>
          {/* caçamba */}
          <rect x="-34" y="-13" width="48" height="26" rx="6" fill="#00ADB4" />
          <path
            d="M-24 -13 V13 M-6 -13 V13"
            stroke="#004A55"
            strokeOpacity="0.5"
            strokeWidth="2"
          />
          <path
            d="M-15 -6 V6 M-19.5 1.5 L-15 6 L-10.5 1.5"
            fill="none"
            stroke="#FAF7FA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* cabine */}
          <rect x="16" y="-12" width="22" height="24" rx="7" fill="#4D534C" />
          <rect x="27" y="-9" width="8" height="18" rx="3" fill="#C4E7E8" />
          <circle cx="38" cy="-7" r="2" fill="#FAF7FA" />
          <circle cx="38" cy="7" r="2" fill="#FAF7FA" />
        </g>
      </svg>

      {/* painel de status ao vivo */}
      <div className="absolute right-10 top-0 w-64 rounded-2xl border border-brand-aqua/20 bg-brand-paper/90 p-4 shadow-[0_18px_40px_-20px_rgba(12,107,112,0.5)] backdrop-blur xl:right-16">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-ink">
          <span className="relative flex h-2.5 w-2.5">
            <span className="login-live absolute inline-flex h-full w-full rounded-full bg-brand-aqua" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-aqua" />
          </span>
          Coleta em andamento
        </div>
        <p className="mt-2 font-unbounded text-2xl font-semibold text-brand-deep">
          {collected}
          <span className="text-base font-medium text-brand-ink/70">
            {" "}
            de {STOP_POSITIONS.length} pontos
          </span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-mint">
          <div
            className="h-full rounded-full bg-brand-aqua transition-[width] duration-700"
            style={{ width: `${(collected / STOP_POSITIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
