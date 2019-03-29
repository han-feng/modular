import Modular from './Modular'
import ModuleConfig from './ModuleConfig'

export default interface Activator {
  start(modular: Modular, module: ModuleConfig): void
}
