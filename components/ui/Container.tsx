import type { HTMLAttributes } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  width?: 'default' | 'wide' | 'full' | 'narrow';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  glow?: boolean;
};

export function Container({
  width = 'default',
  padding = 'md',
  center = true,
  glow = false,
  className,
  children,
  ...rest
}: ContainerProps) {
  const widthClasses = {
    default: 'max-w-7xl mx-auto px-lg lg:px-xl',
    wide: 'max-w-full mx-auto px-lg lg:px-xl',
    full: 'w-full',
    narrow: 'max-w-4xl mx-auto px-lg lg:px-xl'
  };

  const paddingClasses = {
    none: '',
    xs: 'px-sm py-xs',
    sm: 'px-md py-sm',
    md: 'px-lg py-md',
    lg: 'px-xl py-lg',
    xl: 'px-2xl py-xl'
  };

  const centerClass = center ? 'mx-auto' : '';
  const glowClass = glow ? 'relative' : '';

  return (
    <div
      className={`
        ${widthClasses[width]}
        ${paddingClasses[padding]}
        ${centerClass}
        ${glowClass}
        ${className || ''}
      `.trim()}
      {...rest}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent pointer-events-none" />
      )}
      <div className="relative z-base">
        {children}
      </div>
    </div>
  );
}