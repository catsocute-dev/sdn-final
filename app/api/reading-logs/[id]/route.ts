import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ALLOWED_GENRES, formatReadingLog, isFutureDate } from "@/app/api/reading-logs/route";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    const existing = await prisma.readingLog.findFirst({
      where: {
        id,
        userId: sessionUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { bookTitle, minutesRead, genre, note, readOn, favorite } = body;

    const dataToUpdate: {
      bookTitle?: string;
      minutesRead?: number;
      genre?: string;
      note?: string;
      readOn?: string;
      favorite?: boolean;
    } = {};

    let targetTitle = existing.bookTitle;
    let targetMinutes = existing.minutesRead;
    let targetReadOn = existing.readOn;

    // Validate bookTitle if provided
    if (bookTitle !== undefined) {
      if (typeof bookTitle !== "string" || !bookTitle.trim()) {
        return NextResponse.json({ error: "Book title is required" }, { status: 400 });
      }
      const trimmedTitle = bookTitle.trim();
      if (trimmedTitle.length > 80) {
        return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 });
      }
      dataToUpdate.bookTitle = trimmedTitle;
      targetTitle = trimmedTitle;
    }

    // Validate minutesRead if provided
    if (minutesRead !== undefined) {
      if (minutesRead === null || minutesRead === "") {
        return NextResponse.json({ error: "Minutes read is required" }, { status: 400 });
      }
      const numMinutes = Number(minutesRead);
      if (isNaN(numMinutes)) {
        return NextResponse.json({ error: "Minutes read is required" }, { status: 400 });
      }
      if (!Number.isInteger(numMinutes) || numMinutes <= 0) {
        return NextResponse.json({ error: "Minutes read must be a positive number" }, { status: 400 });
      }
      dataToUpdate.minutesRead = numMinutes;
      targetMinutes = numMinutes;
    }

    // Validate genre if provided
    if (genre !== undefined) {
      if (!genre || typeof genre !== "string" || !genre.trim()) {
        return NextResponse.json({ error: "Please choose a genre" }, { status: 400 });
      }
      if (!ALLOWED_GENRES.includes(genre as (typeof ALLOWED_GENRES)[number])) {
        return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
      }
      dataToUpdate.genre = genre;
    }

    // Validate readOn if provided
    if (readOn !== undefined) {
      if (!readOn || typeof readOn !== "string" || !readOn.trim()) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }
      const trimmedReadOn = readOn.trim();
      if (isFutureDate(trimmedReadOn)) {
        return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
      }
      dataToUpdate.readOn = trimmedReadOn;
      targetReadOn = trimmedReadOn;
    }

    // Validate note if provided
    if (note !== undefined) {
      dataToUpdate.note = typeof note === "string" ? note.trim() : "";
    }

    // Validate favorite if provided
    if (favorite !== undefined) {
      dataToUpdate.favorite = Boolean(favorite);
    }

    // Duplicate check if any of bookTitle, minutesRead, or readOn changed
    if (bookTitle !== undefined || minutesRead !== undefined || readOn !== undefined) {
      const duplicate = await prisma.readingLog.findFirst({
        where: {
          userId: sessionUser.id,
          id: { not: existing.id },
          bookTitle: targetTitle,
          minutesRead: targetMinutes,
          readOn: targetReadOn,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error:
              "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.readingLog.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    return NextResponse.json(formatReadingLog(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH reading-logs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    const existing = await prisma.readingLog.findFirst({
      where: {
        id,
        userId: sessionUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    await prisma.readingLog.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE reading-logs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
