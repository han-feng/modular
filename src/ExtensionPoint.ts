/**
 * 扩展点类型，默认值为 array，可选值有以下几种：
 * array: 数组形式，支持多值，所有扩展配置都有效；
 * mixin: 混合形式，由多个扩展配置混合形成最后有效的配置；
 * single: 单一对象，只有最后的扩展配置有效
 */
export const Type = Object.freeze({
  Single: 'SINGLE',
  Mixin: 'MIXIN',
  Multiple: 'MULTIPLE'
})

/**
 * 扩展点声明接口
 */
export interface ExtensionPoint {
  type: string
  module?: string
}

/**
 * 扩展配置预处理器接口
 */
export interface Preprocessor {
  /**
   * 扩展配置预处理
   * @param extension 待处理扩展配置对象
   * @returns 处理后的扩展配置对象，对应于 DefaultExtensionPoint.getExtension() 方法的返回值
   */
  process(extension: any, extensionPoint: DefaultExtensionPoint): any
}

/**
 * 默认的扩展点声明实现类
 */
export class DefaultExtensionPoint implements ExtensionPoint {
  readonly type: string
  module?: string

  private extensions: any[] = []
  private extension: any = {}
  private preprocessors: Preprocessor[] = []
  private processed = false

  constructor(point: ExtensionPoint) {
    this.type = point.type
    this.module = point.module
  }

  /**
   * 添加扩展
   * @param extensions 扩展配置集合
   */
  addExtension(...extensions: any[]) {
    this.processed = false
    this.extensions.push(...extensions)
    switch (this.type) {
      case Type.Single:
        this.extension = extensions[extensions.length - 1]
        break
      case Type.Mixin:
        extensions.forEach(item => Object.assign(this.extension, item))
        break
      case Type.Multiple:
      default:
    }
  }

  /**
   * 获取扩展
   * @returns 当扩展点类型为 Multiple 时，返回扩展配置对象数组；
   *          当扩展点类型为 Single 时，返回最后加入的扩展配置对象；
   *          当扩展点类型为 Mixin 时，返回所有扩展配置对象混合后的结果
   */
  getExtension() {
    if (this.processed) {
      return this.extension
    } else {
      let extension: any = null
      switch (this.type) {
        case Type.Single:
        case Type.Mixin:
          extension = this.extension
          break
        case Type.Multiple:
        default:
          extension = this.extensions
      }
      this.preprocessors.forEach(processor => {
        const result = processor.process(extension, this)
        if (result !== null) {
          extension = result
        }
      })
      this.extension = extension
      this.processed = true
      return extension
    }
  }

  /**
   * 获取全部扩展的原始配置对象，这些配置对象未进行预处理加工
   * @deprecated
   */
  getExtensions() {
    return this.extensions
  }

  /**
   * 添加预处理器
   * @param proprocessors 预处理器集合
   */
  addPreprocessors(...proprocessors: Preprocessor[]) {
    this.processed = false
    this.preprocessors.push(...proprocessors)
  }

}
