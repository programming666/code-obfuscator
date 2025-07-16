import * as ts from 'typescript';
import { obfuscateJavaScript } from './javascript';

/**
 * 混淆 TypeScript 代码
 * @param code 原始代码
 * @returns 混淆后的代码
 */
export function obfuscateTypeScript(code: string): string {
  try {
    // TypeScript 编译选项
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      removeComments: true,
    };

    // 将 TypeScript 编译为 JavaScript
    const result = ts.transpileModule(code, { compilerOptions });
    const jsCode = result.outputText;

    // 使用 JavaScript 混淆器混淆编译后的代码
    return obfuscateJavaScript(jsCode);
  } catch (error) {
    console.error('TypeScript 混淆失败:', error);
    throw new Error(`TypeScript 混淆失败: ${(error as Error).message}`);
  }
}