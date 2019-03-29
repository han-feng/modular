
import ModuleConfig from './ModuleConfig'

export default class ModulesLoader {
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
