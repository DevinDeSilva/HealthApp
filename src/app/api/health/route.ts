import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [pressureReadings, sugarReadings, weightReadings] = await Promise.all([
    prisma.pressureReading.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "asc" },
    }),
    prisma.sugarReading.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "asc" },
    }),
    prisma.weightReading.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  return NextResponse.json({
    pressureReadings,
    sugarReadings,
    weightReadings,
  });
}
