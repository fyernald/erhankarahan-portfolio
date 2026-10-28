import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-ink-soft shadow-sm",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-canvas",
  ghost: "text-body hover:bg-canvas hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
  subtle: "bg-mist text-ink hover:bg-mist-strong",
  link: "text-ink underline-offset-4 hover:underline px-0",
} as const;

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-7 text-sm uppercase tracking-[0.08em]",
  icon: "size-9",
  "icon-sm": "size-8",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button while an async action runs. */
  loading?: boolean;
  /** Render the child element (e.g. a Link) with button styles. */
  asChild?: boolean;
};

export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-control font-semibold",
    "transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, asChild = false, className, children, disabled, type, ...props },
  ref,
) {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      className={buttonClassName(variant, size, className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner className="size-4" />}
          {children}
        </>
      )}
    </Component>
  );
});
