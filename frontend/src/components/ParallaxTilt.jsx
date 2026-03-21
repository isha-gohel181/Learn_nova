import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useParallaxTilt } from '@/hooks/useParallaxTilt';

export default function ParallaxTilt({
  children,
  className,
  max = 12,
  hoverScale = 1.02,
  ...props
}) {
  const { ref, motionStyle, eventHandlers } = useParallaxTilt({ max, hoverScale });

  return (
    <motion.div
      ref={ref}
      style={motionStyle}
      className={cn('will-change-transform', className)}
      {...eventHandlers}
      {...props}
    >
      {children}
    </motion.div>
  );
}
