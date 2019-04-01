import Activator from './Activator'
import ExtensionPoint from './ExtensionPoint'

export default class ModuleConfig {
  public name: string = ''
  public dependencies?: string[] = []
  public extensionPoints?: { [index: string]: ExtensionPoint } = {}
  public extensions?: { [index: string]: any } = {}
  public activator?: Activator
}
