import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
type ButtonSize = 'default' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  outline: 'border border-indigo-500 text-indigo-700 hover:bg-indigo-50',
  destructive: 'text-rose-600 hover:text-rose-700',
  ghost: 'text-slate-700 hover:bg-slate-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'px-3 py-2 text-sm',
  sm: 'px-2 py-1 text-xs',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
