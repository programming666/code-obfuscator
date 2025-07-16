import { generateRandomName } from '../utils/nameGenerator';
import { cppDataTypes } from '../utils/types';

/**
 * 混淆 C++ 代码
 * @param code 原始代码
 * @returns 混淆后的代码
 */
export function obfuscateCpp(code: string): string {
    try {
      // 提取并保留宏定义
      const macros: string[] = [];
      let macroCounter = 0;
      let codeWithPlaceholders = code.replace(/#define.*$/gm, match => {
        const placeholder = `/*MACRO_${macroCounter}*/`;
        macros.push(match);
        macroCounter++;
        return placeholder;
      });
      
      // 1. 变量名混淆
      let obfuscatedCode = obfuscateVariableNames(codeWithPlaceholders);
      
      // 2. 混淆类和成员
      obfuscatedCode = obfuscateClasses(obfuscatedCode);
    
    // 3. 混淆命名空间
    obfuscatedCode = obfuscateNamespaces(obfuscatedCode);
    
    // 4. 混淆模板
    obfuscatedCode = obfuscateTemplates(obfuscatedCode);
    
    // 5. 添加无意义代码
    obfuscatedCode = addJunkCode(obfuscatedCode);
    
    // 6. 控制流混淆
    obfuscatedCode = obfuscateControlFlow(obfuscatedCode);
    
    // 恢复宏定义
      for (let i = 0; i < macros.length; i++) {
        obfuscatedCode = obfuscatedCode.replace(`/*MACRO_${i}*/`, macros[i]);
      }
      
      return obfuscatedCode;
    } catch (error) {
    console.error('C++ 混淆失败:', error);
    throw new Error(`C++ 混淆失败: ${(error as Error).message}`);
  }
}

/**
 * 混淆变量名
 * @param code C++ 代码
 * @returns 混淆后的代码
 */
function addJunkCode(code: string): string {
  const junkFunctions = [
    `void ${generateRandomName()}() { int ${generateRandomName()} = 0; }`,
    `int ${generateRandomName()}() { return ${Math.floor(Math.random() * 100)}; }`,
    `float ${generateRandomName()}() { return ${Math.random()}; }`
  ];
  return code + '\n' + junkFunctions.join('\n');
}

