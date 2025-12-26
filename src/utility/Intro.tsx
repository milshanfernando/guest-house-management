// Intro.tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Intro = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = gsap.timeline({
      onComplete: onComplete, // hide intro after animation
    });

    timeline
      .from(containerRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power2.out",
      })
      .to(containerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 1,
        ease: "power2.in",
      });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-blue-600 text-white z-50"
    >
      <h1 className="text-3xl font-bold">Welcome to Property Manager</h1>
    </div>
  );
};

export default Intro;
