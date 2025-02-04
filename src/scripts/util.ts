export const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
export const HALF_PI = 0.5 * PI;
export const TAU = 2 * PI;
export const TO_RAD = PI / 180;
export const floor = (n: number) => n | 0;
export const rand = (n: number) => n * random();
export const randIn = (min: number, max: number) => rand(max - min) + min;
export const randRange = (n: number) => n - rand(2 * n);
export const fadeIn = (t: number, m: number) => t / m;
export const fadeOut = (t: number, m: number) => (m - t) / m;
export const fadeInOut = (t: number, m: number) => {
  const hm = 0.5 * m;
  return abs((t + hm) % m - hm) / (hm);
};
export const dist = (x1: number, y1: number, x2: number, y2: number) => sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
export const angle = (x1: number, y1: number, x2: number, y2: number) => atan2(y2 - y1, x2 - x1);
export const lerp = (n1: number, n2: number, speed: number) => (1 - speed) * n1 + speed * n2;
