import { useRef, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';
import useRafLoop from 'react-use/lib/useRafLoop';
import useWindowSize from 'react-use/lib/useWindowSize';

type CursorSvgPropType = {
  initialConfig: CursorSvgConfig;
  renderItem: (index: number, cx: number, cy: number) => React.ReactNode;
};

const Cursor = (props: CursorSvgPropType) => {
  const { initialConfig, renderItem } = props;
  const refContainer = useRef<HTMLDivElement>(null!);
  const config = useRef(initialConfig).current;
  const [_, setTicks] = useState(0);

  const setCursorCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      if (e.touches && e.touches[0]) {
        config.mouse.x = e.touches[0].clientX;
        config.mouse.y = e.touches[0].clientY;
      }
    } else {
      config.mouse.x = (e as MouseEvent).clientX;
      config.mouse.y = (e as MouseEvent).clientY;
    }
  };

  const setDiffs = () => {
    config.diff.x = config.mouse.x - config.pos.x;
    config.diff.y = config.mouse.y - config.pos.y;
    config.pos.x += config.diff.x * config.speed;
    config.pos.y += config.diff.y * config.speed;
  };

  const setSvgsCoordinate = () => {
    config.posTrail = { x: config.pos.x, y: config.pos.y };
    for (const [i, point] of config.points.entries()) {
      config.nextParticle = config.points[i + 1] || config.points[0];
      point.x = config.posTrail.x;
      point.y = config.posTrail.y;
      if (config.nextParticle) {
        config.posTrail.x += (config.nextParticle.x - point.x) * (config.delta || 0.9);
        config.posTrail.y += (config.nextParticle.y - point.y) * (config.delta || 0.9);
      }
    }
  };

  const onMouseMove = (event: Event) => {
    setCursorCoordinates(event as MouseEvent | TouchEvent);
  };

  useEvent('mousemove', onMouseMove, window, { passive: true });
  const { width, height } = useWindowSize();

  useRafLoop(() => {
    setDiffs();
    setSvgsCoordinate();
    setTicks((ticks: number) => ticks + 1);
  });

  return (
    <div
      ref={refContainer}
      className="pointer-events-none fixed left-0 top-0 z-10 size-full mix-blend-difference"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ background: config.background, cursor: config.cursor ? 'default' : 'none' }}
      >
        <defs>
          <linearGradient id="gradient">
            <stop
              offset="0%"
              stopColor={config.gradientColorPrimary}
            />
            <stop
              offset="100%"
              stopColor={config.gradientColorSecondary}
            />
          </linearGradient>
        </defs>
        <g>
          {
            config.points.map((point, index) => {
              return renderItem(index, point.x, point.y);
            })
          }
        </g>
      </svg>
    </div>
  );
};

const isTouchDevices = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const initialCursorConfig = {
  mouse: { x: 200, y: 200 },
  pos: { x: 200, y: 200 },
  diff: { x: 0, y: 0 },
  speed: 0.5,
  cursor: true,
  background: 'none',
  points: Array.from({ length: !isTouchDevices ? 300 : 200 }, () => ({ x: 200, y: 200 })),
  gradientColorPrimary: '#FAFAFA', // 3effe8
  gradientColorSecondary: '#000000', // 8c0fee
  posTrail: { x: 200, y: 200 },
  nextParticle: undefined as { x: number; y: number } | undefined,
  delta: 0.04,
};

type CursorSvgConfig = typeof initialCursorConfig;

export default function CursorTrail() {
  return (
    <Cursor
      initialConfig={initialCursorConfig}
      renderItem={
        (index, cx, cy) => (
          <circle
            key={index}
            id={index.toString()}
            r={!isTouchDevices ? 30 : 70}
            cx={cx}
            cy={cy}
            fill="url('#gradient')"
            fillOpacity={1}
            stroke="none"
            strokeWidth={0}
            strokeOpacity={1}
          />
        )
      }
    />
  );
}
