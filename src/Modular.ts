import Logger from 'js-logger'
import LogInfo from './LogInfo'
import ModulesLoader from './ModulesLoader'
import { ExtensionPoint, DefaultExtensionPoint, Type, Preprocessor } from './ExtensionPoint'

const logger = Logger.get('modular.core.Modular')

export interface Activator {
  start(modular: Modular, module: ModuleConfig): void
}

export interface ModuleConfig {
  name: string
  dependencies?: string[]
  extensionPoints?: { [index: string]: ExtensionPoint }
  extensions?: { [index: string]: any }
  preprocessors?: { [index: string]: Preprocessor }
  activator?: Activator
}

export interface ApplicationConfig extends ModuleConfig {
  version?: string
}

export interface ModularOptions {
  modules: ModuleConfig[]
  application?: ApplicationConfig
  strict?: boolean
}

/**
 * 模块化应用实现类
 */
export default class Modular {
  public readonly strict: boolean
  private inited: boolean = false
  private readonly logs: LogInfo[] = [] // 记录处理过程中产生的日志信息
  private application: ApplicationConfig
  private modules: ModuleConfig[]
  private extensionPoints: { [index: string]: DefaultExtensionPoint } = {}
  private attributes: { [index: string]: any } = {}

  /**
   * 构造函数
   * @param config 初始配置
   */
  constructor(options?: ModularOptions) {
    options = options || { modules: [] }
    this.strict = !!options.strict // 严格模式，暂未使用，保留
    this.modules = options.modules || []
    this.application = options.application || { name: 'Application' }
    this.init()
  }

  /**
   * 获取应用配置
   */
  getApplication() {
    return this.application
  }

  /**
   * 获取指定名称的模块配置
   * @param name 模块名称
   */
  getModule(name: string) {
    return this.modules.find(
      (module: ModuleConfig): boolean => module.name === name
    )
  }

  /**
   * 获取全部模块配置
   */
  getModules() {
    return this.modules
  }

  /**
   * 获取指定名称的扩展配置对象
   * @param name 扩展点名称
   * @returns 当扩展点类型为 Multiple 时，返回扩展配置对象数组；
   *          当扩展点类型为 Single 时，返回最后加入的扩展配置对象；
   *          当扩展点类型为 Mixin 时，返回所有扩展配置对象混合后的结果
   */
  getExtension(name: string) {
    const point = this.getExtensionPoint(name)
    if (point !== null) {
      return point.getExtension()
    }
    return null
  }

  /**
   * 获取原始配置对象数组，这些配置对象未经任何加工处理
   * @param name 扩展点名称
   */
  getExtensions(name: string) {
    const point = this.getExtensionPoint(name)
    if (point !== null) {
      return point.getExtensions()
    }
    return null
  }

  /**
   * 获取指定名称的扩展点定义
   * @param name 扩展点名称
   */
  getExtensionPoint(name: string) {
    const point = this.extensionPoints[name]
    if (point === undefined) {
      return null
    }
    return point
  }

  /**
   * 获取全部有效的扩展点定义
   */
  getExtensionPoints() {
    return this.extensionPoints
  }

  /**
   * 获取属性名集合
   */
  getAttributeNames() {
    return Object.keys(this.attributes)
  }

  /**
   * 设置属性
   * @param name 属性名
   * @param value 属性值
   */
  setAttribute(name: string, value: any) {
    this.attributes[name] = value
  }

  /**
   * 获取属性值
   * @param name 属性名
   */
  getAttribute(name: string) {
    return this.attributes[name]
  }

  /**
   * 启动模块化应用
   */
  start() {
    logger.debug('Modular starting ...')
    this.modules.forEach(module => {
      if (module.activator && module.activator.start) {
        module.activator.start(this, module)
      }
    })
    logger.debug('Modular started')
  }

  /**
   * 获取日志记录
   */
  getLogs() {
    return Object.freeze(this.logs) as LogInfo[]
  }

  /**
   * 记录日志
   * @param info 日志信息对象
   */
  private log(info: LogInfo) {
    this.logs.push(info)
    logger.error(info)
  }

