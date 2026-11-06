"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-slate-100 hover:opacity-90">
          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>ReadLog</span>
        </Link>

        <nav className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <span
                data-testid="user-email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {user.email}
              </span>
              <Link
                href="/reading-logs"
                data-testid="link-reading-logs"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Reading Logs
              </Link>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={logout}
                className="gap-1.5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                data-testid="btn-login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className={buttonVariants({ size: "sm" })}
              >
                Register
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
