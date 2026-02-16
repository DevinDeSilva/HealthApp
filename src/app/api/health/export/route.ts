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
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const type = searchParams.get("type"); // pressure, sugar, weight, or all

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Date range required" }, { status: 400 });
  }

  const whereClause = {
    userId: session.user.id,
    timestamp: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  };

  let csvData: any[] = [];
  let fields: string[] = [];
  let filename = `health_records_${startDate}_to_${endDate}.csv`;

  try {
    if (type === "pressure" || type === "all") {
      const readings = await prisma.pressureReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      csvData = csvData.concat(readings.map(r => ({
        Type: "Blood Pressure",
        Date: r.timestamp.toLocaleString(),
        Value1: r.systolic,
        Label1: "Systolic",
        Value2: r.diastolic,
        Label2: "Diastolic",
        Value3: r.pulse || "",
        Label3: "Pulse"
      })));
    }

    if (type === "sugar" || type === "all") {
      const readings = await prisma.sugarReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      csvData = csvData.concat(readings.map(r => ({
        Type: `Blood Sugar (${r.type})`,
        Date: r.timestamp.toLocaleString(),
        Value1: r.value,
        Label1: "mg/dL",
        Value2: "",
        Label2: "",
        Value3: "",
        Label3: ""
      })));
    }

    if (type === "weight" || type === "all") {
      const readings = await prisma.weightReading.findMany({
        where: whereClause,
        orderBy: { timestamp: "asc" },
      });
      csvData = csvData.concat(readings.map(r => ({
        Type: "Weight",
        Date: r.timestamp.toLocaleString(),
        Value1: r.value,
        Label1: "kg",
        Value2: "",
        Label2: "",
        Value3: "",
        Label3: ""
      })));
    }

    // Sort combined data by date
    csvData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const json2csvParser = new Parser();
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
