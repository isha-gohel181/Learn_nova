import { useCallback, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export function useParallaxTilt({ max = 12, hoverScale = 1.02 } = {}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const scale = useSpring(useMotionValue(1), { stiffness: 220, damping: 18 });

  const onMouseMove = useCallback(
    (event) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xPercent = (x / rect.width - 0.5) * 2;
      const yPercent = (y / rect.height - 0.5) * 2;
      rotateX.set(-yPercent * max);
      rotateY.set(xPercent * max);
      scale.set(hoverScale);
    },
    [hoverScale, max, rotateX, rotateY, scale]
  );

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  const onMouseEnter = useCallback(() => {
    scale.set(hoverScale);
  }, [hoverScale, scale]);

  return {
    ref,
    motionStyle: {
      rotateX,
      rotateY,
      scale,
      transformStyle: 'preserve-3d',
    },
    eventHandlers: { onMouseMove, onMouseLeave, onMouseEnter },
  };
}
