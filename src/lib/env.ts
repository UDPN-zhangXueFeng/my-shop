import { EnvMissingError } from "./errors";

// 淘宝必填 // Taobao required
const TB_REQUIRED_KEYS = ["TB_APP_KEY", "TB_APP_SECRET", "TB_ADZONE_ID"] as const;
// 淘宝可选 + 京东凭证（先配置可选，使用京东功能时再强校验） // Taobao optional + JD creds (optional here, validated when used)
const OPTIONAL_KEYS = [
  "TB_PID",
  "JD_APP_KEY",
  "JD_APP_SECRET",
  "JD_SITE_ID",
  "JD_POSITION_ID",
] as const;

type TbRequiredKey = (typeof TB_REQUIRED_KEYS)[number];
type OptionalKey = (typeof OPTIONAL_KEYS)[number];
type AllKey = TbRequiredKey | OptionalKey;

type EnvValue = {
  key: string;
  present: boolean;
  maskedValue?: string;
};

const maskValue = (value: string) => {
  if (!value) return "";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
};

export type TbEnv = {
  appKey: string;
  appSecret: string;
  adzoneId: string;
  pid?: string;
};

export type JdEnv = {
  appKey: string;
  appSecret: string;
  siteId: string;
  positionId: string;
};

export const collectEnvStatus = (): EnvValue[] => {
  const allKeys: AllKey[] = [...TB_REQUIRED_KEYS, ...OPTIONAL_KEYS];
  return allKeys.map((key) => {
    const value = process.env[key];
    return {
      key,
      present: Boolean(value),
      maskedValue: value ? maskValue(value) : undefined,
    };
  });
};

export const loadTbEnv = (): TbEnv => {
  const missing: string[] = [];
  const envMap: Record<TbRequiredKey | OptionalKey, string | undefined> = {
    TB_APP_KEY: process.env.TB_APP_KEY,
    TB_APP_SECRET: process.env.TB_APP_SECRET,
    TB_ADZONE_ID: process.env.TB_ADZONE_ID,
    TB_PID: process.env.TB_PID,
    // 京东可选项占位，避免类型缺失 // JD optional placeholders to satisfy typing
    JD_APP_KEY: process.env.JD_APP_KEY,
    JD_APP_SECRET: process.env.JD_APP_SECRET,
    JD_SITE_ID: process.env.JD_SITE_ID,
    JD_POSITION_ID: process.env.JD_POSITION_ID,
  };

  TB_REQUIRED_KEYS.forEach((key) => {
    if (!envMap[key]) missing.push(key);
  });

  if (missing.length) {
    throw new EnvMissingError(
      `缺少环境变量: ${missing.join(",")}`,
      missing
    );
  }

  return {
    appKey: envMap.TB_APP_KEY as string,
    appSecret: envMap.TB_APP_SECRET as string,
    adzoneId: envMap.TB_ADZONE_ID as string,
    pid: envMap.TB_PID,
  };
};

// 加载京东联盟凭证，缺失时报错 // Load JD Union creds, throw when missing
export const loadJdEnv = (): JdEnv => {
  const envMap = {
    JD_APP_KEY: process.env.JD_APP_KEY,
    JD_APP_SECRET: process.env.JD_APP_SECRET,
    JD_SITE_ID: process.env.JD_SITE_ID,
    JD_POSITION_ID: process.env.JD_POSITION_ID,
  };

  const missing = Object.entries(envMap)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new EnvMissingError(`缺少京东环境变量: ${missing.join(",")}`, missing);
  }

  return {
    appKey: envMap.JD_APP_KEY as string,
    appSecret: envMap.JD_APP_SECRET as string,
    siteId: envMap.JD_SITE_ID as string,
    positionId: envMap.JD_POSITION_ID as string,
  };
};
