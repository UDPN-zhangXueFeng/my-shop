#!/usr/bin/env node
/**
 * 将京东导出的 XLS 转为 JSON // Convert JD exported XLS to JSON
 *
 * 用法 Usage:
 *   node scripts/convert-jd-xls-to-json.js [input.xls] [output.json]
 *
 * 默认输入：xls/ 目录下最新的 .xls/.xlsx；若不存在则使用传入路径或 public/data/jd_items.xls
 * 默认输出：public/data/jd_items.json
 */

const fs = require("fs");
const path = require("path");
const { readFile, utils } = require("xlsx");

const findLatestXls = () => {
  const dir = path.resolve(process.cwd(), "xls");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(xlsx?|xlsm)$/i.test(f))
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
  const latest = findLatestXls();
  if (latest) return latest;
  return path.resolve(process.cwd(), "public/data/jd_items.xls");
})();

const outputPath = path.resolve(
  process.cwd(),
  process.argv[3] || "public/data/jd_items.json"
);

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`未找到输入文件: ${inputPath}`); // Input file not found
    process.exit(1);
  }

  console.log(`[convert] 输入文件 // input: ${inputPath}`);
  console.log(`[convert] 输出文件 // output: ${outputPath}`);

  const workbook = readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json(sheet, { defval: "" });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  // 直接覆盖输出文件，不追加 // Overwrite output file, do not append
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), "utf8");

  console.log(
    `已转换 ${rows.length} 行 -> ${outputPath}` // Converted rows
  );
}

main();
