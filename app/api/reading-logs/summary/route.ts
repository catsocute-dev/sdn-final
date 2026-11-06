import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const GENRE_PRIORITY: Record<string, number> = {
  Fiction: 1,
  "Non-Fiction": 2,
  "Sci-Fi": 3,
  Biography: 4,
  Other: 5,
};

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const genreParam = searchParams.get("genre");
    const favoriteParam = searchParams.get("favorite");
    const qParam = searchParams.get("q");

    const logs = await prisma.readingLog.findMany({
      where: {
        userId: sessionUser.id,
      },
    });

    let filtered = logs;

    if (genreParam && genreParam.trim() !== "") {
      filtered = filtered.filter((l) => l.genre === genreParam);
    }

    if (favoriteParam === "true") {
      filtered = filtered.filter((l) => l.favorite === true);
    }

    if (qParam !== null && qParam !== undefined) {
      const q = qParam.trim().toLowerCase();
      if (q !== "") {
        filtered = filtered.filter((l) => {
          const titleMatch = l.bookTitle.toLowerCase().includes(q);
          const noteMatch = (l.note || "").toLowerCase().includes(q);
          return titleMatch || noteMatch;
        });
      }
    }

    const count = filtered.length;
    let favoriteCount = 0;
    let totalMinutes = 0;

    const genreStatsMap = new Map<string, { count: number; total: number }>();

    for (const item of filtered) {
      if (item.favorite) {
        favoriteCount += 1;
      }
      totalMinutes += item.minutesRead;

      const current = genreStatsMap.get(item.genre) || { count: 0, total: 0 };
      current.count += 1;
      current.total += item.minutesRead;
      genreStatsMap.set(item.genre, current);
    }

    const breakdown: Array<{ genre: string; count: number; total: number }> = [];

    genreStatsMap.forEach((stats, genre) => {
      breakdown.push({
        genre,
        count: stats.count,
        total: stats.total,
      });
    });

    // Sort: total minutes descending; ties ordered Fiction, Non-Fiction, Sci-Fi, Biography, Other
    breakdown.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const priorityA = GENRE_PRIORITY[a.genre] ?? 99;
      const priorityB = GENRE_PRIORITY[b.genre] ?? 99;
      return priorityA - priorityB;
    });

    return NextResponse.json(
      {
        count,
        favoriteCount,
        totalMinutes,
        breakdown,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("GET reading-logs summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
