import path from "node:path";
import fs from "node:fs";
import { readFile, utils } from "xlsx";

export type JdStaticItem = {
  title: string;
  detailUrl: string;
  mainImage: string;
  price: string;
  finalPrice: string;
  monthlySales: string;
  commissionRate: string;
  commission: string;
  promoUrl: string; // 联盟推广链接 // JD union promo link
  couponUrl?: string;
};

let cached: JdStaticItem[] | null = null;

// 路径配置 // Path config
const JSON_PATH = path.join(process.cwd(), "public", "data", "jd_items.json");

export function loadJdStaticItems(): JdStaticItem[] {
  if (cached) return cached;

  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`未找到数据文件 public/data/jd_items.json，请先运行 pnpm convert:jd 生成 JSON。`);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const rows: Record<string, any>[] = JSON.parse(raw);
  cached = mapRows(rows);
  return cached;
}

// 映射行到前端字段 // Map rows to frontend fields
function mapRows(rows: Record<string, any>[]): JdStaticItem[] {
  return rows.map((row) => ({
    title: row["商品名称"] || "",
    detailUrl: row["商品详情页URL"] || "",
    mainImage: normalizeImg(row["商品主图链接"] || ""),
    price: String(row["单价"] || ""),
    finalPrice: String(row["到手价"] || row["单价"] || ""),
    monthlySales: String(row["月销"] || ""),
    commissionRate: String(row["佣金比例"] || ""),
    commission: String(row["佣金"] || ""),
    promoUrl: row["联盟推广链接"] || row["推广链接"] || row["链接"] || "",
    couponUrl: row["优惠券领取链接"] || "",
  }));
}

// 处理缺失协议的图片 URL // Handle missing protocol in image URLs
function normalizeImg(url: string) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `https://${url}`;
}
