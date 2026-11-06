import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, BarChart3, Tag } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-2xl mb-2">
          <BookOpen className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h1
          data-testid="home-title"
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
        >
          ReadLog
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Your personal reading companion. Track daily reading sessions, log minutes read, categorize by genre, star favorites, and gain deep insights into your reading habits.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className={buttonVariants({ size: "lg", className: "h-11 px-8 text-base" })}
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-8 text-base" })}
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>Log every session</CardTitle>
            <CardDescription>
              Record book titles, duration in minutes, completion dates, and personal session notes with ease.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
              <Tag className="h-5 w-5" />
            </div>
            <CardTitle>Sort by genre</CardTitle>
            <CardDescription>
              Organize your reading library across Fiction, Non-Fiction, Sci-Fi, Biography, and Other categories.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <CardTitle>See minutes read</CardTitle>
            <CardDescription>
              Visualize real-time summary statistics, favorite counts, and breakdown of total minutes read per genre.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
