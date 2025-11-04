import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  className,
}: SectionHeadingProps) {
  return (
    <div>
      <div>
        {eyebrow && (
          <p>
            {eyebrow}
          </p>
        )}
        <h2>
          {title}
        </h2>
        {description && (
          <p>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}