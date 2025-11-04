import type { HTMLAttributes } from 'react';

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'solid' | 'muted' | 'elevated' | 'outline' | 'glass' | 'gradient' | 'transparent';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  interactive?: boolean;
  accent?: boolean;
  bordered?: boolean;
};

export function Surface({
  padding = 'md',
  variant = 'solid',
  rounded = 'lg',
  hover = false,
  interactive = false,
  accent = false,
  bordered = false,
  className,
  children,
  ...rest
}: SurfaceProps) {
  const paddingClasses = {
    none: '',
    xs: 'p-xs',
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg',
    xl: 'p-xl'
  };

  const variantClasses = {
    solid: `bg-surface ${accent ? 'shadow-lg' : 'shadow-md'}`,
    muted: 'bg-surface-elevated shadow-sm',
    elevated: 'bg-surface shadow-xl',
    outline: 'bg-surface border border-border/50',
    glass: 'bg-surface/80 backdrop-blur-sm border border-border/30 shadow-lg',
    gradient: accent
      ? 'bg-gradient-accent shadow-xl'
      : 'bg-gradient-surface shadow-md',
    transparent: ''
  };

  const roundedClasses = {
    none: '',
    xs: 'rounded-xs',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const hoverClass = hover
    ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-normal cursor-pointer'
    : '';

  const interactiveClass = interactive
    ? 'cursor-pointer active:scale-[0.98] transition-all duration-fast'
    : '';

  const accentClass = accent
    ? 'ring-2 ring-accent/20 ring-offset-2 ring-offset-surface'
    : '';

  const borderClass = bordered
    ? 'border border-border/50'
    : '';

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${roundedClasses[rounded]}
        ${paddingClasses[padding]}
        ${hoverClass}
        ${interactiveClass}
        ${accentClass}
        ${borderClass}
        transition-all duration-normal
        ${className || ''}
      `.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
