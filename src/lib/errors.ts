// 用于描述缺少环境变量的错误 // Describe missing environment variable errors
export class EnvMissingError extends Error {
  missingKeys: string[];

  constructor(message: string, missingKeys: string[]) {
    super(message);
    this.name = "EnvMissingError";
    this.missingKeys = missingKeys;
  }
}
