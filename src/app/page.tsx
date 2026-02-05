"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">京东离线选品展示</h1>
        <p className="mt-2 text-sm text-zinc-600">
          当前数据来源：public/data/jd_items.json（请先运行 pnpm convert:jd 将最新导出转换为 JSON）。
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
          <span>排序：</span>
          <button
            className={`rounded-full border px-3 py-1 transition ${
              sortKey === "monthlySales" ? "border-black bg-black text-white" : "border-zinc-200"
            }`}
            onClick={() => setSortKey("monthlySales")}
          >
            按销量
          </button>
          <button
            className={`rounded-full border px-3 py-1 transition ${
              sortKey === "price" ? "border-black bg-black text-white" : "border-zinc-200"
            }`}
            onClick={() => setSortKey("price")}
          >
            按单价
          </button>
          <button
            className="rounded-full border px-3 py-1 transition border-zinc-200"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            {sortDir === "desc" ? "↓ 降序" : "↑ 升序"}
          </button>
        </div>

        {loading && <p className="mt-4 text-sm text-zinc-600">加载中…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div key={item.promoUrl} className="rounded-xl border border-zinc-200 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase text-orange-600">京东</div>
              {item.mainImage && (
                <img
                  src={item.mainImage}
                  alt={item.title}
                  className="mt-2 h-40 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="mt-3 line-clamp-2 text-sm font-medium text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-xs text-zinc-500">月销：{item.monthlySales || "-"}</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
                <span className="text-base font-semibold text-red-600">
                  到手价：¥{Number(item.finalPrice || item.price || 0).toFixed(2)}
                </span>
                {item.price && (
                  <span className="text-sm text-zinc-500">
                    （原价¥{Number(item.price).toFixed(2)}
                    {item.finalPrice && Number(item.price) > Number(item.finalPrice) && (
                      <>，领券立减¥{(Number(item.price) - Number(item.finalPrice)).toFixed(2)}</>
                    )}
                    ）
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm font-medium">
                <a
                  href={item.promoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full justify-center rounded-lg bg-black px-3 py-2 text-white hover:bg-zinc-800"
                >
                  去购买
                </a>
                {item.couponUrl && (
                  <a
                    href={item.couponUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full justify-center rounded-lg border border-orange-500 px-3 py-2 text-orange-600 hover:bg-orange-50"
                  >
                    领券链接
                  </a>
                )}
                {item.detailUrl && (
                  <a
                    href={item.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full justify-center rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 hover:bg-zinc-50"
                  >
                    商品详情页
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
