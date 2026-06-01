import React from 'react';
import '../styles/animations.css';

export interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'chart' | 'table' | 'custom';
  count?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Skeleton Loader with shimmer animation
 *
 * @example
 * <SkeletonLoader type="chart" />
 * <SkeletonLoader type="card" count={3} />
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  count = 1,
  width = '100%',
  height = '16px',
  className = '',
}) => {
  const skeletonArray = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return skeletonArray.map((_, i) => (
          <div
            key={i}
            className={`skeleton skeleton-text ${i === skeletonArray.length - 1 ? 'skeleton-text short' : ''}`}
            style={{
              width: i === skeletonArray.length - 1 ? '60%' : '100%',
            }}
          />
        ));

      case 'card':
        return skeletonArray.map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ));

      case 'chart':
        return <div className="skeleton skeleton-chart" />;

      case 'table':
        return (
          <div className="space-y-3">
            {skeletonArray.map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ))}
          </div>
        );

      case 'custom':
      default:
        return (
          <div
            className={`skeleton ${className}`}
            style={{
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderSkeleton()}
    </div>
  );
};

/**
 * KPI Card Skeleton
 */
export const KPICardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card space-y-4"
        >
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
};

/**
 * Chart Skeleton with shimmer
 */
export const ChartSkeleton: React.FC<{ height?: string }> = ({
  height = '300px',
}) => {
  return (
    <div
      className="skeleton rounded-lg"
      style={{ height }}
    />
  );
};

/**
 * List Item Skeleton
 */
export const ListItemSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
        >
          <div className="space-y-2">
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-3 w-3/5" />
            <div className="skeleton h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
