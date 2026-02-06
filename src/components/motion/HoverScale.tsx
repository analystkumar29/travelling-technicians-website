'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

interface HoverScaleProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  scale?: number;
  tapScale?: number;
}

const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.03, tapScale = 0.98, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

HoverScale.displayName = 'HoverScale';
export { HoverScale };
