// C语言数据类型定义（包含复合类型）
export const cDataTypes = [
  'long long', 'long double', // 复合类型优先
  'int', 'float', 'double', 'char', 'long', 'short', 
  'unsigned', 'signed', 'void', 'struct', 'enum'
];

// C++数据类型定义（继承C类型并扩展）
export const cppDataTypes = [
  ...cDataTypes.filter(type => !['struct', 'enum'].includes(type)), // 排除C特有类型
  'bool', 'auto', 'string', 'vector', 'map', 'set', 
  'list', 'deque', 'queue', 'stack'
];