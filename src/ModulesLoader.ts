import { ModuleConfig } from './Modular'

export default class ModulesLoader {
  private readonly modules: ModuleConfig[] = []
  private readonly nameMap: { [index: string]: ModuleConfig } = {}
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
