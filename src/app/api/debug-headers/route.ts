import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    url: request.url,
    nextUrl: request.nextUrl.toString(),
    headers: Object.fromEntries(request.headers.entries()),
  });
}