import { cloneDeep } from 'lodash'

export interface Activator {
  start(modular: Modular, module: ModuleConfig): void
}

export class ModuleConfig {
  public name: string = ''
  public dependencies?: string[] = []
  public extensionPoints?: { [index: string]: any } = {}
  public extensions?: { [index: string]: any } = {}
  public activator?: Activator
}

export class ApplicationConfig extends ModuleConfig {
  public version: string = ''
  constructor() {
    super()
    this.name = 'Application'
  }
}

export class Config {
  public modules: ModuleConfig[] = []
  public application?: ApplicationConfig = new ApplicationConfig()
  public env?: {[index: string]: any} = {}
  public strict?: boolean = false
}

export class LogInfo {
  // TODO 修改为 getMessage() 方式
  public code: string
  public level: string = 'error'
  public message: string = ''
  public data?: any
  constructor(code: string) {
    this.code = code
  }
}

export class ModulesLoader {
  private modules: ModuleConfig[] = []
  private nameMap: { [index: string]: ModuleConfig } = {}
  add(module: ModuleConfig): void {
    if (!this.contains(module)) {
      this.nameMap[module.name] = module
      this.modules.push(module)
    }
  }
  getModules(): ModuleConfig[] {
    return this.modules
  }
  contains(module: ModuleConfig): boolean {
    return !!this.nameMap[module.name]
  }
}

// 模块化应用实现类
export class Modular {
  public strict: boolean
  private logs: LogInfo[] = [] // 记录处理过程中产生的日志信息
  private application: ApplicationConfig
  private modules: ModuleConfig[]
  private extensionPoints: { [index: string]: any }
  private extensions: { [index: string]: any }
  private extensionConfigs: { [index: string]: Array<{ module: string, config: any}> }

  // 构造函数
  constructor(config?: Config) {
    config = config || new Config()
    const app = config.application || new ApplicationConfig()
    this.strict = !!config.strict // 严格模式，暂未使用，保留
    let modules = config.modules || []

    // 建立 name 查询索引
    const nameMapping: { [index: string]: ModuleConfig } = {}
    modules.forEach(module => {
      if (module.name === undefined || module.name === '') {
        this.log({
          level: 'error',
          code: 'E01',
          message: '模块名称未定义',
          data: module
        })
        return
      }
      const name = module.name
      if (nameMapping[name]) {
        this.log({
          level: 'error',
          code: 'E02',
          message: '模块名称重复',
          data: [nameMapping[name], module]
        })
        return
      }
      nameMapping[name] = module
    })

    // 解析依赖，模块排序
    const modulesLoader = new ModulesLoader()

    // TODO 处理优先加载模块
    // modulesLoader.add(nameMapping['modular-core'])
    const self = this
    function fillDepens(item: ModuleConfig, cache: { [index: string]: ModuleConfig } = {}) {
      if (item.name === undefined || item.name === '') {
        return false
      }
      if (modulesLoader.contains(item)) {
        return true
      }
      if (item.dependencies && item.dependencies.length) {
        item.dependencies = Object.freeze(item.dependencies) as string[]
        const ds = item.dependencies
        const dslen = ds.length
        for (let i = 0; i < dslen; i++) {
          const d = ds[i]
          if (nameMapping[d]) {
            if (cache[d]) {
              // 正在处理中的cache包含依赖项，说明出现循环依赖的情况，跳过
              return true
            }
            cache[d] = nameMapping[d]
            if (fillDepens(nameMapping[d], cache)) {
              delete cache[d]
              // 依赖项加载成功
              continue
            } else {
              self.log({
                level: 'error',
                code: 'E03',
                message: '“' + item.name + '”依赖的模块“' + d + '”解析失败'
              })
              return false
            }
          } else {
            self.log({
              level: 'error',
              code: 'E04',
              message: '“' + item.name + '”依赖的模块“' + d + '”不存在'
            })
            return false
          }
        }
        // 依赖项全部加载成功
      }
      modulesLoader.add(item)
      return true
    }
    modules.forEach(module => {
      fillDepens(module)
    })
    // 处理应用配置
    fillDepens(app)

    modules = modulesLoader.getModules()

    // 组装扩展配置
    const points: { [index: string]: any } = {}
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
            this.log({
              level: 'error',
              code: 'E05',
              message: '重复的 extensionPoint 定义 ' + name,
              data: [points[name], module]
            })
          } else {
            points[name] = { module: module.name, config: ps[name] }
          }
        }
      }
      if (module.extensions) {
        module.extensions = Object.freeze(module.extensions)
        const ext = cloneDeep(module.extensions)
        for (const name in ext) {
          if (points[name]) {
            extens[name] = extens[name] || {} // 初始化key对应的配置对象
            extenConfigs[name] = extenConfigs[name] || [] // 初始化key对应的配置数组
            const allConfig = extens[name]
            const currConfig = ext[name]
            // tslint:disable-next-line:forin
            // for (const key in newConfig) {
              // // 遍历当前扩展配置子项
              // if (oldConfig[key]) {
              //   // 被覆盖项目
              //   oldConfig[key].valid = false
              //   oldConfig[key]._meta.covers.push(module.name)
              // }
              // newConfig[key].valid = true
              // newConfig[key]._meta = { module: module.name, key, covers: [] }
              // let config = {
              //   module: module.name,
              //   config: newConfig[key]
              // }
            //   extenConfigs[name].push({
            //     module: module.name,
            //     config: newConfig[key]
            //   })
            // }
            Object.assign(allConfig, currConfig) // 混合配置对象
            currConfig._module = module.name
            extenConfigs[name].push(Object.freeze(currConfig))
          } else {
            this.log({
              level: 'error',
              code: 'E06',
              message: 'extensionPoint 定义不存在 ' + name,
              data: [ext[name], module]
            })
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
  // 获取应用配置
  getApplication() {
    return this.application
  }
  // 获取指定名称的模块配置
  getModule(name: string) {
    return this.modules.find((item: ModuleConfig): boolean => item.name === name)
  }
  // 获取全部模块配置
  getModules() {
    return this.modules
  }
  // 获取指定名称的有效扩展配置（对象形式）
  getExtension(name: string) {
    return this.extensions[name] || {}
  }
  // 获取全部有效的扩展配置（对象形式）
  getExtensions() {
    return this.extensions
  }
  // 获取指定名称的全部扩展配置（数组形式）
  getExtensionConfig(name: string) {
    return this.extensionConfigs[name] || []
  }
  // 获取全部扩展配置（数组形式）
  getExtensionConfigs() {
    return this.extensionConfigs
  }
  // 获取指定名称的扩展点定义
  getExtensionPoint(name: string) {
    return this.extensionPoints[name] || {}
  }
  // 获取全部有效的扩展点定义
  getExtensionPoints() {
    return this.extensionPoints
  }
  // 启动模块化应用
  start() {
    this.modules.forEach(module => {
      if (module.activator && module.activator.start) {
        module.activator.start(this, module)
      }
    })
  }
  getLogs() {
    return Object.freeze(this.logs) as LogInfo[]
  }
  // 记录日志
  private log(info: LogInfo) {
    this.logs.push(info)
    // console.log(info)
  }
}

export default Modular
