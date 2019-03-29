import ModuleConfig from './ModuleConfig'
import ApplicationConfig from './ApplicationConfig'

export default class Config {
  public modules: ModuleConfig[] = []
  public application?: ApplicationConfig
  public env?: {[index: string]: any} = {}
  public strict?: boolean = false
}
