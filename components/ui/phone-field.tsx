"use client";

import "react-phone-number-input/style.css";

import PhoneInput, { type Country, type Value } from "react-phone-number-input";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One bordered pill, matching reui's reference: the flag sits inside the
 * same border as the number input, not in a border of its own. `limitMaxLength`
 * is what enforces "based on the country we should limit the digits entered":
 * it caps input at that country's real max significant-number length, from
 * libphonenumber-js's own metadata.
 */
export function PhoneField({
  label,
  htmlFor,
  value,
  onChange,
  defaultCountry = "AE",
  placeholder,
  error,
}: {
  label: string;
  htmlFor: string;
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  defaultCountry?: Country;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase"
      >
        {label}
      </label>
      <div
        className={cn(
          "mt-1.5 flex h-12 items-center gap-2 rounded-2xl border pl-3 pr-4 transition-colors duration-200 focus-within:border-ink",
          error ? "border-accent-soft bg-blush" : "border-line-strong",
        )}
      >
        <PhoneInput
          id={htmlFor}
          international
          limitMaxLength
          defaultCountry={defaultCountry}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${htmlFor}-error` : undefined}
          countrySelectProps={{ "aria-label": label }}
          style={
            {
              "--PhoneInputCountryFlag-borderWidth": 0,
              "--PhoneInputCountryFlag-height": "0.85em",
            } as React.CSSProperties
          }
          numberInputProps={{
            className:
              "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.9375rem] text-ink placeholder:text-ink-muted focus:outline-none",
          }}
          className="flex w-full items-center [&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:mr-1 [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon]:rounded-[3px]"
        />
      </div>
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 px-4 text-[0.8125rem] text-accent-deep"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
