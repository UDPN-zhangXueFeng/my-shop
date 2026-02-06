"use client";

import { useEffect, useRef, useState } from "react";

type Item = {
  title: string;
  price: string;
  finalPrice: string;
  mainImage: string;
  promoUrl: string;
  detailUrl: string;
  monthlySales: string;
  commissionRate: string;
  commission: string;
  couponUrl?: string;
};

type SortKey = "monthlySales" | "price";
type SortDir = "asc" | "desc";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("monthlySales");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatPrice = (item: Item) => {
    const value = Number(item.finalPrice || item.price);
    if (!Number.isFinite(value) || value <= 0) return "";
    return `¥${value.toFixed(2)}`;
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jd/static`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "获取失败");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch (err) {
      setError((err as Error).message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    // 背景 canvas 动效初始化 // Initialize background canvas animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const circles = Array.from({ length: 12 }).map((_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 60 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: 0.08 + (index % 5) * 0.02,
    }));

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const c of circles) {
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < -c.r || c.x > width + c.r) c.vx *= -1;
        if (c.y < -c.r || c.y > height + c.r) c.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(235, 42, 47, ${c.alpha})`;
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }
      animationId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      // 清理动画与监听 // Cleanup animation and listeners
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const marqueeItems = (items.length ? items : [{ title: "京东精选好物", promoUrl: "#" } as Item]).slice(0, 8);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f3e4d9] text-zinc-900">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        aria-hidden="true"
      />
      <div className="bg-[#EB2A2F] text-white">
        <div className="marquee relative flex h-[45px] w-full items-center overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap px-4 text-xs sm:text-sm">
            {[...marqueeItems, ...marqueeItems].map((item, index) => {
              const price = formatPrice(item);
              return (
                <a
                  key={`${item.title}-${index}`}
                  href={item.promoUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="marquee-item flex items-center gap-2"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">
                    热
                  </span>
                  <span className="text-white/90">{item.title}</span>
                  {price && <span className="text-amber-200">{price}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8">
        <section className="overflow-hidden rounded-3xl bg-[#fdf3ea] shadow-sm">
          <a href="https://u.jd.com/J6eb2ED" target="_blank" rel="noreferrer">
            <picture>
              <source
                media="(min-width: 1280px)"
                srcSet="/jdhc/京享红包-ToB/1080-320.jpg"
              />
              <source
                media="(min-width: 1024px) and (max-width: 1279px)"
                srcSet="/jdhc/京享红包-ToB/1080-430.jpg"
              />
              <source
                media="(min-width: 768px) and (max-width: 1023px)"
                srcSet="/jdhc/京享红包-ToB/1026-960.jpg"
              />
              <img
                src="/jdhc/京享红包-ToB/535-320.jpg"
                alt="京享红包活动图"
                className="h-auto w-full"
              />
            </picture>
          </a>
        </section>

        <section className="mt-8 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
          <span className="rounded-full bg-white px-3 py-2 shadow-sm">筛选</span>
          <button
            className={`rounded-full border px-4 py-2 transition ${
              sortKey === "monthlySales"
                ? "border-[#EB2A2F] bg-[#EB2A2F] text-white"
                : "border-zinc-200 bg-white"
            }`}
            onClick={() => setSortKey("monthlySales")}
          >
            按销量
          </button>
          <button
            className={`rounded-full border px-4 py-2 transition ${
              sortKey === "price"
                ? "border-[#EB2A2F] bg-[#EB2A2F] text-white"
                : "border-zinc-200 bg-white"
            }`}
            onClick={() => setSortKey("price")}
          >
            按单价
          </button>
          <button
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 transition"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            {sortDir === "desc" ? "↓ 降序" : "↑ 升序"}
          </button>

        </section>

        {loading && <p className="mt-6 text-sm text-zinc-600">加载中…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <section className="mt-8 grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          {items
            .slice()
            .sort((a, b) => {
              const dir = sortDir === "desc" ? -1 : 1;
              if (sortKey === "monthlySales") {
                const av = Number(a.monthlySales) || 0;
                const bv = Number(b.monthlySales) || 0;
                return (av - bv) * dir * -1;
              }
              if (sortKey === "price") {
                const av = Number(a.finalPrice || a.price) || 0;
                const bv = Number(b.finalPrice || b.price) || 0;
                return (av - bv) * dir;
              }
              return 0;
            })
            .map((item) => (
              <div
                key={item.promoUrl}
                className="group overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between px-3 pt-3 text-[11px] text-zinc-500 sm:px-4 sm:pt-4 sm:text-xs">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-[#EB2A2F]">
                    京东
                  </span>
                  <span>月销 {item.monthlySales || "-"}</span>
                </div>
                <div className="mt-3 px-3 sm:px-4">
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-50">
                    {item.mainImage ? (
                      <img
                        src={item.mainImage}
                        alt={item.title}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-52 lg:h-56"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-xs text-zinc-400 sm:h-52 lg:h-56">
                        暂无图片
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-[#EB2A2F] px-3 py-1 text-xs font-semibold text-white shadow">
                      今日好价
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-4 sm:px-4">
                  <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold text-zinc-900 sm:mt-4 sm:text-sm">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <div>
                      <div className="text-[11px] text-zinc-500 sm:text-xs">到手价</div>
                      <div className="text-xl font-semibold text-[#EB2A2F] sm:text-2xl">
                        ¥{Number(item.finalPrice || item.price || 0).toFixed(2)}
                      </div>
                    </div>
                    {item.price && (
                      <div className="text-left text-[11px] text-zinc-500 sm:text-right sm:text-xs">
                        <div>原价 ¥{Number(item.price).toFixed(2)}</div>
                        {item.finalPrice && Number(item.price) > Number(item.finalPrice) && (
                          <div className="text-[#EB2A2F]">
                            领券立减 ¥{(Number(item.price) - Number(item.finalPrice)).toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 text-sm font-medium">
                    <a
                      href={item.promoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full justify-center rounded-full bg-[#EB2A2F] px-4 py-2 text-sm text-white hover:bg-[#c82126] sm:py-2.5"
                    >
                      去购买
                    </a>
                    {item.couponUrl && (
                      <a
                        href={item.couponUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full justify-center rounded-full border border-[#EB2A2F] px-4 py-2 text-sm text-[#EB2A2F] hover:bg-red-50 sm:py-2.5"
                      >
                        领券链接
                      </a>
                    )}
                    {item.detailUrl && (
                      <a
                        href={item.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 sm:py-2.5"
                      >
                        商品详情页
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}
