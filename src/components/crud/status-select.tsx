"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function StatusSelect({ value, onValueChange, options, placeholder = "Filter", className }: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className ?? "w-[140px]"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
