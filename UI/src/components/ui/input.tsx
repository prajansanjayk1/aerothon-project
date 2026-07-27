import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#003366] focus:outline-hidden focus:ring-1 focus:ring-[#003366] disabled:cursor-not-allowed disabled:opacity-50 font-mono',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
