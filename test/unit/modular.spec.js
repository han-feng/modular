import Modular from '@/index'
import data from './modular.data'
import { cloneDeep } from 'lodash'

const application = { name: 'Application' }

describe('Modular 单元测试', () => {
  it('默认构造函数测试', () => {
    const modular = new Modular()
    const app = modular.getApplication()
    const app2 = modular.getModule('Application')
    const modules = modular.getModules()
    const exts = modular.getExtension('test')
    const extConfig = modular.getExtensionConfig('test')
    const points = modular.getExtensionPoint('test')
    // 不可变对象测试
    expect(() => { modules.push('test') }).toThrowError(TypeError)
    // expect(() => { exts['test'] = 'test' }).toThrowError(TypeError)
    // expect(() => { extConfig.push('test') }).toThrowError(TypeError)
    // expect(() => { points['test'] = 'test' }).toThrowError(TypeError)
    expect(() => { app.name = 'test' }).toThrowError(TypeError)
    expect(() => { app.test = 'test' }).toThrowError(TypeError)
    expect(() => { delete app.name }).toThrowError(TypeError)
    expect(() => { app2.name = 'test' }).toThrowError(TypeError)
    expect(() => { app2.test = 'test' }).toThrowError(TypeError)
    expect(() => { delete app2.name }).toThrowError(TypeError)
    // 默认值测试
    expect(app).toBe(app2)
    expect(app).toEqual(application)
    expect(modules).toEqual([app])
    expect(exts).toEqual({})
    expect(extConfig).toEqual([])
    expect(points).toEqual({})
    expect(modular.strict).toBe(false)
    // 上述执行过程无错误日志产生
    expect(modular.getLogs()).toEqual([])
  })

  it('循环依赖测试', () => {
    const modular = new Modular({
      modules: cloneDeep([
        data.m1,
        data.m2,
        data.m3
      ])
    })
    expect(modular.getModules()).toEqual([
      data.m3,
      data.m2,
      data.m1,
      application
    ])
  })

  it('扩展配置覆盖测试', () => {
    const modular = new Modular({
      modules: cloneDeep([
        data.m8,
        data.m9,
        data.m10
      ])
    })
    expect(modular.getModules()).toEqual([
      data.m8,
      data.m9,
      data.m10,
      application
    ])
    expect(modular.getExtensionPoints()).toEqual({
      ep1: data.ep1,
      ep2: data.ep2,
      ep3: data.ep3,
      ep4: data.ep4,
      ep5: data.ep5
    })
    expect(modular.getExtensions()).toEqual({
      ep1: {
        m9: { name: 'm10->m9-ext1', valid: true },
        m10: { name: 'm10-ext1', valid: true }
      },
      ep2: {
        m10: { name: 'm10=ext2', valid: true }
      }
    })
    expect(modular.getExtension('ep1')).toEqual({
      m9: { name: 'm10->m9-ext1', valid: true },
      m10: { name: 'm10-ext1', valid: true }
    })
    expect(modular.getExtensionConfig('ep1')).toEqual([
      { name: 'm9-ext1', valid: false },
      { name: 'm10-ext1', valid: true },
      { name: 'm10->m9-ext1', valid: true }
    ])
  })

  it('异常测试', () => {
    let modular = new Modular({
      modules: cloneDeep([
        data.m4,
        data.m1,
        data.m2,
        data.m1,
        data.m3,
        data.m5,
        data.m6,
        data.m7
      ])
    })
    expect(modular.getLogs()).toEqual([
      { level: 'error', code: 'E01', message: '模块名称未定义', data: {} },
      { level: 'error', code: 'E02', message: '模块名称重复', data: [data.m1, data.m1] },
      { level: 'error', code: 'E04', message: '“m5”依赖的模块“m0”不存在' },
      { level: 'error', code: 'E04', message: '“m5”依赖的模块“m0”不存在' },
      { level: 'error', code: 'E03', message: '“m6”依赖的模块“m5”解析失败' },
      { level: 'error', code: 'E04', message: '“m7”依赖的模块“m4”不存在' }
    ])
    expect(modular.getModules()).toEqual([
      data.m3,
      data.m2,
      data.m1,
      application
    ])

    modular = new Modular({
      modules: cloneDeep([
        data.m8,
        data.m9,
        data.m10
      ])
    })
    expect(modular.getLogs()).toEqual([
      {
        level: 'error',
        code: 'E05',
        message: '重复的 extensionPoint 定义 ep1',
        data: [{ module: 'm8', config: {} }, data.m9]
      },
      {
        level: 'error',
        code: 'E06',
        message: 'extensionPoint 定义不存在 ep0',
        data: [{ m10: { name: 'm10-ext0' } }, data.m10]
      }
    ])
    expect(modular.getModules()).toEqual([
      data.m8,
      data.m9,
      data.m10,
      application
    ])
    expect(modular.getExtensionPoints()).toEqual({
      ep1: data.ep1,
      ep2: data.ep2,
      ep3: data.ep3,
      ep4: data.ep4,
      ep5: data.ep5
    })
  })

  it('start() 测试', () => {
    const modular = new Modular({
      modules: cloneDeep([
        data.m8,
        data.m9,
        data.m10
      ])
    })
    data.activator.clean() // 清理测试记录
    modular.start()
    expect(data.activator.logs).toEqual(['m8', 'm9', 'm10'])
  })
})
