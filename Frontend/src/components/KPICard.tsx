import React from 'react';
import { useNumberAnimation } from '../hooks/useNumberAnimation';
import '../styles/animations.css';

export interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  decimalPlaces?: number;
  animationDuration?: number;
}

/**
 * KPI Card with animated number counter
 *
 * @example
 * <KPICard
 *   title="Conversion Rate"
 *   value={68.0}
 *   unit="%"
 *   description="Last 30 days"
 *   trend="up"
 *   trendValue={5.2}
 * />
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = '',
  icon,
  description,
  variant = 'default',
  trend,
  trendValue,
  decimalPlaces = 1,
  animationDuration = 1500,
}) => {
  const animatedValue = useNumberAnimation(value, animationDuration, decimalPlaces);

  const variantClasses: Record<string, string> = {
    default: 'border-l-4 border-l-blue-500',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-orange-500',
    error: 'border-l-4 border-l-red-500',
  };

  const trendColors: Record<string, string> = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const trendIcons: Record<string, string> = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      className={`
        card
        ${variantClasses[variant]}
        flex flex-col gap-2
        transition-all duration-300
      `}
    >
      {/* Header: Icon + Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon && <div className="text-xl text-gray-400">{icon}</div>}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-900">
          {animatedValue}
        </span>
        {unit && <span className="text-lg font-semibold text-gray-600">{unit}</span>}
      </div>

      {/* Trend */}
      {trend && trendValue !== undefined && (
        <div className={`text-xs font-semibold ${trendColors[trend]}`}>
          <span className="mr-1">{trendIcons[trend]}</span>
          {trendValue > 0 ? '+' : ''}{trendValue}%
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
