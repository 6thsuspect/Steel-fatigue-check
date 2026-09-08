interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  unit?: string;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export default function InputField({
  label,
  value,
  onChange,
  type = 'number',
  unit,
  placeholder,
  helpText,
  min,
  max,
  step,
  required = false,
}: InputFieldProps) {
  return (
    <div className="mb-3 animate-fade-in">
      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 
            focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]/30
            placeholder-gray-400 transition-all duration-200"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">
            {unit}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{helpText}</p>
      )}
    </div>
  );
}
