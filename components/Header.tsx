"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { BookOpen, LogOut, Bookmark } from "lucide-react";

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b-2 border-stone-800 bg-[#fffdf9] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <div className="h-9 w-9 rounded-lg bg-amber-500 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] flex items-center justify-center text-white group-hover:bg-amber-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-stone-900 pixel-font flex items-center gap-1">
            ReadLog
            <span className="text-xs bg-amber-200 text-amber-900 border border-stone-800 px-1 py-0.2 rounded font-mono font-normal">
              v1.0
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] max-w-[140px] sm:max-w-none">
                <Bookmark className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span
                  data-testid="user-email"
                  className="text-xs font-mono font-bold text-stone-800 truncate"
                >
                  {user.email}
                </span>
              </div>
              <Link
                href="/reading-logs"
                data-testid="link-reading-logs"
                className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 underline decoration-2 underline-offset-4 decoration-amber-500"
              >
                Reading Logs
              </Link>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={logout}
                className="gap-1.5 text-xs h-8"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                data-testid="btn-login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Register
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
