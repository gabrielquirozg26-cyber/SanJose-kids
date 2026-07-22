import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  error = null,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const errorClass = error ? 'border-red-400 focus:border-red-400' : 'border-white/10 focus:border-yellow-400';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] text-yellow-400 font-black uppercase tracking-widest ml-2 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full bg-white/5 border-2 rounded-xl px-4 py-3
            text-white font-bold outline-none transition-all
            placeholder:text-white/20 placeholder:font-normal
            ${errorClass}
            ${disabledClass}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-[10px] font-black mt-1 ml-2">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;