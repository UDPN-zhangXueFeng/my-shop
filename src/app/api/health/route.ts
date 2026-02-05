import { NextResponse } from "next/server";
import { collectEnvStatus, loadTbEnv } from "@/lib/env";
import { buildSignString, generateSign } from "@/lib/tbk/signature";
import { EnvMissingError } from "@/lib/errors";

export const dynamic = "force-dynamic"; // 避免缓存，保证实时检查 // Avoid caching, ensure real-time checks

export async function GET() {
  const envStatus = collectEnvStatus();
  const missingKeys = envStatus.filter((item) => !item.present).map((i) => i.key);

  try {
    const { appKey, appSecret, adzoneId } = loadTbEnv();

    const sampleParams = {
      method: "taobao.tbk.dg.material.optional",
      app_key: appKey,
      adzone_id: adzoneId,
      format: "json",
      v: "2.0",
      sign_method: "md5",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    } as const;

    const signString = buildSignString(sampleParams, appSecret);
    const sign = generateSign(sampleParams, appSecret);

    return NextResponse.json({
      ok: true,
      envStatus,
      sample: {
        note: "仅用于验证签名算法，不会外发请求", // For validation only, no outbound request
        sign,
        signString,
      },
    });
  } catch (error) {
    if (error instanceof EnvMissingError) {
      return NextResponse.json(
        {
          ok: false,
          envStatus,
          missingKeys,
          message: error.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        envStatus,
        missingKeys,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
