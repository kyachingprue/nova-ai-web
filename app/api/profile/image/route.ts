import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-role";

const maxImageSize = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const account = await getCurrentUser();
    if (!account) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > maxImageSize + 64 * 1024) {
      return NextResponse.json({ error: "Choose an image smaller than 5 MB." }, { status: 413 });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    if (!allowedTypes.has(file.type) || file.size === 0 || file.size > maxImageSize) {
      return NextResponse.json({ error: "Choose a PNG, JPG, or WEBP image smaller than 5 MB." }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Set IMGBB_API_KEY on the server to enable profile image uploads." }, { status: 503 });
    }

    const uploadData = new FormData();
    uploadData.append("image", file);
    const upload = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: uploadData,
      signal: AbortSignal.timeout(30000),
    });
    if (!upload.ok) {
      console.error("ImgBB profile upload failed:", upload.status);
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 502 });
    }

    const result: { success?: boolean; data?: { url?: string } } = await upload.json();
    let imageUrl: string;
    try {
      const url = new URL(result.data?.url || "");
      if (!result.success || (url.protocol !== "https:" && url.protocol !== "http:")) throw new Error();
      imageUrl = url.href;
    } catch {
      console.error("ImgBB returned an invalid profile image response.");
      return NextResponse.json({ error: "Image upload failed. Please try another image." }, { status: 502 });
    }

    const [profile] = await getDb()`UPDATE users SET image_url = ${imageUrl}
      WHERE id = ${account.id} RETURNING image_url AS "imageUrl"`;
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ imageUrl: profile.imageUrl });
  } catch (error) {
    console.error("Profile image update failed:", error);
    return NextResponse.json({ error: "Unable to update your profile image." }, { status: 500 });
  }
}
