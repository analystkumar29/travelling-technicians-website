'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

type Direction = 'left' | 'right' | 'up' | 'down';

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  up: { x: 0, y: -40 },
  down: { x: 0, y: 40 },
};

const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = 'left', delay = 0, duration = 0.5, distance, ...props }, ref) => {
    const offset = offsets[direction];
    const scale = distance ? distance / 40 : 1;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: offset.x * scale, y: offset.y * scale }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration, delay, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';
export { SlideIn };
