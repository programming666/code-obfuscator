import * as jsObfuscator from 'javascript-obfuscator';

/**
 * 混淆 JavaScript 代码
 * @param code 原始代码
 * @returns 混淆后的代码
 */
export function obfuscateJavaScript(code: string): string {
  try {
    // 混淆选项
    const obfuscationOptions = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.7,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal' as const,
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'] as any,
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function' as any,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    };

    // 执行混淆
    const obfuscationResult = jsObfuscator.obfuscate(code, obfuscationOptions);
    
    // 返回混淆后的代码
    return obfuscationResult.getObfuscatedCode();
  } catch (error) {
    console.error('JavaScript 混淆失败:', error);
    throw new Error(`JavaScript 混淆失败: ${(error as Error).message}`);
  }
}