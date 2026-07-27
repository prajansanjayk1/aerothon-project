import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-8 w-full rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-[#003366] focus:outline-hidden focus:ring-1 focus:ring-[#003366] disabled:cursor-not-allowed disabled:opacity-50 font-mono',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';
