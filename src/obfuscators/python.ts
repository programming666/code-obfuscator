import { generateRandomName } from '../utils/nameGenerator';

/**
 * 混淆 Python 代码
 * @param code 原始代码
 * @returns 混淆后的代码
 */
export function obfuscatePython(code: string): string {
  try {
    // 1. 变量名混淆
    let obfuscatedCode = obfuscateVariableNames(code);
    
    // 2. 字符串加密
    obfuscatedCode = encryptStrings(obfuscatedCode);
    
    // 3. 添加无用代码
    obfuscatedCode = addJunkCode(obfuscatedCode);
    
    // 4. 控制流混淆
    obfuscatedCode = obfuscateControlFlow(obfuscatedCode);
    
    return obfuscatedCode;
  } catch (error) {
    console.error('Python 混淆失败:', error);
    throw new Error(`Python 混淆失败: ${(error as Error).message}`);
  }
}

/**
 * 混淆变量名
 * @param code Python 代码
 * @returns 混淆后的代码
 */
function obfuscateVariableNames(code: string): string {
  // 变量声明正则表达式 (简化版，实际上需要更复杂的解析)
  const varRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;
  
  // 存储变量名映射
  const varMap: Record<string, string> = {};
  
  // 需要保留的内置名称和常用库
  const reservedNames = [
    'self', 'cls', 'print', 'input', 'len', 'range', 'list', 'dict', 'set',
    'int', 'str', 'float', 'bool', 'True', 'False', 'None', 'and', 'or', 'not',
    'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with',
    'def', 'class', 'return', 'yield', 'from', 'import', 'as', 'global', 'nonlocal'
  ];
  
  // 替换变量名
  let obfuscatedCode = code.replace(varRegex, (match, name) => {
    // 跳过保留名称
    if (reservedNames.includes(name)) {
      return match;
    }
    
    // 如果变量名已经有映射，则使用已有的映射
    if (!varMap[name]) {
      varMap[name] = generateRandomName();
    }
    
    return `${varMap[name]} =`;
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
 * 加密字符串
 * @param code Python 代码
 * @returns 混淆后的代码
 */
function encryptStrings(code: string): string {
  // 字符串正则表达式 (简化版，不处理转义字符和多行字符串)
  const stringRegex = /(["'])((?:\\\1|.)*?)\1/g;
  
  // 添加字符串解密函数
  const decoderFunction = `
# 字符串解码函数
def ${generateRandomName()}(s):
    return ''.join(chr(ord(c) ^ 0x33) for c in s)
`;
  
  // 解码函数名
  const decoderName = decoderFunction.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/)?.[1] || 'decode';
  
  // 替换字符串为加密版本
  let obfuscatedCode = code.replace(stringRegex, (match, quote, content) => {
    // 跳过空字符串
    if (!content) {
      return match;
    }
    
    // 简单的 XOR 加密
    const encrypted = Array.from(content)
      .map((c) => {
        if (typeof c === 'string') {
          return String.fromCharCode(c.charCodeAt(0) ^ 0x33);
        }
        return '';
      })
      .join('');
    
    return `${decoderName}("${encrypted}")`;
  });
  
  // 在代码开头添加解码函数
  obfuscatedCode = decoderFunction + obfuscatedCode;
  
  return obfuscatedCode;
}

/**
 * 添加无用代码
 * @param code Python 代码
 * @returns 添加无用代码后的代码
 */
function addJunkCode(code: string): string {
  // 生成随机变量名
  const junkVar1 = generateRandomName();
  const junkVar2 = generateRandomName();
  const junkVar3 = generateRandomName();
  
  // 创建无用代码
  const junkCode = `
# 混淆代码
${junkVar1} = ${Math.floor(Math.random() * 1000)}
${junkVar2} = "${Array(10).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')}"
${junkVar3} = [${Array(5).fill(0).map(() => Math.floor(Math.random() * 100)).join(', ')}]
if ${junkVar1} > ${Math.floor(Math.random() * 2000)}:
    ${junkVar2} += "${generateRandomName()}"
else:
    ${junkVar3}.append(${Math.floor(Math.random() * 100)})
`;
  
  // 在代码中随机位置插入无用代码
  const lines = code.split('\n');
  const insertPosition = Math.floor(Math.random() * lines.length);
  lines.splice(insertPosition, 0, junkCode);
  
  return lines.join('\n');
}

/**
 * 混淆控制流
 * @param code Python 代码
 * @returns 混淆后的代码
 */
function obfuscateControlFlow(code: string): string {
  // if 语句正则表达式 (简化版)
  const ifRegex = /\bif\s+(.*?):/g;
  
  return code.replace(ifRegex, (match, condition) => {
    // 生成随机变量名
    const flagVar = generateRandomName();
    
    // 创建更复杂的条件
    return `${flagVar} = True\nif ${flagVar} and (${condition}):`;
  });
}