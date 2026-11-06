"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your email and password to register for ReadLog</CardDescription>
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
                className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800"
              >
                {authError}
              </div>
            )}

            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800 font-medium"
              >
                {successMessage}
              </div>
            )}

            <div className="space-y-1.5">
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
                <p data-testid="error-email" className="text-xs text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
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
                <p data-testid="error-password" className="text-xs text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {confirmPasswordError && (
                <p
                  data-testid="error-confirm-password"
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

