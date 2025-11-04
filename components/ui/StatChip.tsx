import type { ReactNode } from 'react';

type StatChipProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'rose' | 'amber' | 'slate';
  className?: string;
};

export function StatChip({ label, value, icon, accent = 'slate', className }: StatChipProps) {
  return (
    <div role="listitem">
      {icon && (
        <span>
          {icon}
        </span>
      )}
      <div>
        <span>
          {label}
        </span>
        <span>
          {value}
        </span>
      </div>
    </div>
  );
}