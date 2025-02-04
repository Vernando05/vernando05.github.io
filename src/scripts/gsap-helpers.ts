import { gsap } from 'gsap';

type HorizontalLoopConfig = {
  repeat?: number;
  paused?: boolean;
  speed?: number;
  snap?: boolean | number;
  paddingRight?: number;
  reversed?: boolean;
};

type HorizontalLoopTimeline = {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween;
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween;
  current: () => number;
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  times: number[];
} & gsap.core.Timeline;

export function horizontalLoop(items: gsap.DOMTarget, config?: HorizontalLoopConfig): HorizontalLoopTimeline {
  items = gsap.utils.toArray(items);
  config = config || {};
  const tl: HorizontalLoopTimeline = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  }) as HorizontalLoopTimeline;
  const length = items.length;
  const startX = (items[0] as HTMLElement)?.offsetLeft ?? 0;
  const times: number[] = [];
  const widths: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = typeof config.snap === 'number' || Array.isArray(config.snap) ? gsap.utils.snap(config.snap) : (v: number) => v;
  let curX: number;
  let distanceToStart: number;
  let distanceToLoop: number;
  let item: HTMLElement;
  let i: number;

  gsap.set(items, {
    xPercent: (i, el) => {
      const w = (widths[i] = Number.parseFloat(gsap.getProperty(el, 'width', 'px') as string));
      xPercents[i] = snap(
        (Number.parseFloat(gsap.getProperty(el, 'x', 'px') as string) / w) * 100
        + Number(gsap.getProperty(el, 'xPercent')),
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });
  const totalWidth = (items[length - 1] ?? { offsetLeft: 0, offsetWidth: 0 }) ? (items[length - 1] as HTMLElement).offsetLeft + (xPercents[length - 1] ?? 0 / 100) * (widths[length - 1] ?? 0) : 0 - startX + (((items[length - 1] as HTMLElement ?? { offsetWidth: 0 }).offsetWidth || 0) * (Number(gsap.getProperty(items[length - 1] ?? '', 'scaleX') || 1))) + (Number.parseFloat(config.paddingRight?.toString() || '0') || 0);
  for (i = 0; i < length; i++) {
    item = items[i] as HTMLElement;
    curX = (xPercents[i] ?? 0 / 100) * (widths[i] ?? 0);
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop = distanceToStart + (widths[i] ?? 0) * Number(gsap.getProperty(item, 'scaleX') || 1);
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / (widths[i] ?? 1)) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / (widths[i] ?? 1)) * 100,
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond,
      )
      .add(`label${i}`, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }
  function toIndex(index: number, vars?: gsap.TweenVars) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2
    && (index += index > curIndex ? -length : length);
    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex] ?? 0;
    if ((time > tl.time()) !== (index > curIndex)) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }
  tl.next = vars => toIndex(curIndex + 1, vars);
  tl.previous = vars => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);
  if (config.reversed) {
    if (tl.vars.onReverseComplete) {
      tl.vars.onReverseComplete();
    }
    tl.reverse();
  }
  return tl;
}