function obfuscateControlFlow(code: string): string {
  // 保护C++关键字不被替换
  const ifRegex = /\bif\s*\((.*?)\)\s*\{/g;
  return code.replace(ifRegex, (match, condition) => {
    const flagVar = generateRandomName();
    return `int ${flagVar} = ${Math.random() > 0.5 ? 1 : 0};\nif (${flagVar} && (${condition})) {`;
  });
}

function obfuscateVariableNames(code: string): string {
  // 变量声明正则表达式 (包括C++类型)
  const typePattern = cppDataTypes.join('|');
  // 排除宏定义和标准库函数
  // 扩展标准函数列表
  const stdFunctions = ['getchar', 'printf', 'scanf', 'puts', 'fopen', 'fclose', 'fread', 'fwrite', 'read'];
  // C++关键字列表，防止被重命名
  const cppKeywords = ['if', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'int', 'long', 'double', 'float', 'bool', 'void', 'char', 'short', 'unsigned', 'signed', 'const', 'static', 'inline', 'namespace', 'class', 'struct', 'enum', 'template', 'typename', 'public', 'private', 'protected', 'this', 'new', 'delete', 'sizeof', 'typeof'];
  const varRegex = new RegExp(`\\b(${typePattern})\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\b(?!\\s*\\()`, 'g');
  

  // 存储变量名映射
  const varMap: Record<string, string> = {};

  // 替换变量名
  let obfuscatedCode = code.replace(varRegex, (match, type, name) => {
    // 跳过 main 函数
    // 保护main函数和标准库函数不被重命名
    if (name === 'main' || stdFunctions.includes(name)) {
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
 * 混淆类名和成员
 * @param code C++ 代码
 * @returns 混淆后的代码
 */
function obfuscateClasses(code: string): string {
  // 类声明正则表达式
  const classRegex = /\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*(?:public|protected|private)\s+([a-zA-Z_][a-zA-Z0-9_]*))?\s*{/g;
  
  // 存储类名映射
  const classMap: Record<string, string> = {};
  
  // 替换类名
  let obfuscatedCode = code.replace(classRegex, (match, className, parentClass) => {
    // 跳过标准库类
    if (isStandardType(className)) {
      return match;
    }
    
    // 如果类名已经有映射，则使用已有的映射
    if (!classMap[className]) {
      classMap[className] = generateRandomName();
    }
    
    if (parentClass && !classMap[parentClass]) {
      // 如果父类名没有映射，保持原样
      return `class ${classMap[className]} : public ${parentClass} {`;
    } else if (parentClass) {
      // 如果父类名有映射
      return `class ${classMap[className]} : public ${classMap[parentClass] || parentClass} {`;
    } else {
      // 没有父类
      return `class ${classMap[className]} {`;
    }
  });
  
  // 替换类名的使用
  for (const [original, obfuscated] of Object.entries(classMap)) {
    // 使用单词边界确保只替换完整的类名
    const useRegex = new RegExp(`\\b${original}\\b`, 'g');
    obfuscatedCode = obfuscatedCode.replace(useRegex, obfuscated);
  }
  
  // 混淆类成员变量
  const memberVarRegex = /\b(public|protected|private):\s*([a-zA-Z_][a-zA-Z0-9_:<>]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g;
  
  const memberVarMap: Record<string, string> = {};
  
  obfuscatedCode = obfuscatedCode.replace(memberVarRegex, (match, access, type, name) => {
    if (!memberVarMap[name]) {
      memberVarMap[name] = generateRandomName();
    }
    return `${access}: ${type} ${memberVarMap[name]};`;
  });
  
  // 混淆类方法
  // 排除main函数和标准库函数
  // 增强main函数保护
  // 完善标准函数排除
  // 排除循环和控制流关键字
  // 移除错误的排除项MaBwnMGM
  const methodRegex = /\b(?!main\b)(?!getchar\b)(?!printf\b)(?!read\b)(?!for\b)(?!while\b)(?!do\b)(?!switch\b)([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(const)?\s*(override)?\s*(final)?\s*(?:{|;)/g;
  
  const methodMap: Record<string, string> = {};
  
  obfuscatedCode = obfuscatedCode.replace(methodRegex, (match, name, params, isConst, isOverride, isFinal) => {
    // 跳过构造函数和析构函数
    if (Object.values(classMap).includes(name) || name.startsWith('~')) {
      return match;
    }
    
    if (!methodMap[name]) {
      methodMap[name] = generateRandomName();
    }
    
    const constPart = isConst ? ' const' : '';
    const overridePart = isOverride ? ' override' : '';
    const finalPart = isFinal ? ' final' : '';
    
    if (match.endsWith('{')) {
      return `${methodMap[name]}(${params})${constPart}${overridePart}${finalPart} {`;
    } else {
      return `${methodMap[name]}(${params})${constPart}${overridePart}${finalPart};`;
    }
  });
  
  // 替换成员变量和方法使用
  for (const [original, obfuscated] of Object.entries({...memberVarMap, ...methodMap})) {
    // 使用单词边界确保只替换完整的成员名
    const useRegex = new RegExp(`\\b${original}\\b`, 'g');
    obfuscatedCode = obfuscatedCode.replace(useRegex, obfuscated);
  }
  
  return obfuscatedCode;
}

/**
 * 混淆命名空间
 * @param code C++ 代码
 * @returns 混淆后的代码
 */
function obfuscateNamespaces(code: string): string {
  // 命名空间声明正则表达式
  const namespaceRegex = /\bnamespace\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*{/g;
  
  // 存储命名空间映射
  const namespaceMap: Record<string, string> = {};
  
  // 替换命名空间名
  let obfuscatedCode = code.replace(namespaceRegex, (match, namespaceName) => {
    // 跳过标准库命名空间
    if (namespaceName === 'std') {
      return match;
    }
    
    // 如果命名空间名已经有映射，则使用已有的映射
    if (!namespaceMap[namespaceName]) {
      namespaceMap[namespaceName] = generateRandomName();
    }
    
    return `namespace ${namespaceMap[namespaceName]} {`;
  });
  
  // 替换命名空间的使用
  for (const [original, obfuscated] of Object.entries(namespaceMap)) {
    // 使用单词边界确保只替换完整的命名空间名
    const useRegex = new RegExp(`\\b${original}::`, 'g');
    obfuscatedCode = obfuscatedCode.replace(useRegex, `${obfuscated}::`);
  }
  
  return obfuscatedCode;
}

/**
 * 混淆模板
 * @param code C++ 代码
 * @returns 混淆后的代码
 */
function obfuscateTemplates(code: string): string {
  // 模板声明正则表达式 (简化版，实际上需要更复杂的解析)
  const templateRegex = /\btemplate\s*<\s*(?:class|typename)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*>/g;
  
  // 存储模板参数映射
  const templateMap: Record<string, string> = {};
  
  // 替换模板参数名
  return code.replace(templateRegex, (match, templateParam) => {
    // 如果模板参数名已经有映射，则使用已有的映射
    if (!templateMap[templateParam]) {
      templateMap[templateParam] = generateRandomName();
    }
    
    return `template<class ${templateMap[templateParam]}>`;
  });
}

/**
 * 检查是否为标准库类型
 * @param typeName 类型名
 * @returns 是否为标准库类型
 */
function isStandardType(typeName: string): boolean {
  const stdTypes = [
    'string', 'vector', 'map', 'set', 'list', 'deque', 'queue', 'stack',
    'array', 'bitset', 'pair', 'tuple', 'unique_ptr', 'shared_ptr', 'weak_ptr'
  ];
  
  return stdTypes.includes(typeName);
}