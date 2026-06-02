import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** 섹션 reveal/framework/marquee 모션을 등록. cleanup은 gsap.context().revert()로 처리한다. */
export function registerScrollReveal() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 84%" },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-framework-item]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 54 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: i * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%" },
      },
    );
  });

  gsap.to("[data-marquee-track]", { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
}

/** Hero 인트로 타임라인 */
export function playHeroIntro() {
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from("[data-hero-mark]", { opacity: 0, y: 16, duration: 0.6 })
    .from("[data-hero-line]", { opacity: 0, y: 30, duration: 0.75, stagger: 0.08 }, "-=0.1")
    .from("[data-hero-rail]", { opacity: 0, x: 24, duration: 0.7 }, "-=0.4")
    .from("[data-hero-cta]", { opacity: 0, y: 18, duration: 0.6 }, "-=0.3");
}
