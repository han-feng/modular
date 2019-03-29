import Activator from './Activator'

export default class ModuleConfig {
  public name: string = ''
  public dependencies?: string[] = []
  public extensionPoints?: { [index: string]: any } = {}
  public extensions?: { [index: string]: any } = {}
  public activator?: Activator
}
