"use client";

import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";
import { fill, type Dictionary } from "@/lib/i18n";
import { HOME_BASE_OPTIONS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Real flow is Supabase `signInWithOtp` / `verifyOtp` (see
 * docs/accounts-and-dashboard.md). Static for now: any 6 digits verify
 * except this one, so the error state has something to demonstrate.
 */
const WRONG_CODE = "000000";
const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

type Step = "email" | "otp" | "profile";

export function SignInModal({
  t,
  onSignedIn,
}: {
  t: Dictionary["auth"];
  onSignedIn: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (step !== "otp" || resendSeconds === 0) return;
    const id = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendSeconds]);

  function reset() {
    setStep("email");
    setEmail("");
    setEmailError("");
    setOtp("");
    setOtpError("");
    setResendSeconds(RESEND_SECONDS);
    setName("");
    setNameError("");
    setMobileError("");
    setPending(false);
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("email");
    const trimmed = String(value ?? "").trim();
    if (!trimmed.includes("@")) {
      setEmailError(t.email.emailError);
      return;
    }
    setEmailError("");
    setEmail(trimmed);
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPending(false);
    setStep("otp");
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== OTP_LENGTH) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPending(false);
    if (otp === WRONG_CODE) {
      setOtpError(t.otp.codeError);
      return;
    }
    setOtpError("");
    setStep("profile");
  }

  async function handleResend() {
    if (resendSeconds > 0) return;
    setOtp("");
    setOtpError("");
    setResendSeconds(RESEND_SECONDS);
  }

  async function handleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("name") ?? "").trim();
    const mobile = String(data.get("mobile") ?? "").trim();
    const nextNameError = fullName.length === 0 ? t.profile.nameError : "";
    const nextMobileError = mobile.length === 0 ? t.profile.mobileError : "";
    setNameError(nextNameError);
    setMobileError(nextMobileError);
    if (nextNameError || nextMobileError) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPending(false);
    onSignedIn(fullName);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">{t.email.title}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.close}>
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} noValidate>
            <DialogTitle className="font-display text-xl font-semibold text-ink">
              {t.email.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[0.9375rem] text-ink-muted">
              {t.email.subtitle}
            </DialogDescription>
            <div className="mt-5 rounded-card border border-line bg-canvas p-2">
              <Field label={t.email.emailLabel} htmlFor="signin-email" error={emailError}>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={t.email.emailPlaceholder}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "signin-email-error" : undefined}
                  className={fieldInputClass()}
                />
              </Field>
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full">
              {pending ? t.email.sending : t.email.continue}
            </Button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form onSubmit={handleOtpSubmit} noValidate>
            <DialogTitle className="font-display text-xl font-semibold text-ink">
              {t.otp.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[0.9375rem] text-ink-muted">
              {fill(t.otp.subtitle, { email })}
            </DialogDescription>
            <div className="mt-5">
              <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                {t.otp.codeLabel}
              </p>
              <div className="mt-2">
                <OtpInput
                  value={otp}
                  onChange={(next) => {
                    setOtp(next);
                    if (otpError) setOtpError("");
                  }}
                  error={Boolean(otpError)}
                />
              </div>
              {otpError ? (
                <p role="alert" className="mt-2 text-[0.8125rem] text-accent-deep">
                  {otpError}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              disabled={otp.length !== OTP_LENGTH}
            >
              {pending ? t.otp.verifying : t.otp.verify}
            </Button>
            <div className="mt-4 flex items-center justify-between text-[0.8125rem]">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {t.otp.changeEmail}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0}
                className="text-accent-deep underline-offset-4 hover:underline disabled:text-ink-subtle disabled:no-underline"
              >
                {resendSeconds > 0
                  ? fill(t.otp.resendIn, { seconds: resendSeconds })
                  : t.otp.resend}
              </button>
            </div>
          </form>
        ) : null}

        {step === "profile" ? (
          <form onSubmit={handleProfileSubmit} noValidate>
            <DialogTitle className="font-display text-xl font-semibold text-ink">
              {t.profile.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[0.9375rem] text-ink-muted">
              {t.profile.subtitle}
            </DialogDescription>
            <div className="mt-5 grid gap-1 rounded-card border border-line bg-canvas p-2">
              <Field label={t.profile.nameLabel} htmlFor="signin-name" error={nameError}>
                <input
                  id="signin-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder={t.profile.namePlaceholder}
                  aria-invalid={nameError ? true : undefined}
                  className={fieldInputClass()}
                />
              </Field>
              <Field label={t.profile.mobileLabel} htmlFor="signin-mobile" error={mobileError}>
                <input
                  id="signin-mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  onChange={() => mobileError && setMobileError("")}
                  placeholder={t.profile.mobilePlaceholder}
                  aria-invalid={mobileError ? true : undefined}
                  className={fieldInputClass()}
                />
              </Field>
              <Field label={t.profile.homeBaseLabel} htmlFor="signin-home-base">
                <select
                  id="signin-home-base"
                  name="homeBase"
                  defaultValue={HOME_BASE_OPTIONS[0]}
                  className={fieldInputClass("cursor-pointer")}
                >
                  {HOME_BASE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t.homeBase[option]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full">
              {pending ? t.profile.finishing : t.profile.finish}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Six single-digit boxes acting as one field. Typing advances focus; a paste
 * anywhere in the group (a code copied from Mail) splits across all of them.
 */
function OtpInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (next: string) => void;
  error: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, OTP_LENGTH));
  }

  return (
    <div className="flex gap-2" dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            const char = event.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, char);
            if (char && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, OTP_LENGTH);
            if (!pasted) return;
            event.preventDefault();
            onChange(pasted.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH).trimEnd());
            refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
          }}
          className={cn(
            "h-12 w-10 rounded-xl border text-center text-lg font-semibold text-ink transition-colors duration-150 focus:outline-none focus-visible:outline-none",
            error
              ? "border-accent-soft bg-blush"
              : "border-line-strong bg-canvas focus:border-ink focus:bg-paper",
          )}
        />
      ))}
    </div>
  );
}
