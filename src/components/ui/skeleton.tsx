import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary-100', className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export { Skeleton };
