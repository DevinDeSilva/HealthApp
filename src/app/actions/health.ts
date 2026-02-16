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

export async function logWeight(value: number, timestamp?: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    await prisma.weightReading.create({
      data: {
        userId: session.user.id,
        value,
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
