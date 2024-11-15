import { Input, type InputProps } from "@/components/ui/input";
import debounce from "lodash.debounce";
import React from "react";
type DebouncedInputProps = {
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
} & InputProps;

export const DebouncedInput = ({ debounceMs = 500, onDebouncedChange, ...props }: DebouncedInputProps) => {
  const [value, setValue] = React.useState(props.defaultValue ?? "");
  const debouncedSetValue = React.useMemo(() => {
    return debounce((value: string) => {
      onDebouncedChange?.(value);
      setValue(value);
    }, debounceMs);
  }, [debounceMs, onDebouncedChange]);
  return (
    <Input
      {...props}
      defaultValue={value}
      onChange={(e) => {
        debouncedSetValue(e.target.value);
      }}
    />
  );
}