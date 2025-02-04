import alea from 'alea';
import { useEffect, useRef } from 'react';
import useRafLoop from 'react-use/lib/useRafLoop';
import useWindowSize from 'react-use/lib/useWindowSize';
import { createNoise3D } from 'simplex-noise';
import {
  cos,
  fadeInOut,
  rand,
  sin,
  TAU,
} from '../scripts/util';

type BackgroundAmbientPropsType = {
  id?: string;
};

const initialConfig = {
  circleCount: 150,
  circlePropCount: 9,
  circlePropsLength: 0,
  baseSpeed: 0.1,
  rangeSpeed: 1,
  baseTTL: 350,
  rangeTTL: 400,
  baseRadius: 100,
  rangeRadius: 200,
  rangeHue: 50,
  xOff: 0.0015,
  yOff: 0.0015,
  zOff: 0.0015,
  backgroundColor: 'hsla(0,0%,0%,1)',
  ctx: { a: null as unknown as CanvasRenderingContext2D, b: null as unknown as CanvasRenderingContext2D },
  circleProps: new Float32Array(),
  noise3D: createNoise3D(alea('seed')),
  baseHue: 0,
};
initialConfig.circlePropsLength = initialConfig.circleCount * initialConfig.circlePropCount;
initialConfig.circleProps = new Float32Array(initialConfig.circlePropsLength);

export default function BackgroundAmbient(props: BackgroundAmbientPropsType) {
  const { id } = props;
  const config = useRef(initialConfig).current;
  const refContainer = useRef<HTMLDivElement>(null!);
  const refCanvasA = useRef<HTMLCanvasElement>(null!);
  const refCanvasB = useRef<HTMLCanvasElement>(null!);

  const initCircle = (i: number) => {
    const x = rand(refContainer.current.offsetWidth);
    const y = rand(refContainer.current.offsetHeight);
    const n = config.noise3D(x * config.xOff, y * config.yOff, config.baseHue * config.zOff);
    const t = rand(TAU);
    const speed = config.baseSpeed + rand(config.rangeSpeed);
    const vx = speed * cos(t);
    const vy = speed * sin(t);
    const life = 0;
    const ttl = config.baseTTL + rand(config.rangeTTL);
    const radius = config.baseRadius + rand(config.rangeRadius);
    const hue = config.baseHue + n * config.rangeHue;
    const lightness = Math.floor(Math.random() * 51);

    config.circleProps.set([x, y, vx, vy, life, ttl, radius, hue, lightness], i);
  };

  const initCircles = () => {
    for (let i = 0; i < config.circlePropsLength; i += config.circlePropCount) {
      initCircle(i);
    }
  };

  const drawCircle = (
    x: number,
    y: number,
    life: number,
    ttl: number,
    radius: number,
    hue: number,
    lightness: number,
  ) => {
    config.ctx.a.save();
    config.ctx.a.fillStyle = `hsla(${hue},0%,${lightness}%,${fadeInOut(life, ttl)})`;
    config.ctx.a.beginPath();
    config.ctx.a.arc(x, y, radius, 0, TAU);
    config.ctx.a.fill();
    config.ctx.a.closePath();
    config.ctx.a.restore();
  };

  const checkBounds = (x: number, y: number, radius: number) => {
    return (
      x < -radius
      || x > refContainer.current.offsetWidth + radius
      || y < -radius
      || y > refContainer.current.offsetHeight + radius
    );
  };

  const updateCircle = (i: number) => {
    const i2 = 1 + i;
    const i3 = 2 + i;
    const i4 = 3 + i;
    const i5 = 4 + i;
    const i6 = 5 + i;
    const i7 = 6 + i;
    const i8 = 7 + i;
    const i9 = 8 + i;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let life = 0;
    let ttl = 0;
    let radius = 0;
    let hue = 0;
    let lightness = 0;

    x = config.circleProps[i] ?? 0;
    y = config.circleProps[i2] ?? 0;
    vx = config.circleProps[i3] ?? 0;
    vy = config.circleProps[i4] ?? 0;
    life = config.circleProps[i5] ?? 0;
    ttl = config.circleProps[i6] ?? 0;
    radius = config.circleProps[i7] ?? 0;
    hue = config.circleProps[i8] ?? 0;
    lightness = config.circleProps[i9] ?? 0;

    drawCircle(x, y, life, ttl, radius, hue, lightness);

    life++;

    config.circleProps[i] = x + vx;
    config.circleProps[i2] = y + vy;
    config.circleProps[i5] = life;

    (checkBounds(x, y, radius) || life > ttl) && initCircle(i);
  };

  const updateCircles = () => {
    for (let i = 0; i < config.circlePropsLength; i += config.circlePropCount) {
      updateCircle(i);
    }
  };

  const resize = () => {
    refCanvasA.current.width = refContainer.current.offsetWidth;
    refCanvasA.current.height = refContainer.current.offsetHeight;
    config.ctx.a.drawImage(refCanvasB.current, 0, 0);

    refCanvasB.current.width = refContainer.current.offsetWidth;
    refCanvasB.current.height = refContainer.current.offsetHeight;
    config.ctx.b.drawImage(refCanvasA.current, 0, 0);
  };

  const render = () => {
    config.ctx.b.save();
    config.ctx.b.filter = 'blur(50px)';
    config.ctx.b.drawImage(refCanvasA.current, 0, 0);
    config.ctx.b.restore();
  };

  useWindowSize({ onChange: resize });

  useEffect(() => {
    config.ctx.a = refCanvasA.current.getContext('2d')!;
    config.ctx.b = refCanvasB.current.getContext('2d')!;
    refCanvasA.current.width = refContainer.current.offsetWidth;
    refCanvasA.current.height = refContainer.current.offsetHeight;
    refCanvasB.current.width = refContainer.current.offsetWidth;
    refCanvasB.current.height = refContainer.current.offsetHeight;
    initCircles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useRafLoop(() => {
    config.ctx.a.clearRect(0, 0, refContainer.current.offsetWidth, refContainer.current.offsetHeight);
    config.ctx.b.fillStyle = config.backgroundColor;
    config.ctx.b.fillRect(0, 0, refContainer.current.offsetWidth, refContainer.current.offsetHeight);
    updateCircles();
    if (refCanvasA.current.width) {
      render();
    }
  });

  return (
    <div
      id={id}
      ref={refContainer}
      className="h-full"
    >
      <canvas
        className="hidden"
        ref={refCanvasA}
      />
      <canvas
        ref={refCanvasB}
      />
    </div>
  );
}
