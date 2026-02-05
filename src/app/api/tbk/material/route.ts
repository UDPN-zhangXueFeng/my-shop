import { NextResponse } from "next/server";
import { EnvMissingError } from "@/lib/errors";
import { fetchMaterial } from "@/lib/tbk/client";
import { collectEnvStatus } from "@/lib/env";

export const dynamic = "force-dynamic"; // 避免缓存方便调试 // Avoid caching for easier debug

const mockItems = [
  {
    itemId: "123456",
    title: "示例：无线鼠标（淘宝）",
    price: "49.9",
    pictUrl: "https://img.alicdn.com/imgextra/i1/xxx.jpg",
    clickUrl: "https://uland.taobao.com/coupon/edetail?e=demo",
    platform: "taobao",
  },
  {
    itemId: "654321",
    title: "示例：蓝牙耳机（京东）",
    price: "129",
    pictUrl: "https://img14.360buyimg.com/n7/jfs/xx.jpg",
    clickUrl: "https://u.jd.com/demo123",
    platform: "jd",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get("cat") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const mock = searchParams.get("mock") === "1";

  if (mock) {
    return NextResponse.json({ ok: true, source: "mock", items: mockItems });
  }

  try {
    const items = await fetchMaterial({ cat, keyword, pageSize: 10 });
    return NextResponse.json({ ok: true, source: "taobao", items });
  } catch (error) {
    if (error instanceof EnvMissingError) {
      return NextResponse.json(
        {
          ok: false,
          source: "missing_env",
          missingKeys: error.missingKeys,
          message: error.message,
          hint: "携带 mock=1 可用示例数据",
          envStatus: collectEnvStatus(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        source: "error",
        message: (error as Error).message,
        hint: "携带 mock=1 可用示例数据",
      },
      { status: 500 }
    );
  }
}
