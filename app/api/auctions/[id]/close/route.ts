import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").slice(-2, -1)[0]; // ดึง ID จาก pathname

  if (!id) {
    return NextResponse.json({ error: "Missing auction ID" }, { status: 400 });
  }

  try {
    // 🔎 ค้นหาการประมูลจากฐานข้อมูล
    const auction = await prisma.auction.findUnique({ where: { id } });

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // 🚨 ตรวจสอบว่าการประมูลปิดไปแล้วหรือยัง
    if (auction.status === "CLOSED") {
      return NextResponse.json(
        { message: "Auction already closed" },
        { status: 400 }
      );
    }

    // ✅ ปิดการประมูลและอัปเดต `endedAt` เป็นเวลาปัจจุบัน
    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: {
        status: "CLOSED",
        endedAt: new Date(),
      },
    });

    console.log(`✅ Auction ${id} closed successfully.`);

    return NextResponse.json(
      { message: "Auction closed successfully", auction: updatedAuction },
      { status: 200 }
    );
  } catch (error) {
    console.error("🚨 Error closing auction:", error);
    return NextResponse.json(
      { error: "Failed to close auction" },
      { status: 500 }
    );
  }
}
