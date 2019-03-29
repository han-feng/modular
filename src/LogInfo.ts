import { template, TemplateExecutor } from 'lodash'

export default class LogInfo {
  static readonly CODES: {[index: string]: TemplateExecutor} = {
    E01: template('模块名称未定义 ${JSON.stringify(m)}'),
    E02: template('模块名称重复 ${JSON.stringify(m1)}, ${JSON.stringify(m2)}'),
    E03: template('“${m1.name}”依赖的模块“${m2}”解析失败'),
    E04: template('“${m1.name}”依赖的模块“${m2}”不存在'),
    E05: template('模块“${m.name}”声明了重复的 extensionPoint “${ep}”'),
    E06: template('模块“${m.name}”引用了不存在的 extensionPoint “${ep}”'),
  }
  constructor(
    public code: string,
    public level: string = 'error',
    public data?: any
  ) {}
  getMessage() {
    const t = LogInfo.CODES[this.code]
    if (t) {
      return t(this.data)
    } else {
      return '未知异常'
    }
  }
  toString() {
    return `[${this.code}] ${this.getMessage()}`
  }
}
