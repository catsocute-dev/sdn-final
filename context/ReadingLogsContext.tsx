"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface ReadingLogItem {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string;
  favorite: boolean;
  readOn: string;
  createdAt: string;
}

export interface SummaryBreakdown {
  genre: string;
  count: number;
  total: number;
}

export interface SummaryData {
  count: number;
  favoriteCount: number;
  totalMinutes: number;
  breakdown: SummaryBreakdown[];
}

interface ReadingLogsContextType {
  logs: ReadingLogItem[];
  summary: SummaryData;
  loading: boolean;
  genreFilter: string;
  favoriteFilter: boolean;
  searchQuery: string;
  setGenreFilter: (genre: string) => void;
  setFavoriteFilter: (fav: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  fetchData: () => Promise<void>;
  addSession: (data: {
    bookTitle: string;
    minutesRead: number;
    genre: string;
    note?: string;
    readOn: string;
  }) => Promise<{ error?: string; log?: ReadingLogItem }>;
  toggleFavorite: (id: string, currentFavorite: boolean) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  reset: () => void;
}

const defaultSummary: SummaryData = {
  count: 0,
  favoriteCount: 0,
  totalMinutes: 0,
  breakdown: [],
};

const ReadingLogsContext = createContext<ReadingLogsContextType | undefined>(undefined);

export function ReadingLogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ReadingLogItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>(defaultSummary);
  const [loading, setLoading] = useState(false);

  const [genreFilter, setGenreFilter] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const reset = useCallback(() => {
    setLogs([]);
    setSummary(defaultSummary);
    setGenreFilter("");
    setFavoriteFilter(false);
    setSearchQuery("");
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      reset();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (genreFilter) params.set("genre", genreFilter);
      if (favoriteFilter) params.set("favorite", "true");
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const [logsRes, summaryRes] = await Promise.all([
        fetch(`/api/reading-logs${queryStr}`),
        fetch(`/api/reading-logs/summary${queryStr}`),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (err) {
      console.error("Error fetching reading logs:", err);
    } finally {
      setLoading(false);
    }
  }, [user, genreFilter, favoriteFilter, searchQuery, reset]);

  // When user changes or filters change, re-fetch
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      reset();
    }
  }, [user, genreFilter, favoriteFilter, searchQuery, fetchData, reset]);

  const clearFilters = useCallback(() => {
    setGenreFilter("");
    setFavoriteFilter(false);
    setSearchQuery("");
  }, []);

  const addSession = useCallback(
    async (data: {
      bookTitle: string;
      minutesRead: number;
      genre: string;
      note?: string;
      readOn: string;
    }) => {
      try {
        const res = await fetch("/api/reading-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        if (!res.ok) {
          return { error: result.error || "Failed to add reading session" };
        }

        // Re-fetch to update list and summary with current filters
        await fetchData();
        return { log: result };
      } catch (err) {
        console.error("Add session error:", err);
        return { error: "An unexpected error occurred" };
      }
    },
    [fetchData]
  );

  const toggleFavorite = useCallback(
    async (id: string, currentFavorite: boolean) => {
      try {
        const res = await fetch(`/api/reading-logs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorite: !currentFavorite }),
        });
        if (res.ok) {
          await fetchData();
        }
      } catch (err) {
        console.error("Toggle favorite error:", err);
      }
    },
    [fetchData]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/reading-logs/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await fetchData();
        }
      } catch (err) {
        console.error("Delete session error:", err);
      }
    },
    [fetchData]
  );

  return (
    <ReadingLogsContext.Provider
      value={{
        logs,
        summary,
        loading,
        genreFilter,
        favoriteFilter,
        searchQuery,
        setGenreFilter,
        setFavoriteFilter,
        setSearchQuery,
        clearFilters,
        fetchData,
        addSession,
        toggleFavorite,
        deleteSession,
        reset,
      }}
    >
      {children}
    </ReadingLogsContext.Provider>
  );
}

export function useReadingLogs() {
  const context = useContext(ReadingLogsContext);
  if (!context) {
    throw new Error("useReadingLogs must be used within a ReadingLogsProvider");
  }
  return context;
}