  /**
   * 创建模块名称映射集合
   * @param modules 模块配置对象集合
   */
  private createNameMapping(modules: ModuleConfig[]) {
    const nameMapping: { [index: string]: ModuleConfig } = {}
    modules.forEach(module => {
      if (module.name === undefined || module.name === '') {
        this.log(new LogInfo('E01', 'error', { m: module }))
        return
      }
      const name = module.name
      if (nameMapping[name]) {
        this.log(
          new LogInfo('E02', 'error', { m1: nameMapping[name], m2: module })
        )
        return
      }
      nameMapping[name] = module
    })
    return nameMapping
  }

  /**
   * 初始化
   */
  private init() {
    if (this.inited) {
      // 防止初始化两次
      this.log(new LogInfo('E00', 'error'))
      return
    }
    logger.debug('Modular init')
    const app = this.application
    let modules = this.modules

    // 建立 name 查询索引
    const nameMapping: {
      [index: string]: ModuleConfig
    } = this.createNameMapping(modules)
    // 解析依赖，模块排序
    const modulesLoader = new ModulesLoader()
    modules.forEach(module => {
      this.loadDepens(module, modulesLoader, nameMapping)
    })
    // 处理应用配置
    this.loadDepens(app, modulesLoader, nameMapping)

    modules = modulesLoader.getModules()

    // 组装扩展配置
    const points: { [index: string]: DefaultExtensionPoint } = {}
    const len = modules.length
    for (let i = 0; i < len; i++) {
      const module = modules[i]
      if (module.extensionPoints) {
        const ps = module.extensionPoints
        for (const name in ps) {
          if (points[name]) {
            this.log(new LogInfo('E05', 'error', { m: module, ep: name }))
          } else {
            const point = new DefaultExtensionPoint(ps[name], this)
            point.module = module.name
            points[name] = point
          }
        }
      }
      if (module.preprocessors) {
        const processors = module.preprocessors
        for (const name in processors) {
          if (points[name]) {
            points[name].addPreprocessors(processors[name])
          } else {
            this.log(new LogInfo('E06', 'error', { m: module, ep: name }))
          }
        }
      }
      if (module.extensions) {
        const ext = module.extensions
        for (const name in ext) {
          if (points[name]) {
            if (points[name].type === Type.Multiple && Array.isArray(ext[name])) {
              points[name].addExtension(module.name, ...ext[name])
            } else {
              points[name].addExtension(module.name, ext[name])
            }
          } else {
            this.log(new LogInfo('E06', 'error', { m: module, ep: name }))
          }
        }
      }
      modules[i] = Object.freeze(module)
    }
    this.application = Object.freeze(app) // 应用配置
    this.modules = Object.freeze(modules) as ModuleConfig[]
    this.extensionPoints = Object.freeze(points)
    this.inited = true
  }

  /**
   * 深度遍历加载 Modules
   * @param module 当前模块
   * @param modulesLoader 模块加载器
   * @param nameMapping 模块名称索引
   * @param cache 当前处理中的模块缓存
   */
  private loadDepens(
    module: ModuleConfig,
    modulesLoader: ModulesLoader,
    nameMapping: { [index: string]: ModuleConfig },
    cache: { [index: string]: ModuleConfig } = {}
  ) {
    if (module.name === undefined || module.name === '') {
      return false
    }
    if (modulesLoader.contains(module)) {
      return true
    }
    if (module.dependencies && module.dependencies.length) {
      module.dependencies = Object.freeze(module.dependencies) as string[]
      const ds = module.dependencies
      const dslen = ds.length
      for (let i = 0; i < dslen; i++) {
        const d = ds[i]
        if (nameMapping[d]) {
          if (cache[d]) {
            // 正在处理中的cache包含依赖项，说明出现循环依赖的情况，跳过
            return true
          }
          cache[d] = nameMapping[d]
          if (
            this.loadDepens(nameMapping[d], modulesLoader, nameMapping, cache)
          ) {
            delete cache[d]
            // 依赖项加载成功
            continue
          } else {
            this.log(new LogInfo('E03', 'error', { m1: module, m2: d }))
            return false
          }
        } else {
          this.log(new LogInfo('E04', 'error', { m1: module, m2: d }))
          return false
        }
      }
      // 依赖项全部加载成功
    }
    modulesLoader.add(module)
    return true
  }
}
