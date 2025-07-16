import express from 'express';
import multer from 'multer';
import { obfuscateCode } from '../obfuscators';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 处理代码混淆请求
router.post('/obfuscate', upload.single('file'), async (req, res) => {
  try {
    const { language } = req.body;
    let code: string;

    // 获取代码内容（从文件或直接从请求体）
    if (req.file) {
      code = req.file.buffer.toString('utf-8');
    } else if (req.body.code) {
      code = req.body.code;
    } else {
      return res.status(400).json({ error: '没有提供代码' });
    }

    // 检查语言是否支持
    if (!language) {
      return res.status(400).json({ error: '没有指定编程语言' });
    }

    // 混淆代码
    const obfuscatedCode = await obfuscateCode(code, language);

    // 返回混淆后的代码
    res.json({ success: true, obfuscatedCode });
  } catch (error) {
    console.error('混淆过程中出错:', error);
    res.status(500).json({ error: '混淆过程中出错', details: (error as Error).message });
  }
});

// 获取支持的语言列表
router.get('/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'javascript', name: 'JavaScript' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'c', name: 'C' },
      { id: 'cpp', name: 'C++' },
      { id: 'python', name: 'Python' }
    ]
  });
});

export default router;