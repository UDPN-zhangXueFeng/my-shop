# 项目总体理解（2026-02-05）
- 目标：14 天上线淘宝联盟 CPS/CPA 前端 MVP，跑通选品→转链→跳转闭环。
- 技术栈：Next.js App Router + API Routes；可选 Prisma + MySQL（首版可暂不接库）；Vercel 部署。
- 核心功能：
  1) 物料搜索：调用 taobao.tbk.dg.material.optional 返回商品列表。
  2) 转链：taobao.tbk.item.convert，必须带 adzone_id/pid，生成 click_url。
  3) 跳转中转：API 302 到 click_url，便于埋点与防盗链。
- 开发节奏（前端 14 天）：
  - D1–D2：环境变量(app_key/secret/adzone_id) + 签名函数 + 健康检查接口。
  - D3–D5：/api/tbk/material、/api/tbk/convert、/api/tbk/redirect 三条 API 完成并本地联调。
  - D6–D8：单页首页卡片列表（Server Component 调 API）+ 跳转按钮。
  - D9–D10：部署 Vercel，绑定域名，设置 ENV。
  - D11+：加简单缓存/埋点、订单查询轮询（可 cron）。
- 风险与注意：
  - adzone_id/pid 漏传 → 0 佣金；签名错误/频控；需缓存/限流。
- 首版 UI 可极简，优先闭环和数据埋点。

## 2026-02-05 补充
- 已创建 env 辅助与 EnvMissingError，集中校验 TB_APP_KEY/TB_APP_SECRET/TB_ADZONE_ID；可选 TB_PID。
- 新增签名工具 `src/lib/tbk/signature.ts`：buildSignString + generateSign + withSignedParams，采用 MD5 大写，入参按 key 排序拼接。
- 新增健康检查 API `src/app/api/health/route.ts`：实时返回环境变量状态，若齐全则给出示例 sign 与 signString，便于对照淘宝签名文档；设置 dynamic=force-dynamic 防缓存。
- 首页改为冲刺看板，提供 /api/health 快捷入口与初始命令行提示。

## 2026-02-05 最小选品跳转流
- 新增 material 列表 API `/api/tbk/material`，支持 `cat`、`keyword`，缺省返回最多 10 条。缺 env 时可用 `mock=1` 返回示例（含淘宝/京东各一）。
- 新增 `src/lib/tbk/client.ts`：封装 taobao.tbk.dg.material.optional 请求，输出简化字段 itemId/title/price/pictUrl/clickUrl/platform。
- 首页改为最小“选品+跳转”界面：类目按钮 → 拉取列表 → 外链跳转（目前默认 mock 参数，填好 ENV 后去掉 `mock=1` 即可直连淘宝网关）。

## 2026-02-05 京东配置占位
- 环境变量支持京东联盟：JD_APP_KEY / JD_APP_SECRET / JD_SITE_ID / JD_POSITION_ID（在使用京东接口时会强校验）。
- `src/lib/env.ts` 新增 `loadJdEnv`，缺失时抛出 EnvMissingError，便于后续接入京东物料/转链 API。

## 2026-02-05 无开放平台权限的替代路径
- 角色：推客（非商家）通常拿不到开放平台 API 权限，可采用“无 API 静态选品 + 手工转链”方案。
- 淘宝/京东后台均可生成推广链接（含 pid/adzone/site/position），可直接落到页面：手动维护商品列表（JSON/CSV），字段含标题、价格、图片、已转好的 click_url、平台标识。
- 前端改动：保留当前 UI，数据源改为本地静态文件（或 Vercel KV/JSON），不依赖 API 调用；点击仍跳转已有推广链接，佣金归属不变。
- 后续若获得 API 权限，可把数据源切回 /api/tbk/material 等接口，无需大改 UI。

## 2026-02-05 京东 XLS 离线选品
- 新增 `xlsx` 依赖，解析导出的京东 XLS（文件：1001334845_20260205132303.xls）。
- `src/lib/jd/static.ts`：读取 XLS 第一张表，映射字段（商品名称/主图/详情/到手价/佣金/推广链接/券链接），并缓存结果。
- `src/app/api/jd/static/route.ts`：返回本地 XLS 解析后的列表，`dynamic=force-dynamic` 便于替换文件。
- `src/app/page.tsx`：前端改为“京东 XLS 选品展示”，直接调用 `/api/jd/static` 渲染卡片，链接为联盟推广链接，支持券和详情页跳转。
- 2026-02-05 补充：将 XLS 移到 `public/data/jd_items.xls` 以便打包，API 指定 `runtime=\"nodejs\"` 以读取文件系统。
- 2026-02-05 再补充：预先将 XLS 转为 JSON（`public/data/jd_items.json`），`src/lib/jd/static.ts` 直接读取 JSON，减少运行时解析与文件系统限制；首页文案同步为 JSON 数据源。

## 2026-02-05 转换脚本
- 新增脚本 `scripts/convert-jd-xls-to-json.js`（`pnpm convert:jd`），默认将 `public/data/jd_items.xls` 转为 `public/data/jd_items.json`，替换导出文件后可一键更新 JSON 数据源。

## 2026-02-06 数据读取简化
- 前端与 API 均直接读取 `public/data/jd_items.json`，不再解析 xls；请先运行 `pnpm convert:jd` 生成 JSON。
- 如需替换数据：将最新导出放入 xls/ 并执行转换脚本，或直接覆盖 JSON。

## 2026-02-06 覆盖写入说明
- 转换脚本写 JSON 时使用覆盖模式（非追加），每次转换都会用最新导出完全替换 `public/data/jd_items.json`。

## 2026-02-06 UI 细节
- 商品卡片新增价格对比样式：到手价红色高亮，原价（若存在且不同）灰色删除线，增强转化引导。
- 2026-02-06 再优化：价格文案调整为“到手价：¥X（原价¥Y，领券立减¥Z）”，隐藏佣金比例与预估佣金，按钮改为“去购买”。

## 2026-02-06 CSV 转换补充
- 新增 `scripts/convert-jd-csv-to-json.js`（`pnpm convert:jd:csv`），默认读取 `csv/` 目录下最新的 CSV 导出并覆盖生成 `public/data/jd_items.json`，字段按首行表头解析；支持 GBK 解码，`relax_column_count` 防止列数不一致报错。
