document.addEventListener('DOMContentLoaded', () => {
  // 初始化 CodeMirror 编辑器
  const originalEditor = CodeMirror(document.getElementById('original-code'), {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    placeholder: '在此处输入或粘贴代码...'
  });

  const obfuscatedEditor = CodeMirror(document.getElementById('obfuscated-code'), {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    readOnly: true
  });

  // 获取 DOM 元素
  const languageSelect = document.getElementById('language');
  const fileInput = document.getElementById('file-input');
  const obfuscateBtn = document.getElementById('obfuscate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const clearBtn = document.getElementById('clear-btn');
  const loadingOverlay = document.getElementById('loading-overlay');

  // 语言选择变更时更新编辑器模式
  languageSelect.addEventListener('change', () => {
    updateEditorMode(originalEditor, languageSelect.value);
    updateEditorMode(obfuscatedEditor, languageSelect.value);
  });

  // 文件上传处理
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 根据文件扩展名自动选择语言
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const language = getLanguageFromExtension(fileExtension);
    if (language) {
      languageSelect.value = language;
      updateEditorMode(originalEditor, language);
      updateEditorMode(obfuscatedEditor, language);
    }

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = (e) => {
      originalEditor.setValue(e.target.result);
    };
    reader.readAsText(file);
  });

  // 混淆按钮点击事件
  obfuscateBtn.addEventListener('click', async () => {
    const code = originalEditor.getValue();
    if (!code.trim()) {
      alert('请输入代码后再进行混淆');
      return;
    }

    const language = languageSelect.value;
    
    // 显示加载动画
    loadingOverlay.style.display = 'flex';
    
    try {
      const response = await fetch('/api/obfuscate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        obfuscatedEditor.setValue(data.obfuscatedCode);
      } else {
        alert(`混淆失败: ${data.error}`);
        console.error('混淆错误:', data.error);
      }
    } catch (error) {
      alert(`请求错误: ${error.message}`);
      console.error('请求错误:', error);
    } finally {
      // 隐藏加载动画
      loadingOverlay.style.display = 'none';
    }
  });

  // 复制按钮点击事件
  copyBtn.addEventListener('click', () => {
    const obfuscatedCode = obfuscatedEditor.getValue();
    if (!obfuscatedCode.trim()) {
      alert('没有可复制的混淆代码');
      return;
    }
    
    navigator.clipboard.writeText(obfuscatedCode)
      .then(() => {
        alert('混淆代码已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  });

  // 下载按钮点击事件
  downloadBtn.addEventListener('click', () => {
    const obfuscatedCode = obfuscatedEditor.getValue();
    if (!obfuscatedCode.trim()) {
      alert('没有可下载的混淆代码');
      return;
    }
    
    const language = languageSelect.value;
    const extension = getExtensionFromLanguage(language);
    const blob = new Blob([obfuscatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `obfuscated${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // 清空按钮点击事件
  clearBtn.addEventListener('click', () => {
    originalEditor.setValue('');
    obfuscatedEditor.setValue('');
    fileInput.value = '';
  });

  // 根据语言更新编辑器模式
  function updateEditorMode(editor, language) {
    let mode;
    switch (language) {
      case 'javascript':
        mode = 'javascript';
        break;
      case 'typescript':
        mode = 'text/typescript';
        break;
      case 'c':
        mode = 'text/x-csrc';
        break;
      case 'cpp':
        mode = 'text/x-c++src';
        break;
      case 'python':
        mode = 'python';
        break;
      default:
        mode = 'javascript';
    }
    editor.setOption('mode', mode);
  }

  // 根据文件扩展名获取语言
  function getLanguageFromExtension(extension) {
    const extensionMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'c': 'c',
      'h': 'c',
      'cpp': 'cpp',
      'cc': 'cpp',
      'hpp': 'cpp',
      'py': 'python'
    };
    return extensionMap[extension] || null;
  }

  // 根据语言获取文件扩展名
  function getExtensionFromLanguage(language) {
    const languageMap = {
      'javascript': '.js',
      'typescript': '.ts',
      'c': '.c',
      'cpp': '.cpp',
      'python': '.py'
    };
    return languageMap[language] || '.txt';
  }
});