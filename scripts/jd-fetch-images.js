#!/usr/bin/env node
/**
 * 京东联盟：批量获取商品主图并写入 JSON // JD Union: batch fetch product main image and write into JSON
 *
 * 用法 // Usage:
 *   node scripts/jd-fetch-images.js [input.json] [output.json]
 *
 * 默认输入 // Default input: public/data/jd_items.json
 * 默认输出 // Default output: public/data/jd_items_with_images.json
 *
 * 依赖环境变量 // Required env:
 *   JD_APP_KEY / JD_APP_SECRET
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const INPUT_DEFAULT = "public/data/jd_items.json";
const OUTPUT_DEFAULT = "public/data/jd_items_with_images.json";

const APP_KEY = process.env.JD_APP_KEY || "ec62beddda23b9a2f7ec53be64cdbc6b";
const APP_SECRET = process.env.JD_APP_SECRET || "36c8aa15b4884c9badd0bd31175d86cd";

if (!APP_KEY || !APP_SECRET) {
  console.error("缺少 JD_APP_KEY / JD_APP_SECRET，请先在环境变量中配置");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), process.argv[2] || INPUT_DEFAULT);
const outputPath = path.resolve(process.cwd(), process.argv[3] || OUTPUT_DEFAULT);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatTimestamp(date) {
  // 京东要求格式：YYYY-MM-DD HH:mm:ss // JD requires format: YYYY-MM-DD HH:mm:ss
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function buildSign(params, appSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  return crypto
    .createHash("md5")
    .update(appSecret + sorted + appSecret)
    .digest("hex")
    .toUpperCase();
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

function extractSkuId(item) {
  // 兼容不同字段命名 // Support different field names
  const direct = item.skuId || item.sku_id || item.itemId || item.goodsId;
  if (direct) return String(direct).trim();

  const url = item["商品详情页URL"] || item.detailUrl || item.url;
  if (!url) return "";
  const match = String(url).match(/item\.jd\.com\/(\d+)\.html/i);
  return match ? match[1] : "";
}

async function getJdGoodsImage(goodsId) {
  const method = "jd.union.open.goods.query";
  const params = {
    method,
    app_key: APP_KEY,
    timestamp: formatTimestamp(new Date()),
    v: "1.0",
    sign_method: "md5",
    format: "json",
    "360buy_param_json": JSON.stringify({
      goodsReq: { skuId: goodsId }, // 或 materialId // or materialId
    }),
  };

  params.sign = buildSign(params, APP_SECRET);

  const qs = new URLSearchParams(params).toString();
  const url = `https://api.jd.com/routerjson?${qs}`;
  const data = await httpGetJson(url);
  const list =
    data?.jd_union_open_goods_query_response?.queryGoods_res?.data || [];
  const first = list[0];
  return first?.imageInfo?.imageList?.[0]?.url || "";
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`未找到输入文件: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const items = JSON.parse(raw);

  if (!Array.isArray(items)) {
    console.error("输入 JSON 必须是数组");
    process.exit(1);
  }

  console.log(`[jd-images] 输入: ${inputPath}`);
  console.log(`[jd-images] 输出: ${outputPath}`);

  const updated = [];
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const skuId = extractSkuId(item);

    if (!skuId) {
      skipped += 1;
      updated.push({ ...item, image: "" });
      continue;
    }

    try {
      const image = await getJdGoodsImage(skuId);
      if (image) success += 1;
      updated.push({ ...item, image, skuId });
    } catch (err) {
      failed += 1;
      updated.push({ ...item, image: "", skuId });
      console.error(`[jd-images] 获取失败 skuId=${skuId}`, err.message || err);
    }

    // 简单限速，避免触发频控 // Simple throttling to avoid rate limits
    await sleep(300);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), "utf8");

  console.log(
    `[jd-images] 完成：成功 ${success}，跳过 ${skipped}，失败 ${failed}`
  );
}

main();
