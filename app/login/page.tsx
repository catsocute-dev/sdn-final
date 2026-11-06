"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmailField(val: string): string {
    if (!val || !val.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(val.trim())) return "Please enter a valid email address";
    return "";
  }

  function validatePasswordField(val: string): string {
    if (!val) return "Password is required";
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
      setAuthError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");

    const errEmail = validateEmailField(email);
    const errPassword = validatePasswordField(password);

    setEmailError(errEmail);
    setPasswordError(errPassword);

    if (errEmail || errPassword) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid email or password");
      } else {
        setUser(data);
        router.push("/reading-logs");
        router.refresh();
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-stone-600 font-medium text-xs">
            Open your reading journal and continue your streak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            data-testid="login-form"
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

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
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
                data-testid="login-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs font-bold text-red-600 pt-0.5">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full mt-2 h-11 text-base shadow-[3px_3px_0px_#292524]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t-2 border-stone-200 pt-4">
          <p className="text-xs font-bold text-stone-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-amber-700 hover:text-amber-900 underline decoration-2 underline-offset-2">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
