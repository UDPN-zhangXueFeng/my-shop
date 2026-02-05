#!/usr/bin/env node
/**
 * 将京东导出的 CSV 转为 JSON // Convert JD exported CSV to JSON
 *
 * 用法:
 *   node scripts/convert-jd-csv-to-json.js [input.csv] [output.json]
 *
 * 默认输入：csv/ 目录下最新的 .csv；若未找到则使用传入路径
 * 默认输出：public/data/jd_items.json
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const iconv = require("iconv-lite");

const findLatestCsv = () => {
  const dir = path.resolve(process.cwd(), "csv");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.csv$/i.test(f))
    .map((f) => {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      return { full, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files[0]?.full || null;
};

const inputPath = (() => {
  if (process.argv[2]) return path.resolve(process.cwd(), process.argv[2]);
  const latest = findLatestCsv();
  if (latest) return latest;
  console.error("未找到 csv 目录下的 csv 文件，请指定输入路径");
  process.exit(1);
})();

const outputPath = path.resolve(process.cwd(), process.argv[3] || "public/data/jd_items.json");

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`未找到输入文件: ${inputPath}`);
    process.exit(1);
  }

  console.log(`[convert-csv] 输入: ${inputPath}`);
  console.log(`[convert-csv] 输出: ${outputPath}`);

  // 京东导出通常为 GBK 编码，先转 UTF-8 // JD export often GBK, decode to UTF-8
  const rawBuf = fs.readFileSync(inputPath);
  const utf8 = iconv.decode(rawBuf, "gbk");

  const records = parse(utf8, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), "utf8");

  console.log(`[convert-csv] 已转换 ${records.length} 行 -> ${outputPath}`);
}

main();
