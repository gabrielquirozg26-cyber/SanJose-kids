import React from 'react';
import { cardVariants } from '../../styles/designSystem';

const Card = ({
  children,
  variant = 'default',
  className = '',
  glow = false,
  onClick,
  ...props
}) => {
  const variantClass = glow 
    ? cardVariants.glow 
    : cardVariants[variant] || cardVariants.default;

  return (
    <div
      onClick={onClick}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;