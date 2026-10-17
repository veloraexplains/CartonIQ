import React from 'react';

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Strict Numeric Input complying with CartonIQ rule:
 * - Stores state as a string.
 * - Never forces zero when backspaced to empty.
 * - Allows decimal point and numbers.
 * - Validates purely upon calculation or form save.
 */
export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '0',
  helper,
  error,
  prefix,
  suffix,
  allowDecimals = true,
  allowNegative = false,
  disabled = false,
  className = '',
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Filter valid characters: digits, optional single decimal, optional leading negative
    if (raw === '') {
      onChange('');
      return;
    }

    // Replace commas with dots
    raw = raw.replace(',', '.');

    // Build regex based on settings
    let validRegex = /^[0-9]*\.?[0-9]*$/;
    if (allowNegative) {
      validRegex = /^-?[0-9]*\.?[0-9]*$/;
    } else if (!allowDecimals) {
      validRegex = /^[0-9]*$/;
    }

    if (validRegex.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
            <span className="text-xs font-semibold text-slate-400">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-500 transition-colors focus:outline-none ${
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20'
          } ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'} py-2 ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-950' : ''
          }`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <span className="text-[11px] font-medium text-slate-400">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-rose-400 mt-0.5">{error}</p>}
      {!error && helper && <p className="text-[10px] text-slate-400 mt-0.5">{helper}</p>}
    </div>
  );
};
