import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { controlClassName } from "./input";

export type SelectOption = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { options: readonly SelectOption[] };

/** Native select for accessibility and mobile ergonomics, styled like other controls. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, className, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(controlClassName, "h-10 cursor-pointer appearance-none pr-9", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
});
