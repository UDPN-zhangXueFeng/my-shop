import { NextResponse } from "next/server";
import { loadJdStaticItems } from "@/lib/jd/static";

export const dynamic = "force-dynamic"; // 避免缓存，方便替换 XLS // Disable cache for easier XLS replacement
export const runtime = "nodejs"; // 需要 Node 运行时以读文件 // Require Node runtime to read filesystem

export async function GET() {
  try {
    const items = loadJdStaticItems();
    return NextResponse.json({ ok: true, source: "xls", count: items.length, items });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
