import { generateRandomName } from '../utils/nameGenerator';
import { cDataTypes } from '../utils/types';

/**
 * 混淆 C 语言代码
 * @param code 原始代码
 * @returns 混淆后的代码
 */
export function obfuscateC(code: string): string {
  try {
    // 1. 变量名混淆
    let obfuscatedCode = obfuscateVariableNames(code);
    
    // 2. 添加无用代码
    obfuscatedCode = addJunkCode(obfuscatedCode);
    
    // 3. 控制流混淆
    obfuscatedCode = obfuscateControlFlow(obfuscatedCode);
    
    return obfuscatedCode;
  } catch (error) {
    console.error('C 语言混淆失败:', error);
    throw new Error(`C 语言混淆失败: ${(error as Error).message}`);
  }
}

/**
 * 混淆变量名
 * @param code C 代码
 * @returns 混淆后的代码
 */
function obfuscateVariableNames(code: string): string {
  // 简单的变量声明正则表达式
  const typePattern = cDataTypes.join('|');
  const varRegex = new RegExp(`\\b(${typePattern})\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\b`, 'g');
  
  // 存储变量名映射
  const varMap: Record<string, string> = {};
  
  // 替换变量名
  let obfuscatedCode = code.replace(varRegex, (match, type, name) => {
    // 跳过标准库函数名和 main 函数
    if (name === 'main' || isStandardFunction(name)) {
      return match;
    }
    
    // 如果变量名已经有映射，则使用已有的映射
    if (!varMap[name]) {
      varMap[name] = generateRandomName();
    }
    
    return `${type} ${varMap[name]}`;
  });
  
  // 替换变量使用
  for (const [original, obfuscated] of Object.entries(varMap)) {
    // 使用单词边界确保只替换完整的变量名
    const useRegex = new RegExp(`\\b${original}\\b`, 'g');
    obfuscatedCode = obfuscatedCode.replace(useRegex, obfuscated);
  }
  
  return obfuscatedCode;
}

/**
 * 添加无用代码
 * @param code C 代码
 * @returns 添加无用代码后的代码
 */
function addJunkCode(code: string): string {
  // 查找函数体
  const functionBodyRegex = /({[^{}]*(?:{[^{}]*}[^{}]*)*})/g;
  
  return code.replace(functionBodyRegex, (match) => {
    // 在函数体开始处添加无用变量和计算
    // 生成随机变量名并确保使用前已声明
    const intVar = generateRandomName();
    const doubleVar = generateRandomName();
    const junkCode = `
    // 混淆代码
    int ${intVar} = ${Math.floor(Math.random() * 1000)};
    double ${doubleVar} = ${Math.random() * 100};
    if (${Math.random() > 0.5 ? '1' : '0'}) {
        ${intVar} += ${Math.floor(Math.random() * 10)};
    }
    `;
    
    // 在函数体的开始大括号后插入无用代码
    return match.replace('{', `{\n${junkCode}`);
  });
}

/**
 * 混淆控制流
 * @param code C 代码
 * @returns 混淆后的代码
 */
function obfuscateControlFlow(code: string): string {
  // 查找 if 语句
  const ifRegex = /if\s*\((.*?)\)\s*{/g;
  
  return code.replace(ifRegex, (match, condition) => {
    // 生成随机变量名
    const flagVar = generateRandomName();
    
    // 创建更复杂的条件
    const obfuscatedCondition = `
    int ${flagVar} = ${Math.random() > 0.5 ? '1' : '0'};
    if ((${condition}) && (${flagVar} || !${flagVar})) {
    `;
    
    return obfuscatedCondition;
  });
}

/**
 * 检查是否为标准库函数
 * @param name 函数名
 * @returns 是否为标准库函数
 */
function isStandardFunction(name: string): boolean {
  const stdFunctions = [
    'printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc',
    'strlen', 'strcpy', 'strncpy', 'strcmp', 'strncmp',
    'fopen', 'fclose', 'fread', 'fwrite', 'fprintf',
    'exit', 'abort', 'system'
  ];
  
  return stdFunctions.includes(name);
}