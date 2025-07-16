/**
 * 生成随机名称（变量名、函数名等）
 * @param length 名称长度，默认为 8
 * @returns 随机生成的名称
 */
export function generateRandomName(length: number = 8): string {
  // 可用字符集
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const firstChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
  
  // 第一个字符必须是字母或下划线或$（JavaScript/TypeScript）
  let result = firstChars.charAt(Math.floor(Math.random() * firstChars.length));
  
  // 剩余字符可以是字母、数字或下划线
  for (let i = 1; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 生成随机十六进制名称
 * @param length 名称长度，默认为 8
 * @returns 随机生成的十六进制名称
 */
export function generateRandomHexName(length: number = 8): string {
  // 可用字符集
  const chars = 'abcdef0123456789';
  
  // 生成随机十六进制字符串
  let result = '_0x';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 生成随机变量名映射
 * @param names 原始名称数组
 * @returns 名称映射对象 {原始名称: 混淆后名称}
 */
export function generateNameMap(names: string[]): Record<string, string> {
  const nameMap: Record<string, string> = {};
  
  for (const name of names) {
    nameMap[name] = generateRandomName();
  }
  
  return nameMap;
}