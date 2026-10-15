import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const uploadRes = await cloudinary.uploader.upload(imageBase64, {
      folder: "new_year_celebration_profiles",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    await connectToDatabase();
    await User.findByIdAndUpdate(session.userId, { avatar: uploadRes.secure_url });

    return NextResponse.json({ success: true, url: uploadRes.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
