"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Sparkles } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmailField(val: string): string {
    if (!val || !val.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(val.trim())) return "Please enter a valid email address";
    return "";
  }

  function validatePasswordField(val: string): string {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  }

  function validateConfirmPasswordField(val: string, currentPassword: string): string {
    if (!val) return "Confirm password is required";
    if (val !== currentPassword) return "Passwords do not match";
    return "";
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasSubmitted) {
      setEmailError(validateEmailField(val));
      setAuthError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (hasSubmitted) {
      setPasswordError(validatePasswordField(val));
      if (confirmPassword) {
        setConfirmPasswordError(validateConfirmPasswordField(confirmPassword, val));
      }
      setAuthError("");
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (hasSubmitted) {
      setConfirmPasswordError(validateConfirmPasswordField(val, password));
      setAuthError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");
    setSuccessMessage("");

    const errEmail = validateEmailField(email);
    const errPassword = validatePasswordField(password);
    const errConfirm = validateConfirmPasswordField(confirmPassword, password);

    setEmailError(errEmail);
    setPasswordError(errPassword);
    setConfirmPasswordError(errConfirm);

    if (errEmail || errPassword || errConfirm) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
      } else {
        setSuccessMessage("Registration successful");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setHasSubmitted(false);
      }
    } catch {
      setAuthError("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <Card className="w-full max-w-md shadow-[6px_6px_0px_#292524] border-3 border-stone-800 bg-[#fffdfa]">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-amber-400 border-2 border-stone-800 shadow-[3px_3px_0px_#292524] flex items-center justify-center text-stone-900 mb-1">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black pixel-font text-stone-900">
            Create Account
          </CardTitle>
          <CardDescription className="text-stone-600 font-medium text-xs">
            Begin your cozy personal reading log journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            data-testid="register-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {authError && (
              <div
                data-testid="error-auth"
                className="p-3 text-xs font-bold text-red-700 bg-red-100 rounded-lg border-2 border-red-500 shadow-[2px_2px_0px_#ef4444]"
              >
                {authError}
              </div>
            )}

            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg border-2 border-emerald-600 shadow-[2px_2px_0px_#059669] flex items-center gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="register-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="reader@example.com"
                autoComplete="email"
              />
              {emailError && (
                <p data-testid="error-email" className="text-xs font-bold text-red-600 pt-0.5">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="register-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs font-bold text-red-600 pt-0.5">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Re-type your password"
                autoComplete="new-password"
              />
              {confirmPasswordError && (
                <p
                  data-testid="error-confirm-password"
                  className="text-xs font-bold text-red-600 pt-0.5"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full mt-2 h-11 text-base shadow-[3px_3px_0px_#292524]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t-2 border-stone-200 pt-4">
          <p className="text-xs font-bold text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-700 hover:text-amber-900 underline decoration-2 underline-offset-2">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
