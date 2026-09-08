interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  helpText?: string;
  required?: boolean;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  helpText,
  required = false,
}: SelectFieldProps) {
  return (
    <div className="mb-3 animate-fade-in">
      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 
          focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]/30
          appearance-none cursor-pointer transition-all duration-200"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{helpText}</p>
      )}
    </div>
  );
}
