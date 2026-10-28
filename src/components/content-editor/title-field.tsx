"use client";

type TitleFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string[];
};

/** Large auto-growing title rendered in the display face, previewing the public look. */
export function TitleField({ value, onChange, placeholder, error }: TitleFieldProps) {
  return (
    <div className="border-b border-line px-5 pt-8 pb-4 sm:px-10 lg:px-14">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={1}
        aria-label="Title"
        aria-invalid={Boolean(error)}
        className="field-sizing-content w-full resize-none bg-transparent font-display text-3xl leading-tight font-bold text-ink outline-none placeholder:text-line-strong sm:text-4xl"
      />
      {error && <p className="mt-1 text-xs font-medium text-danger">{error[0]}</p>}
    </div>
  );
}
