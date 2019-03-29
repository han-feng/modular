import ModuleConfig from './ModuleConfig'

export default class ApplicationConfig extends ModuleConfig {
  public version: string = ''
  constructor() {
    super()
    this.name = 'Application'
  }
}
