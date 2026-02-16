import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Parser } from "json2csv";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // pressure, sugar, or weight

  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  const whereClause = {
    userId: session.user.id,
  };

  try {
    let csvData: any[] = [];
    let fields: any[] = [];
    let filename = `health_data_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === "pressure") {
      const readings = await prisma.pressureReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      fields = [
        { label: "Date", value: (row: any) => new Date(row.timestamp).toLocaleString() },
        { label: "Systolic (mmHg)", value: "systolic" },
        { label: "Diastolic (mmHg)", value: "diastolic" },
        { label: "Pulse (bpm)", value: "pulse" }
      ];
      csvData = readings;
    } else if (type === "sugar") {
      const readings = await prisma.sugarReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      fields = [
        { label: "Date", value: (row: any) => new Date(row.timestamp).toLocaleString() },
        { label: "Value (mg/dL)", value: "value" },
        { label: "Type", value: (row: any) => row.type.replace("_", " ") }
      ];
      csvData = readings;
    } else if (type === "weight") {
      const readings = await prisma.weightReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      fields = [
        { label: "Date", value: (row: any) => new Date(row.timestamp).toLocaleString() },
        { label: "Weight (kg)", value: "value" }
      ];
      csvData = readings;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 });
  }
}
