<!--
 * @Author: UDPN-zhangXueFeng 84691916+UDPN-zhangXueFeng@users.noreply.github.com
 * @Date: 2026-02-05 10:34:04
 * @LastEditors: UDPN-zhangXueFeng 84691916+UDPN-zhangXueFeng@users.noreply.github.com
 * @LastEditTime: 2026-02-05 10:34:37
 * @FilePath: /my-shop/init.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
淘宝联盟 CPS/CPA 起步指南（前端程序员版）


不玩私域，专注最近两个月快速跑通闭环
更新日期：2026年2月
目标：两个月内看到第一笔佣金 → 月入几千元起步
核心目标与时间规划（8周）
* 第1个月：账号、选品、建站/页面、免费引流 → 月佣金几百～1500元
* 第2个月：付费小投、数据优化、渠道放大 → 月佣金2000～8000元+


周次	核心任务	预计成果	预算建议
周1	注册、认证、选品、极简页面上线	能转链、能跳转淘宝	<100元
周2	API动态列表 + 转链中转 + 部署	每天有点击数据	0元
周3–4	每天3–5条内容输出（小红书/抖音/知乎等）	日UV 100–500，第一笔佣金	0元
周5–6	直通车/信息流小额测试 + 数据复盘	日佣金50–200+	500–1500元
周7–8	放大高转化渠道 + 自动化拉订单	月佣金稳定2000+	控制ROI>1.5
必做准备（先完成这三步再写代码）
1. 淘宝联盟 pub.alimama.com → 实名认证 → 创建推广位（网站类型）→ 记录 adzone_id / pid
2. 开放平台开发者账号 open.taobao.com → 创建淘宝客应用 → 拿到 app_key + app_secret → 申请 taobao.tbk.* 权限
3. 核心API（记住这三个就够起步）
    * taobao.tbk.dg.material.optional → 搜索物料/选品
    * taobao.tbk.item.convert → 商品转链（必须带 adzone_id）
    * taobao.tbk.order.details.get → 查询订单（近实时）
推荐技术栈 & 最快上线路径（7–14天MVP）
技术栈（全JS/TS，适合前端）
* 前端：Next.js 14/15（App Router）
* 后端：Next.js API Routes（无需额外Express项目）
* 数据库：MySQL + Prisma（类型安全）
* 部署：Vercel（免费、自动HTTPS）
最快上线路线（建议路径）
* Day 1–2：create-next-app + Prisma连库 + 签名函数测试
* Day 3–5：写3个API Route（material / convert / redirect）
* Day 6–8：首页商品卡片列表 + 跳转中转 + Tailwind简单样式
* Day 9–10：部署Vercel + 绑定域名
* Day 11+：开始发内容引流 + 加cron拉订单
核心代码位置提醒（参考之前对话完整代码）
* 签名函数：generateSign
* API Routes：/app/api/tbk/[material|convert|redirect]/route.ts
* 首页：/app/page.tsx（Server Component fetch API）
* 中转跳转：/app/api/tbk/redirect/route.ts（302到click_url）
AI如何提效（立即可引入）


环节	AI用法	推荐工具	节省时间估算
选品	分析高佣热销商品、预测趋势	ChatGPT / Gemini / Qwen	80%
内容生产	生成评测文、笔记、短视频脚本、海报	ChatGPT + Midjourney/DALL·E	70%
代码辅助	写签名函数、API调用、组件代码	GitHub Copilot / ChatGPT	50–70%
数据复盘	上传订单CSV，分析ROI、预测佣金	ChatGPT分析CSV	90%
广告优化	生成关键词、文案、投放建议	Gemini / 直通车AI工具	60%
两个月避坑清单（最重要）
* 链接必须带自己的 adzone_id，否则0佣金
* 别刷单、机器人、虚假宣传 → 账号秒封
* 别直接发淘口令，用转链或H5中转
* API调用频率控制（QPS有限），加缓存
* 佣金月结，100元起提（支付宝）
* 初期别追求完美UI/功能，先跑通闭环
* 内容真实，避免过度营销被平台限流
后续可选扩展（赚到钱后再做）
* 商品搜索 + 分类 + 详情页
* 简单后台（订单/佣金统计 dashboard）
* 定时任务同步订单（Vercel Cron / upstash）
* 加 Redis 缓存热门商品
* 考虑小程序/H5多端分发
* 有稳定收入后再考虑私域（微信群/视频号）
一句话总结
先用7–14天做一个“丑但能赚钱”的MVP
→ 重点放在选品 + 每天输出内容 + 引流
→ 等有佣金收入后再迭代功能和美化
祝你两个月内快速看到第一笔佣金！
有任何代码报错、API签名失败、部署问题，直接贴给我继续debug。

操作建议（Mac备忘录）：
1. 选中上面全部内容 → 复制
2. 打开「备忘录」App → 新建一个备忘录
3. 粘贴进去
4. 标题可以改成：淘宝联盟起步指南-2026
5. 可以用文件夹归类，或加标签 #副业 #淘宝联盟
需要我再调整结构（比如拆成多个小备忘录）、加更多代码片段、或转换成更简短的 checklist 版，都可以告诉我。


