import React from 'react';
import { buttonVariants, buttonSizes, animations } from '../../styles/designSystem';

const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  icon = null,
  iconPosition = 'left',
  ...props
}) => {
  const variantClass = buttonVariants[variant] || buttonVariants.primary;
  const sizeClass = buttonSizes[size] || buttonSizes.md;
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const loadingClass = loading ? 'opacity-70 cursor-wait' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClass}
        ${sizeClass}
        ${fullWidthClass}
        ${loadingClass}
        ${disabledClass}
        rounded-xl font-black uppercase tracking-widest
        transition-all duration-200
        flex items-center justify-center gap-2
        ${animations.scale}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && iconPosition === 'left' && !loading && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && !loading && <span>{icon}</span>}
    </button>
  );
};

export default Button;