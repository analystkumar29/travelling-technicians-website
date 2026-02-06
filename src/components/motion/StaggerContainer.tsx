'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  staggerDelay?: number;
  delayStart?: number;
}

const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.1, delayStart = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayStart,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

StaggerContainer.displayName = 'StaggerContainer';

const StaggerItem = forwardRef<HTMLDivElement, Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode }>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

StaggerItem.displayName = 'StaggerItem';

export { StaggerContainer, StaggerItem };
