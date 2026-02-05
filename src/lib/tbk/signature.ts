import crypto from "node:crypto";

// 构建待签名字符串：secret + 排序参数(key+value) + secret // Build sign base string: secret + sorted (key+value) + secret
export const buildSignString = (
  params: Record<string, string | number | boolean | undefined>,
  appSecret: string
): string => {
  const sortedKeys = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .sort();

  const joined = sortedKeys
    .map((key) => `${key}${String(params[key])}`)
    .join("");

  return `${appSecret}${joined}${appSecret}`;
};

// 生成 MD5 大写签名 // Generate uppercase MD5 signature
export const generateSign = (
  params: Record<string, string | number | boolean | undefined>,
  appSecret: string
): string => {
  const signString = buildSignString(params, appSecret);
  return crypto.createHash("md5").update(signString, "utf8").digest("hex").toUpperCase();
};

// 组装带签名的完整参数（不含 sign 本身） // Assemble full params with sign (excluding existing sign)
export const withSignedParams = <T extends Record<string, any>>(
  baseParams: T,
  appSecret: string
): T & { sign: string } => {
  const paramsForSign = { ...baseParams };
  delete (paramsForSign as Record<string, unknown>).sign;
  const sign = generateSign(paramsForSign, appSecret);
  return { ...baseParams, sign };
};
