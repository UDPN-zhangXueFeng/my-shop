2026-02-05 制定前端快速开发计划：基于 init.md 输出 14 天 MVP 路线（API Routes + 单页跳转 + Vercel 部署），明确必备凭证与风险。预计收益：加快上线、减少漏传 adzone_id 导致的佣金损失。风险：需尽快验证签名与频控。
2026-02-05 完成 D1–D2：新增 env 校验、签名工具、健康检查 API；首页改为任务看板。好处：快速验证凭证与签名算法，避免 adzone_id 漏传。风险：仍需在联网环境实测淘宝 API 频控与响应格式。
2026-02-05 增加最小选品跳转链路：实现 /api/tbk/material（可 mock）、淘宝 Material 客户端封装，以及首页类目选择+商品卡片+外链跳转 UI。好处：最少步骤跑通“选品→跳转”，便于后续替换为真实数据流。风险：mock 模式需在上生产前移除，真实网关需校验网络与频控。
2026-02-05 添加京东联盟凭证位：env 支持 JD_APP_KEY/SECRET、JD_SITE_ID、JD_POSITION_ID，并提供 loadJdEnv 校验函数，为接入京东物料与转链做准备。风险：尚未实现京东 API，需要凭证后补齐。
2026-02-05 记录无开放平台权限应对方案：建议改为“静态选品 + 手工转链”模式，商品数据用本地 JSON/CSV，链接使用后台生成的推广链接，UI 保持不变，后续拿到权限再切换回 API。
2026-02-05 更新 .env.local：填入京东联盟 app_key/app_secret=ec62beddda23b9a2f7ec53be64cdbc6b / 36c8aa15b4884c9badd0bd31175d86cd，site_id=4103248368，position_id=3103616251。提醒：勿提交到 Git，部署平台单独配置。
2026-02-05 增加京东 XLS 离线选品链路：安装 xlsx 依赖，新增 `src/lib/jd/static.ts` 解析本地 1001334845_20260205132303.xls，`/api/jd/static` 返回数据，首页改为京东 XLS 卡片展示（推广链接/券/详情）。好处：无需开放平台 API 也能上架商品；风险：XLS 文件更新需手动替换并重启/重新部署。
2026-02-05 修复 XLS 读取：将文件移至 `public/data/jd_items.xls`，API 强制 `runtime=nodejs`，避免 Edge 运行时无法读文件；前端文案同步文件路径。
2026-02-05 转为 JSON 数据源：预先将 XLS 转成 `public/data/jd_items.json`，`src/lib/jd/static.ts` 直接读取 JSON，减少运行时解析与文件系统限制；首页文案改为 JSON 来源。
2026-02-05 添加转换脚本：`scripts/convert-jd-xls-to-json.js`，命令 `pnpm convert:jd`，将 XLS 一键转换为 JSON 数据源，便于随时替换导出文件。
2026-02-06 数据读取简化：`src/lib/jd/static.ts` 改为仅读取 `public/data/jd_items.json`，不再解析 xls；文案同步。若需更新数据，请先运行 `pnpm convert:jd` 生成 JSON。
2026-02-06 JSON 覆盖写入：转换脚本明确以覆盖方式写入 `public/data/jd_items.json`，确保每次转换都是最新数据，不会追加旧内容。
2026-02-06 UI 优化：在商品卡片展示“到手价”红色高亮，并在有原价时显示灰色删除线原价，增强价格对比感。
2026-02-06 价格与文案：价格改为“到手价：¥X（原价¥Y，领券立减¥Z）”，隐藏佣金比例/预估佣金，购买按钮文案改为“去购买”。
