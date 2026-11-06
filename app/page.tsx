import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, BarChart3, BookmarkCheck, Sparkles, Coffee } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] text-xs font-bold text-amber-900 mb-6">
        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        <span>A Cozy Pixel Reading Companion</span>
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-amber-400 border-3 border-stone-900 shadow-[4px_4px_0px_#292524] rounded-2xl mb-1 rotate-[-2deg] hover:rotate-0 transition-transform">
          <BookOpen className="h-12 w-12 text-stone-900" />
        </div>

        <h1
          data-testid="home-title"
          className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900 pixel-font drop-shadow-sm"
        >
          ReadLog
        </h1>

        <p className="text-base sm:text-lg text-stone-700 max-w-2xl mx-auto font-medium leading-relaxed bg-[#fffdfa] p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#292524]">
          Pour yourself a warm cup of coffee and settle in. Track every chapter, record minutes read, organize favorite stories by genre, and watch your reading journey grow day by day.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className={buttonVariants({
              variant: "default",
              size: "lg",
              className: "h-12 px-8 text-base shadow-[4px_4px_0px_#292524] hover:shadow-[5px_5px_0px_#292524]",
            })}
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-12 px-8 text-base shadow-[4px_4px_0px_#292524] hover:shadow-[5px_5px_0px_#292524]",
            })}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* 3 Pixel Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16">
        <Card className="hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#292524] transition-all bg-amber-50/50">
          <CardHeader>
            <div className="h-11 w-11 rounded-lg bg-orange-200 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] flex items-center justify-center text-stone-900 mb-2">
              <BookOpen className="h-6 w-6 text-orange-800" />
            </div>
            <CardTitle className="text-lg">Log every session</CardTitle>
            <CardDescription className="text-stone-600">
              Record book titles, duration in minutes, completion dates, and personal session notes with ease.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#292524] transition-all bg-emerald-50/50">
          <CardHeader>
            <div className="h-11 w-11 rounded-lg bg-emerald-200 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] flex items-center justify-center text-stone-900 mb-2">
              <BookmarkCheck className="h-6 w-6 text-emerald-800" />
            </div>
            <CardTitle className="text-lg">Sort by genre</CardTitle>
            <CardDescription className="text-stone-600">
              Organize your reading library across Fiction, Non-Fiction, Sci-Fi, Biography, and Other categories.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#292524] transition-all bg-sky-50/50">
          <CardHeader>
            <div className="h-11 w-11 rounded-lg bg-sky-200 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] flex items-center justify-center text-stone-900 mb-2">
              <BarChart3 className="h-6 w-6 text-sky-800" />
            </div>
            <CardTitle className="text-lg">See minutes read</CardTitle>
            <CardDescription className="text-stone-600">
              Visualize real-time summary statistics, favorite counts, and breakdown of total minutes read per genre.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Footer cozy quote */}
      <div className="mt-16 text-center text-xs font-mono text-stone-500 flex items-center gap-2">
        <Coffee className="h-4 w-4 text-amber-700" />
        <span>Made for book lovers who cherish quiet reading moments.</span>
      </div>
    </div>
  );
}
