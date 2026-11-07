import React, { useState, useRef, useEffect } from "react";

export interface EditableInputProps {
  initialValue: number | string;
  onSave: (val: string, numVal: number) => void;
  onCancel?: () => void;
  type?: "number" | "text" | "email" | string;
  min?: number;
  max?: number;
  step?: string | number;
  placeholder?: string;
  className?: string;
  autoSelect?: boolean;
}

const EditableInput: React.FC<EditableInputProps> = ({
  initialValue,
  onSave,
  onCancel,
  type,
  min,
  max,
  step,
  placeholder,
  className = "w-24 px-2 py-1 text-sm border border-blue-500 rounded bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400",
  autoSelect = true,
}) => {
  // Check if initialValue is a number or a string that represents a valid number (e.g. "120.50", "0")
  const isNumericValue =
    typeof initialValue === "number" ||
    (typeof initialValue === "string" &&
      initialValue.trim() !== "" &&
      !isNaN(Number(initialValue)) &&
      (!initialValue.startsWith("0") || initialValue === "0" || initialValue.startsWith("0.")));

  const resolvedType = type ?? (isNumericValue ? "number" : "text");
  const isNumberType = resolvedType === "number";

  const resolvedMin = min !== undefined ? min : isNumberType ? 0 : undefined;
  const resolvedStep = step !== undefined ? step : isNumberType ? "any" : undefined;

  const [val, setVal] = useState(String(initialValue ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (autoSelect) {
          inputRef.current.select();
        }
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [autoSelect]);

  const handleCommit = () => {
    const parsed = parseFloat(val);
    const numVal = isNaN(parsed) ? 0 : parsed;
    onSave(val, numVal);
  };

  return (
    <input
      ref={inputRef}
      type={resolvedType}
      step={resolvedStep}
      min={resolvedMin}
      max={max}
      placeholder={placeholder}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onFocus={(e) => {
        if (autoSelect) {
          e.target.select();
        }
      }}
      onBlur={handleCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleCommit();
        } else if (e.key === "Escape") {
          onCancel?.();
        }
      }}
      className={className}
    />
  );
};

export default EditableInput;
export { EditableInput, EditableInput as EditableCellInput };
