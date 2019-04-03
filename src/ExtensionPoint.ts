/**
 * 扩展点类型，默认值为 array，可选值有以下几种：
 * array: 数组形式，支持多值，所有扩展配置都有效；
 * mixin: 混合形式，由多个扩展配置混合形成最后有效的配置；
 * single: 单一对象，只有最后的扩展配置有效
 */
export enum Type {
  array,
  mixin,
  single
}

/**
 * 扩展点声明对象
 */
export default class ExtensionPoint {
  type: Type = Type.array
  module?: string = ''
}
