import { obfuscateJavaScript } from './javascript';
import { obfuscateTypeScript } from './typescript';
import { obfuscateC } from './c';
import { obfuscateCpp } from './cpp';
import { obfuscatePython } from './python';

// 混淆代码的主函数
export async function obfuscateCode(code: string, language: string): Promise<string> {
  // 根据语言选择合适的混淆器
  switch (language.toLowerCase()) {
    case 'javascript':
      return obfuscateJavaScript(code);
    case 'typescript':
      return obfuscateTypeScript(code);
    case 'c':
      return obfuscateC(code);
    case 'cpp':
      return obfuscateCpp(code);
    case 'python':
      return obfuscatePython(code);
    default:
      throw new Error(`不支持的语言: ${language}`);
  }
}

// 导出所有混淆器
export {
  obfuscateJavaScript,
  obfuscateTypeScript,
  obfuscateC,
  obfuscateCpp,
  obfuscatePython
};