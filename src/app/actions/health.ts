"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logPressure(systolic: number, diastolic: number, pulse?: number, timestamp?: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.pressureReading.create({
      data: {
        userId: session.user.id,
        systolic,
        diastolic,
        pulse,
        timestamp: timestamp || new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error logging pressure:", error);
    return { error: "Failed to log pressure reading" };
  }
}

export async function logSugar(value: number, type: string, timestamp?: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.sugarReading.create({
      data: {
        userId: session.user.id,
        value,
        type,
        timestamp: timestamp || new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error logging sugar:", error);
    return { error: "Failed to log sugar reading" };
  }
}

export async function logWeight(
  value: number, 
  timestamp?: Date,
  fatMass?: number,
  fatPercentage?: number,
  muscleMass?: number
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.weightReading.create({
      data: {
        userId: session.user.id,
        value,
        fatMass,
        fatPercentage,
        muscleMass,
        timestamp: timestamp || new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error logging weight:", error);
    return { error: "Failed to log weight" };
  }
}

export async function deletePressure(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.pressureReading.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pressure reading:", error);
    return { error: "Failed to delete pressure reading" };
  }
}

export async function deleteSugar(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.sugarReading.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sugar reading:", error);
    return { error: "Failed to delete sugar reading" };
  }
}

export async function deleteWeight(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.weightReading.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting weight reading:", error);
    return { error: "Failed to delete weight reading" };
  }
}

export async function bulkDeleteReadings(type: "pressure" | "sugar" | "weight", olderThanDays: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const where = {
      userId: session.user.id,
      timestamp: {
        lt: cutoffDate,
      },
    };

    let result;
    if (type === "pressure") {
      result = await prisma.pressureReading.deleteMany({ where });
    } else if (type === "sugar") {
      result = await prisma.sugarReading.deleteMany({ where });
    } else {
      result = await prisma.weightReading.deleteMany({ where });
    }

    revalidatePath("/dashboard");
    return { success: true, count: result.count };
  } catch (error) {
    console.error(`Error bulk deleting ${type} readings:`, error);
    return { error: `Failed to bulk delete ${type} readings` };
  }
}
