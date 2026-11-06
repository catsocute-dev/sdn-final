"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useReadingLogs } from "@/context/ReadingLogsContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Trash2, Search, X, BookOpen, Clock, Calendar, Sparkles, Library } from "lucide-react";

const ALLOWED_GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"];

const GENRE_BADGE_COLORS: Record<string, string> = {
  Fiction: "bg-amber-100 text-amber-900 border-amber-900",
  "Non-Fiction": "bg-emerald-100 text-emerald-900 border-emerald-900",
  "Sci-Fi": "bg-sky-100 text-sky-900 border-sky-900",
  Biography: "bg-purple-100 text-purple-900 border-purple-900",
  Other: "bg-stone-100 text-stone-800 border-stone-800",
};

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
      {/* Page Title & Pixel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-stone-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-400 border-2 border-stone-800 shadow-[3px_3px_0px_#292524] flex items-center justify-center text-stone-900 shrink-0">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 pixel-font">
              Reading Log
            </h1>
            <p className="text-xs sm:text-sm font-medium text-stone-600 mt-0.5">
              Personal journal to track sessions, chapters, and mindful reading moments.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive layout: 375px mobile stacked, 1280px desktop two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Session Form & Reading Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Reading Session Form */}
          <Card className="shadow-[5px_5px_0px_#292524] border-3 border-stone-800 bg-[#fffdfa]">
            <CardHeader className="pb-3 border-b-2 border-stone-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black pixel-font flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  Add Reading Session
                </CardTitle>
                <span className="text-[10px] font-mono font-bold bg-amber-100 border border-stone-800 px-1.5 py-0.5 rounded">
                  NEW LOG
                </span>
              </div>
              <CardDescription className="text-xs text-stone-500">
                Log a new reading session into your personal journal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form
                data-testid="reading-log-form"
                noValidate
                onSubmit={handleAddSubmit}
                className="space-y-4"
              >
                {errorReadingLog && (
                  <div
                    data-testid="error-reading-log"
                    className="p-3 text-xs font-bold text-red-700 bg-red-100 rounded-lg border-2 border-red-500 shadow-[2px_2px_0px_#ef4444]"
                  >
                    {errorReadingLog}
                  </div>
                )}

                {successMessage && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg border-2 border-emerald-600 shadow-[2px_2px_0px_#059669] flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Reading session added</span>
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1">
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
                    <p data-testid="error-book-title" className="text-xs font-bold text-red-600 pt-0.5">
                      {errorBookTitle}
                    </p>
                  )}
                </div>

                {/* Minutes Read */}
                <div className="space-y-1">
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
                    <p data-testid="error-minutes" className="text-xs font-bold text-red-600 pt-0.5">
                      {errorMinutes}
                    </p>
                  )}
                </div>

                {/* Genre */}
                <div className="space-y-1">
                  <Label htmlFor="input-genre">Genre</Label>
                  <select
                    id="input-genre"
                    data-testid="input-genre"
                    value={genre}
                    onChange={handleGenreChange}
                    className="flex h-10 w-full rounded-lg border-2 border-stone-800 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 shadow-[2px_2px_0px_#292524] transition-all focus-visible:outline-none focus-visible:bg-amber-50/60 focus-visible:shadow-[3px_3px_0px_#292524]"
                  >
                    <option value="">Choose genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Biography">Biography</option>
                    <option value="Other">Other</option>
                  </select>
                  {errorGenre && (
                    <p data-testid="error-genre" className="text-xs font-bold text-red-600 pt-0.5">
                      {errorGenre}
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
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
                <div className="space-y-1">
                  <Label htmlFor="input-date">Date</Label>
                  <Input
                    id="input-date"
                    type="date"
                    data-testid="input-date"
                    value={readOn}
                    onChange={handleDateChange}
                  />
                  {errorDate && (
                    <p data-testid="error-date" className="text-xs font-bold text-red-600 pt-0.5">
                      {errorDate}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-reading-log"
                  className="w-full mt-2 h-11 text-base shadow-[3px_3px_0px_#292524]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding Session..." : "Add Reading Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reading Summary Card */}
          <Card className="shadow-[5px_5px_0px_#292524] border-3 border-stone-800 bg-[#fffdfa]">
            <CardHeader className="pb-3 border-b-2 border-stone-200">
              <CardTitle className="text-lg font-black pixel-font flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-700" />
                Reading Summary
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                Live stats of the currently filtered sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-amber-100 rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Sessions
                  </div>
                  <div data-testid="reading-log-count" className="text-2xl font-black text-stone-900 mt-1 pixel-font">
                    {summary.count}
                  </div>
                </div>

                <div className="p-2.5 bg-rose-100 rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
                    Favorites
                  </div>
                  <div data-testid="favorite-count" className="text-2xl font-black text-rose-900 mt-1 pixel-font">
                    {summary.favoriteCount}
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-100 rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    Minutes
                  </div>
                  <div data-testid="total-minutes" className="text-2xl font-black text-emerald-900 mt-1 pixel-font">
                    {summary.totalMinutes}
                  </div>
                </div>
              </div>

              {/* Genre Breakdown */}
              <div className="space-y-2 pt-2 border-t-2 border-stone-200">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Genre Breakdown
                </h4>
                <div data-testid="genre-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-1 font-mono">
                      No genre data for current filter.
                    </p>
                  ) : (
                    summary.breakdown.map((row) => (
                      <div
                        key={row.genre}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-xs py-2 px-3 bg-white rounded-lg border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524]"
                      >
                        <span data-testid="breakdown-name" className="font-bold text-stone-900">
                          {row.genre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-stone-500 font-mono">
                            <span data-testid="breakdown-count">{row.count}</span> {row.count === 1 ? "session" : "sessions"}
                          </span>
                          <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-stone-800 font-mono">
                            <span data-testid="breakdown-total">{row.total}</span>m
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
          <Card className="shadow-[4px_4px_0px_#292524] border-2 border-stone-800 bg-[#fffdfa]">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    type="text"
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by book title or note..."
                    className="pl-9"
                  />
                </div>

                {/* Genre Filter */}
                <div className="w-full sm:w-44">
                  <select
                    data-testid="filter-genre"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex h-10 w-full rounded-lg border-2 border-stone-800 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 shadow-[2px_2px_0px_#292524] transition-all focus-visible:outline-none focus-visible:bg-amber-50/60 focus-visible:shadow-[3px_3px_0px_#292524]"
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
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 select-none">
                  <input
                    type="checkbox"
                    data-testid="filter-favorite"
                    checked={favoriteFilter}
                    onChange={(e) => setFavoriteFilter(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-stone-800 text-amber-600 focus:ring-0 cursor-pointer accent-amber-600"
                  />
                  <span>Favorites only</span>
                </label>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="btn-clear-filters"
                  onClick={clearFilters}
                  className="gap-1 text-xs h-8 shadow-[2px_2px_0px_#292524]"
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
              className="flex flex-col items-center justify-center p-12 text-center bg-[#fffdfa] rounded-xl border-3 border-dashed border-stone-400 text-stone-500 shadow-[3px_3px_0px_#292524]"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-100 border-2 border-stone-800 shadow-[2px_2px_0px_#292524] flex items-center justify-center text-amber-800 mb-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-stone-800 pixel-font">
                No reading sessions found
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm font-medium">
                Add a new session using the form or reset the active search filters to view your logs.
              </p>
            </div>
          ) : (
            <div data-testid="reading-log-list" className="space-y-3.5">
              {logs.map((log) => {
                const badgeColor = GENRE_BADGE_COLORS[log.genre] || "bg-stone-100 text-stone-800 border-stone-800";
                return (
                  <div
                    key={log.id}
                    data-testid="reading-log-item"
                    className="p-4 bg-white rounded-xl border-2 border-stone-800 shadow-[3.5px_3.5px_0px_#292524] hover:shadow-[5px_5px_0px_#292524] hover:translate-y-[-1px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          data-testid="reading-log-title"
                          className="text-base font-bold text-stone-900 truncate"
                        >
                          {log.bookTitle}
                        </h3>
                        <span
                          data-testid="reading-log-genre"
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-mono font-bold ${badgeColor}`}
                        >
                          {log.genre}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono font-medium text-stone-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          <span data-testid="reading-log-minutes" className="font-bold text-stone-900">
                            {log.minutesRead}
                          </span>{" "}
                          mins
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-stone-500" />
                          <span data-testid="reading-log-date">{log.readOn}</span>
                        </span>
                      </div>

                      {log.note && (
                        <p className="text-xs text-stone-700 bg-amber-50/70 border border-stone-300 p-2 rounded-lg font-medium">
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
                        className={`p-2 rounded-lg border-2 border-stone-800 transition-all cursor-pointer shadow-[2px_2px_0px_#292524] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                          log.favorite
                            ? "bg-amber-300 text-amber-950 hover:bg-amber-400"
                            : "bg-white text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                        }`}
                        title={log.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={`h-4 w-4 ${log.favorite ? "fill-amber-500 text-amber-900" : ""}`} />
                      </button>

                      <Button
                        variant="destructive"
                        size="icon"
                        data-testid="btn-delete-reading-log"
                        onClick={() => deleteSession(log.id)}
                        className="h-8 w-8 text-white shadow-[2px_2px_0px_#292524]"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
