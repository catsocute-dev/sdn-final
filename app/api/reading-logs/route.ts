import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const ALLOWED_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Biography",
  "Other",
] as const;

export function formatReadingLog(log: {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string;
  favorite: boolean;
  readOn: string;
  createdAt: Date;
}) {
  return {
    id: log.id,
    bookTitle: log.bookTitle,
    minutesRead: log.minutesRead,
    genre: log.genre,
    note: log.note,
    favorite: log.favorite,
    readOn: log.readOn,
    createdAt: log.createdAt.toISOString(),
  };
}

export function isFutureDate(dateStr: string): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayLocal = `${year}-${month}-${day}`;
  const todayUTC = now.toISOString().split("T")[0];

  return dateStr > todayLocal && dateStr > todayUTC;
}

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

    // Sort: readOn descending (most recent first); ties broken by bookTitle, alphabetically, case-insensitive
    filtered.sort((a, b) => {
      if (a.readOn !== b.readOn) {
        return b.readOn.localeCompare(a.readOn);
      }
      return a.bookTitle.localeCompare(b.bookTitle, undefined, { sensitivity: "base" });
    });

    return NextResponse.json(filtered.map(formatReadingLog), { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("GET reading-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { bookTitle, minutesRead, genre, note, readOn } = body;

    // Validate Book Title
    if (bookTitle === undefined || bookTitle === null || typeof bookTitle !== "string" || !bookTitle.trim()) {
      return NextResponse.json({ error: "Book title is required" }, { status: 400 });
    }
    const trimmedTitle = bookTitle.trim();
    if (trimmedTitle.length > 80) {
      return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 });
    }

    // Validate Minutes Read
    if (minutesRead === undefined || minutesRead === null || minutesRead === "") {
      return NextResponse.json({ error: "Minutes read is required" }, { status: 400 });
    }
    const numMinutes = Number(minutesRead);
    if (isNaN(numMinutes)) {
      return NextResponse.json({ error: "Minutes read is required" }, { status: 400 });
    }
    if (!Number.isInteger(numMinutes) || numMinutes <= 0) {
      return NextResponse.json({ error: "Minutes read must be a positive number" }, { status: 400 });
    }

    // Validate Genre
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Please choose a genre" }, { status: 400 });
    }
    if (!ALLOWED_GENRES.includes(genre as (typeof ALLOWED_GENRES)[number])) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
    }

    // Validate Date
    if (!readOn || typeof readOn !== "string" || !readOn.trim()) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    const trimmedReadOn = readOn.trim();
    if (isFutureDate(trimmedReadOn)) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    // Check duplicate
    const existingDuplicate = await prisma.readingLog.findFirst({
      where: {
        userId: sessionUser.id,
        bookTitle: trimmedTitle,
        minutesRead: numMinutes,
        readOn: trimmedReadOn,
      },
    });

    if (existingDuplicate) {
      return NextResponse.json(
        {
          error:
            "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
        },
        { status: 409 }
      );
    }

    const created = await prisma.readingLog.create({
      data: {
        userId: sessionUser.id,
        bookTitle: trimmedTitle,
        minutesRead: numMinutes,
        genre,
        note: typeof note === "string" ? note.trim() : "",
        readOn: trimmedReadOn,
        favorite: false,
      },
    });

    return NextResponse.json(formatReadingLog(created), { status: 201 });
  } catch (error) {
    console.error("POST reading-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
