"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useReadingLogs } from "@/context/ReadingLogsContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Trash2, Search, X, BookOpen, Clock, Tag } from "lucide-react";

const ALLOWED_GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"];

function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayLocal = `${year}-${month}-${day}`;
  const todayUTC = now.toISOString().split("T")[0];

  return dateStr > todayLocal && dateStr > todayUTC;
}

export default function ReadingLogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    logs,
    summary,
    genreFilter,
    favoriteFilter,
    searchQuery,
    setGenreFilter,
    setFavoriteFilter,
    setSearchQuery,
    clearFilters,
    addSession,
    toggleFavorite,
    deleteSession,
  } = useReadingLogs();

  // Form states
  const [bookTitle, setBookTitle] = useState("");
  const [minutesRead, setMinutesRead] = useState("");
  const [genre, setGenre] = useState("");
  const [note, setNote] = useState("");
  const [readOn, setReadOn] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorBookTitle, setErrorBookTitle] = useState("");
  const [errorMinutes, setErrorMinutes] = useState("");
  const [errorGenre, setErrorGenre] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const [errorReadingLog, setErrorReadingLog] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  // Field validation helpers
  function validateBookTitle(val: string): string {
    if (!val || !val.trim()) return "Book title is required";
    if (val.trim().length > 80) return "Book title must be at most 80 characters";
    return "";
  }

  function validateMinutes(val: string): string {
    if (val === "" || val === undefined || val === null) return "Minutes read is required";
    const num = Number(val);
    if (isNaN(num)) return "Minutes read is required";
    if (!Number.isInteger(num) || num <= 0) return "Minutes read must be a positive number";
    return "";
  }

  function validateGenre(val: string): string {
    if (!val || !val.trim()) return "Please choose a genre";
    if (!ALLOWED_GENRES.includes(val)) return "Invalid genre";
    return "";
  }

  function validateDate(val: string): string {
    if (!val || !val.trim()) return "Date is required";
    if (isFutureDate(val.trim())) return "Date cannot be in the future";
    return "";
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBookTitle(val);
    if (hasSubmitted) {
      setErrorBookTitle(validateBookTitle(val));
      setErrorReadingLog("");
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinutesRead(val);
    if (hasSubmitted) {
      setErrorMinutes(validateMinutes(val));
      setErrorReadingLog("");
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGenre(val);
    if (hasSubmitted) {
      setErrorGenre(validateGenre(val));
      setErrorReadingLog("");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReadOn(val);
    if (hasSubmitted) {
      setErrorDate(validateDate(val));
      setErrorReadingLog("");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorReadingLog("");
    setSuccessMessage("");

    const errTitle = validateBookTitle(bookTitle);
    const errMins = validateMinutes(minutesRead);
    const errGen = validateGenre(genre);
    const errD = validateDate(readOn);

    setErrorBookTitle(errTitle);
    setErrorMinutes(errMins);
    setErrorGenre(errGen);
    setErrorDate(errD);

    if (errTitle || errMins || errGen || errD) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addSession({
        bookTitle: bookTitle.trim(),
        minutesRead: Number(minutesRead),
        genre,
        note: note.trim(),
        readOn: readOn.trim(),
      });

      if (res.error) {
        setErrorReadingLog(res.error);
      } else {
        setSuccessMessage("Reading session added");
        setBookTitle("");
        setMinutesRead("");
        setGenre("");
        setNote("");
        setReadOn("");
        setHasSubmitted(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="reading-logs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Reading Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track reading sessions, monitor your reading habit, and analyze progress.
          </p>
        </div>
      </div>

      {/* Main Grid: Responsive 375px mobile stacked, 1280px desktop two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Session Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Reading Session Form */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Add Reading Session</CardTitle>
              <CardDescription>Log a new reading activity into your journal</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                data-testid="reading-log-form"
                noValidate
                onSubmit={handleAddSubmit}
                className="space-y-4"
              >
                {errorReadingLog && (
                  <div
                    data-testid="error-reading-log"
                    className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800"
                  >
                    {errorReadingLog}
                  </div>
                )}

                {successMessage && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800 font-medium"
                  >
                    {successMessage}
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-book-title">Book Title</Label>
                  <Input
                    id="input-book-title"
                    type="text"
                    data-testid="input-book-title"
                    value={bookTitle}
                    onChange={handleTitleChange}
                    placeholder="e.g. Atomic Habits"
                  />
                  {errorBookTitle && (
                    <p data-testid="error-book-title" className="text-xs text-red-600 dark:text-red-400">
                      {errorBookTitle}
                    </p>
                  )}
                </div>

                {/* Minutes Read */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-minutes">Minutes Read</Label>
                  <Input
                    id="input-minutes"
                    type="number"
                    data-testid="input-minutes"
                    value={minutesRead}
                    onChange={handleMinutesChange}
                    placeholder="e.g. 45"
                    min="1"
                  />
                  {errorMinutes && (
                    <p data-testid="error-minutes" className="text-xs text-red-600 dark:text-red-400">
                      {errorMinutes}
                    </p>
                  )}
                </div>

                {/* Genre */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-genre">Genre</Label>
                  <select
                    id="input-genre"
                    data-testid="input-genre"
                    value={genre}
                    onChange={handleGenreChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
                  >
                    <option value="">Choose genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Biography">Biography</option>
                    <option value="Other">Other</option>
                  </select>
                  {errorGenre && (
                    <p data-testid="error-genre" className="text-xs text-red-600 dark:text-red-400">
                      {errorGenre}
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-note">Note (optional)</Label>
                  <Input
                    id="input-note"
                    type="text"
                    data-testid="input-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Chapter 3, key takeaways..."
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-date">Date</Label>
                  <Input
                    id="input-date"
                    type="date"
                    data-testid="input-date"
                    value={readOn}
                    onChange={handleDateChange}
                  />
                  {errorDate && (
                    <p data-testid="error-date" className="text-xs text-red-600 dark:text-red-400">
                      {errorDate}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-reading-log"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding Session..." : "Add Reading Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reading Summary Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Reading Summary</CardTitle>
              <CardDescription>Live stats of the currently filtered sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sessions</div>
                  <div data-testid="reading-log-count" className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {summary.count}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Favorites</div>
                  <div data-testid="favorite-count" className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                    {summary.favoriteCount}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">Total Minutes</div>
                  <div data-testid="total-minutes" className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                    {summary.totalMinutes}
                  </div>
                </div>
              </div>

              {/* Genre Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Genre Breakdown
                </h4>
                <div data-testid="genre-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No genre data for current filter.</p>
                  ) : (
                    summary.breakdown.map((row) => (
                      <div
                        key={row.genre}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-sm py-1.5 px-3 bg-slate-50 dark:bg-slate-900 rounded-md"
                      >
                        <span data-testid="breakdown-name" className="font-medium text-slate-800 dark:text-slate-200">
                          {row.genre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            <span data-testid="breakdown-count">{row.count}</span> {row.count === 1 ? "session" : "sessions"}
                          </span>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <span data-testid="breakdown-total">{row.total}</span> mins
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters and Sessions List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter Controls Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by book title or note..."
                    className="pl-8"
                  />
                </div>

                {/* Genre Filter */}
                <div className="w-full sm:w-44">
                  <select
                    data-testid="filter-genre"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
                  >
                    <option value="">All Genres</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Biography">Biography</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {/* Favorite Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    data-testid="filter-favorite"
                    checked={favoriteFilter}
                    onChange={(e) => setFavoriteFilter(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Favorites only</span>
                </label>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="btn-clear-filters"
                  onClick={clearFilters}
                  className="gap-1 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reading Sessions List */}
          {logs.length === 0 ? (
            <div
              data-testid="reading-logs-empty"
              className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500"
            >
              <BookOpen className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                No reading sessions found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Add a new session using the form or reset the active search filters to view your logs.
              </p>
            </div>
          ) : (
            <div data-testid="reading-log-list" className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  data-testid="reading-log-item"
                  className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        data-testid="reading-log-title"
                        className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate"
                      >
                        {log.bookTitle}
                      </h3>
                      <span
                        data-testid="reading-log-genre"
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        <Tag className="h-3 w-3" />
                        {log.genre}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span data-testid="reading-log-minutes">{log.minutesRead}</span> mins
                      </span>
                      <span>•</span>
                      <span data-testid="reading-log-date">{log.readOn}</span>
                    </div>

                    {log.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        &quot;{log.note}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      data-testid="btn-toggle-favorite"
                      aria-pressed={log.favorite ? "true" : "false"}
                      onClick={() => toggleFavorite(log.id, log.favorite)}
                      className={`p-2 rounded-lg border transition-colors ${
                        log.favorite
                          ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50"
                          : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                      }`}
                      title={log.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`h-4 w-4 ${log.favorite ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>

                    <Button
                      variant="outline"
                      size="icon"
                      data-testid="btn-delete-reading-log"
                      onClick={() => deleteSession(log.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-slate-200 dark:border-slate-800"
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

