"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isValidPhoneNumber, type Value } from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, fieldInputClass } from "@/components/ui/field";
import { PhoneField } from "@/components/ui/phone-field";
import { fill, type Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Real flow is Supabase `signInWithOtp` / `verifyOtp` (see
 * docs/accounts-and-dashboard.md). Static for now: any 6 digits verify
 * except this one, so the error state has something to demonstrate.
 */
const WRONG_CODE = "000000";
const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [verifying, setVerifying] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [mobile, setMobile] = useState<Value>();
  const [mobileError, setMobileError] = useState("");
  const [pending, setPending] = useState(false);
  const attemptedOtp = useRef<string | null>(null);

  useEffect(() => {
    if (step !== "otp" || resendSeconds === 0) return;
    const id = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendSeconds]);

  // Auto-verify: fires once per distinct 6-digit value, not on every render.
  useEffect(() => {
    if (step !== "otp" || otp.length !== OTP_LENGTH) return;
    if (attemptedOtp.current === otp) return;
    attemptedOtp.current = otp;
    let cancelled = false;
    setVerifying(true);
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (cancelled) return;
      setVerifying(false);
      if (otp === WRONG_CODE) {
        setOtpError(t.otp.codeError);
      } else {
        setOtpError("");
        setStep("profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, otp, t.otp.codeError]);

  function reset() {
    setStep("email");
    setEmail("");
    setEmailError("");
    setOtp("");
    setOtpError("");
    setResendSeconds(RESEND_SECONDS);
    setVerifying(false);
    attemptedOtp.current = null;
    setName("");
    setNameError("");
    setMobile(undefined);
    setMobileError("");
    setPending(false);
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("email");
    const trimmed = String(value ?? "").trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
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

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setOtpError("");
    attemptedOtp.current = null;
  }

  function handleResend() {
    if (resendSeconds > 0) return;
    setOtp("");
    setOtpError("");
    attemptedOtp.current = null;
    setResendSeconds(RESEND_SECONDS);
  }

  async function handleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const fullName = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    const nextNameError = fullName.length === 0 ? t.profile.nameError : "";
    const nextMobileError =
      !mobile || !isValidPhoneNumber(mobile) ? t.profile.mobileError : "";
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
      <DialogContent
        closeLabel={t.close}
        className="w-[min(26rem,calc(100vw-2rem))] overflow-hidden border-0 p-0 sm:flex sm:w-[min(46rem,calc(100vw-2rem))]"
      >
        <div className="relative hidden shrink-0 sm:block sm:w-80">
          <Image
            src="/events/salt-2.jpeg"
            alt=""
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 p-8 sm:mx-auto sm:max-w-sm sm:p-10">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} noValidate>
              <DialogTitle className="font-display text-xl font-semibold text-ink">
                {t.email.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-[0.9375rem] text-ink-muted">
                {t.email.subtitle}
              </DialogDescription>
              <div className="mt-8">
                <Field
                  variant="outline"
                  errorPlacement="outside"
                  label={t.email.emailLabel}
                  htmlFor="signin-email"
                  error={emailError}
                >
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder={t.email.emailPlaceholder}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={
                      emailError ? "signin-email-error" : undefined
                    }
                    className={fieldInputClass()}
                  />
                </Field>
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                {pending ? t.email.sending : t.email.continue}
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <div>
              <DialogTitle className="font-display text-xl font-semibold text-ink">
                {t.otp.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-[0.9375rem] text-ink-muted">
                {fill(t.otp.subtitle, { email })}
              </DialogDescription>
              <div className="mt-8">
                <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                  {t.otp.codeLabel}
                </p>
                <div className="mt-3">
                  <OtpInput
                    value={otp}
                    onChange={(next) => {
                      setOtp(next);
                      if (otpError) setOtpError("");
                    }}
                    error={Boolean(otpError)}
                  />
                </div>
                <p
                  aria-live="polite"
                  className={cn(
                    "mt-2 min-h-5 text-[0.8125rem]",
                    otpError ? "text-accent-deep" : "text-ink-muted",
                  )}
                  role={otpError ? "alert" : undefined}
                >
                  {otpError || (verifying ? t.otp.verifying : "")}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-[0.8125rem]">
                <button
                  type="button"
                  onClick={handleChangeEmail}
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
            </div>
          ) : null}

          {step === "profile" ? (
            <form onSubmit={handleProfileSubmit} noValidate>
              <DialogTitle className="font-display text-xl font-semibold text-ink">
                {t.profile.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-[0.9375rem] text-ink-muted">
                {t.profile.subtitle}
              </DialogDescription>
              <div className="mt-8 grid gap-3">
                <Field
                  variant="outline"
                  errorPlacement="outside"
                  label={t.profile.nameLabel}
                  htmlFor="signin-name"
                  error={nameError}
                >
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
                <PhoneField
                  label={t.profile.mobileLabel}
                  htmlFor="signin-mobile"
                  value={mobile}
                  onChange={(next) => {
                    setMobile(next);
                    if (mobileError) setMobileError("");
                  }}
                  placeholder={t.profile.mobilePlaceholder}
                  error={mobileError}
                />
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                {pending ? t.profile.finishing : t.profile.finish}
              </Button>
            </form>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Six single-digit boxes acting as one field, stretched to the same width as
 * the primary button below them rather than sitting at a fixed size. Typing
 * advances focus; a paste anywhere in the group (a code copied from Mail)
 * splits across all of them; a complete value verifies itself — there is no
 * submit button in this step.
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
    <div className="flex w-full gap-2" dir="ltr">
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
            onChange(pasted);
            refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
          }}
          className={cn(
            "h-14 min-w-0 flex-1 rounded-xl border text-center text-lg font-semibold text-ink transition-colors duration-150 focus:outline-none focus-visible:outline-none",
            error
              ? "border-accent-soft bg-blush"
              : "border-line-strong bg-canvas focus:border-ink focus:bg-paper",
          )}
        />
      ))}
    </div>
  );
}
