import type { ComponentPropsWithoutRef, ElementType } from 'react';

type TypographyVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'muted'
  | 'caption'
  | 'eyebrow';

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
} & ComponentPropsWithoutRef<T>;

export function Typography<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  className,
  ...rest
}: TypographyProps<T>) {
  const Component = as ?? (variant === 'hero' ? 'h1' : variant === 'title' ? 'h2' : 'p');

  return (
    <Component {...rest} />
  );
}