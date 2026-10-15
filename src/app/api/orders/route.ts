import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { localDB } from "@/lib/store";
import { couponRate } from "@/lib/coupons";
import type { OrderItemInput } from "@/types";

function generateOrderNumber(): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NYE-2026-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { items, couponCode } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }

    const cleanItems = items.map((item: OrderItemInput) => ({
      id: Number(item.id),
      name: String(item.name || "Holiday Item").slice(0, 120),
      price: Number(item.price) || 0,
      qty: Math.min(Math.max(Number(item.qty) || 1, 1), 20),
      img: String(item.img || ""),
      discount: String(item.discount || ""),
    }));

    if (cleanItems.some((i) => i.price <= 0)) {
      return NextResponse.json({ error: "One or more items have an invalid price." }, { status: 400 });
    }

    const subtotal = cleanItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const rate = couponRate(typeof couponCode === "string" ? couponCode : "");
    const discountAmount = Math.round(subtotal * rate * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    const session = await getSession();
    const orderNumber = generateOrderNumber();

    const orderData = {
      orderNumber,
      userId: session?.userId || null,
      items: cleanItems,
      subtotal,
      discountAmount,
      total,
      couponCode: rate > 0 ? String(couponCode).trim().toUpperCase() : "",
      status: "confirmed" as const,
    };

    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      try {
        await Order.create(orderData);
      } catch (err) {
        console.error("Order persistence failed, using local fallback", err);
        localDB.createOrder({ ...orderData, createdAt: new Date().toISOString() });
      }
    } else {
      localDB.createOrder({ ...orderData, createdAt: new Date().toISOString() });
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      total,
      message: "Order confirmed! Your celebration pack is reserved.",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Unable to place your order. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ orders: [] });
    }
    const mongooseConn = await connectToDatabase();
    if (!mongooseConn) {
      const local = localDB.getOrders(session.userId);
      return NextResponse.json({ orders: local });
    }
    const orders = await Order.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json({ orders: [] });
  }
}
