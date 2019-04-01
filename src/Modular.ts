import ModuleConfig from './ModuleConfig'
import ApplicationConfig from './ApplicationConfig'
import Config from './Config'
import LogInfo from './LogInfo'
import ModulesLoader from './ModulesLoader'
import ExtensionPoint from './ExtensionPoint'

/**
 * 模块化应用实现类
 */
export default class Modular {
  public strict: boolean
  private logs: LogInfo[] = [] // 记录处理过程中产生的日志信息
  private application: ApplicationConfig
  private modules: ModuleConfig[]
  private extensionPoints: { [index: string]: ExtensionPoint } = {}
  private extensions: { [index: string]: any } = {}
  private extensionConfigs: { [index: string]: Array<{ _module: string, [index: string]: any}> } = {}

  /**
   * 构造函数
   * @param config 初始配置
   */
  constructor(config?: Config) {
    config = config || new Config()
    this.strict = !!config.strict // 严格模式，暂未使用，保留
    this.modules = config.modules || []
    this.application = config.application || new ApplicationConfig()
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
    return this.modules.find((module: ModuleConfig): boolean => module.name === name)
  }

  /**
   * 获取全部模块配置
   */
  getModules() {
    return this.modules
  }

  /**
   * 获取指定名称的有效扩展配置（对象形式）
   * @param name 扩展点名称
   */
  getExtension(name: string) {
    return this.extensions[name] || {}
  }

  /**
   * 获取全部有效的扩展配置（对象形式）
   */
  getExtensions() {
    return this.extensions
  }

  /**
   * 获取指定名称的全部扩展配置（数组形式）
   * @param name 扩展点名称
   */
  getExtensionConfig(name: string) {
    return this.extensionConfigs[name] || []
  }

  /**
   * 获取全部扩展配置（数组形式）
   */
  getExtensionConfigs() {
    return this.extensionConfigs
  }

  /**
   * 获取指定名称的扩展点定义
   * @param name 扩展点名称
   */
  getExtensionPoint(name: string) {
    return this.extensionPoints[name] || {}
  }

  /**
   * 获取全部有效的扩展点定义
   */
  getExtensionPoints() {
    return this.extensionPoints
  }

  /**
   * 启动模块化应用
   */
  start() {
    this.modules.forEach(module => {
      if (module.activator && module.activator.start) {
        module.activator.start(this, module)
      }
    })
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
    // tslint:disable-next-line:no-console
    // console.log(info.toString())
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
        this.log(new LogInfo('E02', 'error', { m1: nameMapping[name], m2: module }))
        return
      }
      nameMapping[name] = module
    })
    return nameMapping;
  }

  /**
   * 初始化
   */
  private init() {
    const app = this.application
    let modules = this.modules

    // 建立 name 查询索引
    const nameMapping: { [index: string]: ModuleConfig } = this.createNameMapping(modules)
    // 解析依赖，模块排序
    const modulesLoader = new ModulesLoader()
    // TODO 处理优先加载模块
    // modulesLoader.add(nameMapping['modular-core'])
    modules.forEach(module => {
      this.loadDepens(module, modulesLoader, nameMapping)
    })
    // 处理应用配置
    this.loadDepens(app, modulesLoader, nameMapping)

    modules = modulesLoader.getModules()

    // 组装扩展配置
    const points: { [index: string]: ExtensionPoint } = {}
    const extens: { [index: string]: any } = {}
    const extenConfigs: { [index: string]: any } = {}
    const len = modules.length
    for (let i = 0; i < len; i++) {
      const module = modules[i]
      if (module.extensionPoints) {
        module.extensionPoints = Object.freeze(module.extensionPoints)
        const ps = module.extensionPoints
        for (const name in ps) {
          if (points[name]) {
            this.log(new LogInfo('E05', 'error', { m: module, ep: name } ))
          } else {
            points[name] = { ...ps[name], module: module.name }
          }
        }
      }
      if (module.extensions) {
        module.extensions = Object.freeze(module.extensions)
        const ext = module.extensions
        for (const name in ext) {
          if (points[name]) {
            extens[name] = extens[name] || {} // 初始化key对应的配置对象
            extenConfigs[name] = extenConfigs[name] || [] // 初始化key对应的配置数组
            const allConfig = extens[name]
            const currConfig = Object.assign({}, ext[name])
            Object.assign(allConfig, currConfig) // 混合配置对象
            currConfig._module = module.name
            extenConfigs[name].push(Object.freeze(currConfig))
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
    this.extensions = Object.freeze(extens)
    this.extensionConfigs = Object.freeze(extenConfigs)
  }

  /**
   * 深度遍历加载 Modules
   * @param module 当前模块
   * @param modulesLoader 模块加载器
   * @param nameMapping 模块名称索引
   * @param cache 当前处理中的模块缓存
   */
  private loadDepens(module: ModuleConfig, modulesLoader: ModulesLoader,
                     nameMapping: { [index: string]: ModuleConfig },
                     cache: { [index: string]: ModuleConfig } = {}) {
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
          if (this.loadDepens(nameMapping[d], modulesLoader, nameMapping, cache)) {
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
