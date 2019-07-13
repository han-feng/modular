import Logger from 'js-logger'
import Modular from './Modular'

const logger = Logger.get('modular.core.ExtensionPoint')

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
   * @param extensions 待处理扩展配置对象数组
   * @returns 处理后的扩展配置对象数组
   */
  process(extensions: any[], extensionPoint?: ExtensionPoint, modular?: Modular): any
}

/**
 * 默认的扩展点声明实现类
 */
export class DefaultExtensionPoint implements ExtensionPoint {
  readonly type: string
  module?: string
  modular?: Modular
  /**
   * 原始配置对象
   */
  private readonly extensions: any[] = []
  /**
   * 处理过的配置对象
   */
  private extension: any = null
  /**
   * 预处理器
   */
  private readonly preprocessors: Preprocessor[] = []
  private processed = false

  constructor(point: ExtensionPoint, modular?: Modular) {
    this.type = point.type
    this.module = point.module
    this.modular = modular
  }

  /**
   * 添加扩展
   * @param module 扩展提供模块名称
   * @param extensions 扩展配置集合
   */
  addExtension(module: string, ...extensions: any[]) {
    this.processed = false
    extensions.forEach(item => item['@module'] = module)
    this.extensions.push(...extensions)
  }

  /**
   * 获取扩展配置对象
   * @returns 当扩展点类型为 Multiple 时，返回扩展配置对象数组；
   *          当扩展点类型为 Single 时，返回最后加入的扩展配置对象；
   *          当扩展点类型为 Mixin 时，返回所有扩展配置对象混合后的结果
   */
  getExtension() {
    this.preprocess()
    return this.extension
  }

  /**
   * 获取原始配置对象数组，这些配置对象未经任何加工处理
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

  private preprocess() {
    if (!this.processed) {
      let extension: any = null
      let extensions = this.extensions
      if (extensions && extensions.length && extensions.length > 0) {
        switch (this.type) {
          case Type.Single:
            extension = extensions[extensions.length - 1]
            extensions = this.processExtensions([extension])
            extension = extensions[0]
            break
          case Type.Mixin:
            extensions = this.processExtensions(extensions)
            extension = {}
            extensions.forEach(item => Object.assign(extension, item))
            delete extension['@module']
            break
          case Type.Multiple:
          default:
            extension = extensions
            extension = this.processExtensions(extension)
        }
      }
      this.extension = extension
      this.processed = true
    }
  }

  private processExtensions(extensions: any[]) {
    this.preprocessors.forEach(processor => {
      let result = null
      try {
        result = processor.process(extensions, this, this.modular)
      } catch (error) {
        logger.error(error)
      }
      if (result !== null) {
        extensions = result
      }
    })
    return extensions
  }

}
