"use client";

import { useEffect, useRef } from "react";

export const REPLAY_INTRO_EVENT = "replayIntro";

function runIntro(onEnd: () => void) {
  const intro = document.getElementById("intro-screen");
  const balls = intro?.querySelectorAll<HTMLElement>(".intro-center .ball");
  const logoBalls = document.querySelectorAll<HTMLElement>(".logo-ball");
  const text = intro?.querySelectorAll<HTMLElement>(".intro-logo-text span");

  if (!intro || !balls || balls.length !== 3 || logoBalls.length !== 3 || !text || text.length !== 4) return;

  const introLogoText = intro.querySelector<HTMLElement>(".intro-logo-text");
  const headerLogoText = document.querySelector<HTMLElement>(".logo-text");
  if (introLogoText && headerLogoText) {
    const rect = headerLogoText.getBoundingClientRect();
    introLogoText.style.top = `${rect.top}px`;
    introLogoText.style.left = `${rect.left}px`;
  }

  delete document.body.dataset.logoVisible;
  logoBalls.forEach((el) => (el.style.opacity = "0"));
  text.forEach((t) => (t.style.opacity = "0"));

  balls.forEach((ball) => {
    ball.style.transition = "none";
    ball.style.opacity = "1";
    ball.style.transform = "translate(0,0) scale(1.5)";
  });

  const timeouts: ReturnType<typeof setTimeout>[] = [];

  /* 100%→20% 페이드 + 크기 50%(scale 0.5), 20% 도달 후 이동, 올라간 뒤 20%→100% */
  const phase1Ms = 4143; /* 약 4.1초 */
  const fadeTo20EndMs = 500 + phase1Ms;
  timeouts.push(
    setTimeout(() => {
      balls.forEach((ball) => {
        ball.style.transition = `opacity ${phase1Ms}ms, transform ${phase1Ms}ms`;
        ball.style.opacity = "0.2";
        ball.style.transform = "translate(0,0) scale(0.5)";
      });
    }, 500)
  );

  /* 20%·50% 크기 도달 후 0.1초 대기 → 노란 공 이동, 공마다 0.3초 간격 */
  const moveDurationMs = 500;
  const moveAt = [fadeTo20EndMs + 100, fadeTo20EndMs + 400, fadeTo20EndMs + 700];
  balls.forEach((ball, i) => {
    timeouts.push(
      setTimeout(() => {
        const start = ball.getBoundingClientRect();
        const end = logoBalls[i].getBoundingClientRect();
        const moveX = end.left - start.left + (end.width - start.width) / 2;
        const moveY = end.top - start.top + (end.height - start.height) / 2;
        ball.style.transition = `transform ${moveDurationMs}ms ease-out`;
        ball.style.transform = `translate(${moveX}px,${moveY}px) scale(0.04)`;
      }, moveAt[i])
    );
    timeouts.push(
      setTimeout(() => {
        logoBalls[i].style.opacity = "1";
      }, moveAt[i] + moveDurationMs)
    );
  });

  /* 공 다 올라간 후 20%→100% 페이드 2.5초, 밝아지는 동안 글자 1글자씩 */
  const whiteBallLandsMs = moveAt[2] + moveDurationMs;
  const phase3Ms = 2500; /* 20%→100% 2.5초 */
  timeouts.push(
    setTimeout(() => {
      balls.forEach((ball) => {
        ball.style.transition = `opacity ${phase3Ms}ms`;
        ball.style.opacity = "1";
      });
    }, whiteBallLandsMs)
  );

  /* 밝아지기 구간에 "죽방클럽" 1글자씩 등장(간격 50% 단축), 각 글자 투명도는 그 시점의 공 투명도에 맞춤 */
  const numChars = text.length;
  const letterSpanMs = phase3Ms * 0.5; /* 글자 등장 구간: 기존 대비 50% */
  const charDelayMs = (i: number) => (numChars > 1 ? (i / (numChars - 1)) * letterSpanMs : 0);
  /* 공: 20%→100% 선형, t(ms)일 때 opacity = 0.2 + (t/phase3Ms)*0.8 */
  timeouts.push(
    setTimeout(() => {
      if (introLogoText && headerLogoText) {
        const rect = headerLogoText.getBoundingClientRect();
        introLogoText.style.top = `${rect.top}px`;
        introLogoText.style.left = `${rect.left}px`;
      }
      text.forEach((t, i) => {
        const tMs = charDelayMs(i);
        timeouts.push(
          setTimeout(() => {
            const startOpacity = 0.2 + (tMs / phase3Ms) * 0.8;
            const remainMs = phase3Ms - tMs; /* 100%까지 남은 시간 */
            t.style.transition = `opacity ${remainMs}ms`;
            t.style.opacity = String(startOpacity);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                t.style.opacity = "1";
              });
            });
          }, tMs)
        );
      });
    }, whiteBallLandsMs)
  );

  /* 죽방클럽 글자가 다 완성된 후(phase3 끝) 0.3초 대기 → 공·글자 동시에 2번 깜빡임 */
  const pauseAfterLettersMs = 300; /* 0.3초 대기 */
  const blinkStartMs = whiteBallLandsMs + phase3Ms + pauseAfterLettersMs;
  const blinkDurMs = 120;
  timeouts.push(
    setTimeout(() => {
      balls.forEach((b) => {
        b.style.transition = `opacity ${blinkDurMs}ms`;
        b.style.opacity = "0";
      });
      text.forEach((t) => {
        t.style.transition = `opacity ${blinkDurMs}ms`;
        t.style.opacity = "0";
      });
      timeouts.push(
        setTimeout(() => {
          balls.forEach((b) => (b.style.opacity = "1"));
          text.forEach((t) => (t.style.opacity = "1"));
          timeouts.push(
            setTimeout(() => {
              balls.forEach((b) => (b.style.opacity = "0"));
              text.forEach((t) => (t.style.opacity = "0"));
              timeouts.push(
                setTimeout(() => {
                  balls.forEach((b) => (b.style.opacity = "1"));
                  text.forEach((t) => (t.style.opacity = "1"));
                }, blinkDurMs)
              );
            }, 200)
          );
        }, blinkDurMs)
      );
    }, blinkStartMs)
  );

  /* 2번 깜빡임 끝난 뒤 인트로 페이드 아웃 */
  const introFadeMs = blinkStartMs + 550;
  timeouts.push(
    setTimeout(() => {
      document.body.dataset.logoVisible = "1";
      /* 인라인 opacity 제거해야 CSS body[data-logo-visible] .logo-text span 이 적용됨 */
      document.querySelectorAll<HTMLElement>(".logo-text span").forEach((t) => t.style.removeProperty("opacity"));
      document.querySelectorAll<HTMLElement>(".logo-ball").forEach((el) => el.style.removeProperty("opacity"));
      intro.style.transition = "opacity 0.4s";
      intro.style.opacity = "0";
      timeouts.push(
        setTimeout(() => onEnd(), 400)
      );
    }, introFadeMs)
  );

  return () => timeouts.forEach(clearTimeout);
}

export default function IntroScreen({ onEnd }: { onEnd: () => void }) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = runIntro(onEnd);
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [onEnd]);

  return (
    <div
      id="intro-screen"
      className="intro-screen cursor-pointer"
      aria-hidden
      onClick={() => onEnd()}
      onKeyDown={(e) => e.key === "Enter" && onEnd()}
      role="button"
      tabIndex={0}
    >
      <div className="intro-logo-text">
        <span>죽</span>
        <span>방</span>
        <span>클</span>
        <span>럽</span>
      </div>
      <div className="intro-center">
        <div className="ball yellow" />
        <div className="ball red" />
        <div className="ball white" />
      </div>
    </div>
  );
}
