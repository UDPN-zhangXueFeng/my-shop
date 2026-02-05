import { TbEnv, loadTbEnv } from "@/lib/env";
import { withSignedParams } from "@/lib/tbk/signature";

const TAOBAO_GATEWAY = "https://eco.taobao.com/router/rest"; // 经典网关 // Legacy gateway

export type MaterialQuery = {
  keyword?: string;
  cat?: string; // 类目 ID // Category ID
  pageNo?: number;
  pageSize?: number;
};

export type SimpleItem = {
  itemId: string;
  title: string;
  price: string;
  pictUrl: string;
  clickUrl: string;
  platform: "taobao" | "jd";
};

const buildBaseParams = (env: TbEnv) => ({
  app_key: env.appKey,
  adzone_id: env.adzoneId,
  format: "json",
  sign_method: "md5",
  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  v: "2.0",
});

export async function fetchMaterial(query: MaterialQuery) {
  const env = loadTbEnv();

  const params = withSignedParams(
    {
      ...buildBaseParams(env),
      method: "taobao.tbk.dg.material.optional",
      q: query.keyword,
      cat: query.cat,
      page_no: query.pageNo ?? 1,
      page_size: query.pageSize ?? 10,
    },
    env.appSecret
  );

  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.append(k, String(v));
  });

  const res = await fetch(TAOBAO_GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: search.toString(),
    // 注意：若部署在无公网环境需换到有网络的函数运行时 // If no public network, run on edge/server with network
  });

  if (!res.ok) {
    throw new Error(`淘宝网关返回非 2xx 状态: ${res.status}`);
  }

  const data = await res.json();
  const items =
    data?.tbk_dg_material_optional_response?.result_list?.map_data ?? [];

  const simplified: SimpleItem[] = items.map((item: any) => ({
    itemId: String(item.item_id),
    title: item.title,
    price: item.zk_final_price,
    pictUrl: item.pict_url,
    clickUrl: item.coupon_share_url || item.click_url,
    platform: "taobao",
  }));

  return simplified;
}
