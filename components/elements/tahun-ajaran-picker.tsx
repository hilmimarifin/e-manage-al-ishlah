import React from "react";
import Select from "@/components/elements/select"; // Adjust path as needed

export interface TahunAjaranProps {
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  startYear?: number;
  endYear?: number;
  yearsCount?: number;
}

// Generate academic year options
const generateTahunAjaranOptions = (
  startYear?: number,
  endYear?: number,
  yearsCount?: number
) => {
  const currentYear = new Date().getFullYear();
  const defaultStartYear = startYear || currentYear - 10;
  const defaultEndYear = endYear || currentYear + 10;
  const totalYears = yearsCount || defaultEndYear - defaultStartYear;

  const options = [];

  for (let i = 0; i < totalYears; i++) {
    const year = defaultStartYear + i;
    const nextYear = year + 1;
    const academicYear = `${year}/${nextYear}`;

    options.push({
      value: academicYear,
      label: academicYear,
    });
  }

  return options;
};

export const TahunAjaran: React.FC<TahunAjaranProps> = ({
  value,
  onValueChange,
  error,
  label = "Tahun Ajaran",
  placeholder = "Pilih tahun ajaran",
  required = false,
  disabled = false,
  className = "",
  id = "tahun-ajaran",
  name = "tahunAjaran",
  startYear,
  endYear,
  yearsCount,
}) => {
  const options = generateTahunAjaranOptions(startYear, endYear, yearsCount);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      error={error}
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      id={id}
      name={name}
    />
  );
};

export default TahunAjaran;
