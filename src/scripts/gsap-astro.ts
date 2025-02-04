import { navigate } from 'astro:transitions/client';
import { gsap } from 'gsap';

export default function GsapAstro() {
  let url = '#';
  const timeline = gsap.timeline({ onReverseComplete: () => {
    navigate(url);
  } });

  document.addEventListener('click', (e) => {
    e.preventDefault();
    const { target } = e;

    if (!(target instanceof HTMLElement)) {
      return;
    }
    const anchor = target.closest('a');
    if (anchor && anchor.href) {
      url = anchor.href;

      if (timeline.getChildren()) {
        timeline.reverse();
      } else {
        navigate(url);
      }
    }
  });

  return timeline;
}
