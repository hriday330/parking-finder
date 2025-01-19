interface TimePickerProps {
  value: string; // The value for the time
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Function to handle time change
  label?: string; // Optional label for the time picker
  labelClassName?: string;
  inputClassName?: string;
}

const TimePicker = ({ value, onChange, label = 'Select Time', labelClassName, inputClassName}: TimePickerProps) => {
  return (
    <div className="flex flex-col space-y-2 bg-white border-2 rounded-lg items-center">
      <label htmlFor="time" className={`text-sm font-medium text-gray-700 ${labelClassName}`}>
        {label}
      </label>
        <hr className="border-2 border-black"/>
        <input
            className={`px-1 bg-white text-center font-semibold text-lg ${inputClassName}`}
            type='time'
            onChange={onChange}
            value={value}
        />
    </div>
  );
};

export default TimePicker;

