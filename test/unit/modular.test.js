import { ApplicationConfig, Modular, LogInfo } from '@/Modular'
import data from './modular.data.js'
import { cloneDeep } from 'lodash'

const application = new ApplicationConfig()

describe('Modular 单元测试', () => {
  test('默认构造函数测试', () => {
    const modular = new Modular()
    const app = modular.getApplication()
    const app2 = modular.getModule('Application')
    const modules = modular.getModules()
    const exts = modular.getExtension('test')
    const extConfig = modular.getExtensionConfig('test')
    const points = modular.getExtensionPoint('test')
    // 不可变对象测试
    expect(() => { modules.push('test') }).toThrowError(TypeError)
    // expect(() => { exts['test'] = 'test' }).toThrowError(TypeError) // 暂时未实现不可变
    // expect(() => { extConfig.push('test') }).toThrowError(TypeError) // 暂时未实现不可变
    // expect(() => { points['test'] = 'test' }).toThrowError(TypeError) // 暂时未实现不可变
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

  test('默认构造函数测试2', () => {
    const modular = new Modular({})
    const app = modular.getApplication()
    const app2 = modular.getModule('Application')
    const modules = modular.getModules()
    const exts = modular.getExtension('test')
    const extConfig = modular.getExtensionConfig('test')
    const points = modular.getExtensionPoint('test')
    // 不可变对象测试
    expect(() => { modules.push('test') }).toThrowError(TypeError)
    // expect(() => { exts['test'] = 'test' }).toThrowError(TypeError) // 暂时未实现不可变
    // expect(() => { extConfig.push('test') }).toThrowError(TypeError) // 暂时未实现不可变
    // expect(() => { points['test'] = 'test' }).toThrowError(TypeError) // 暂时未实现不可变
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

  test('循环依赖测试', () => {
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

  test('扩展配置覆盖测试', () => {
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
        m9: { name: 'm10->m9-ext1' },
        m10: { name: 'm10-ext1' }
      },
      ep2: {
        m10: 'm10=ext2'
      }
    })
    expect(modular.getExtension('ep1')).toEqual({
      m9: { name: 'm10->m9-ext1' },
      m10: { name: 'm10-ext1' }
    })
    expect(modular.getExtensionConfigs()).toEqual({
      ep1: [
        { _module: 'm9', m9: { name: 'm9-ext1'}},
        { _module: 'm10', m10: { name: 'm10-ext1' }, m9: { name: 'm10->m9-ext1' }}
      ],
      ep2: [
        { _module: 'm10', m10: 'm10=ext2'}
      ]
    })
    expect(modular.getExtensionConfig('ep1')).toEqual([
      { _module: 'm9', m9: { name: 'm9-ext1' }},
      { _module: 'm10', m10: { name: 'm10-ext1' }, m9: { name: 'm10->m9-ext1' }}
    ])
  })

  test('异常测试', () => {
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
    expect(modular.getLogs().map(item => item.toString())).toEqual([
      '[E01] 模块名称未定义 {}',
      '[E02] 模块名称重复 {"name":"m1","dependencies":["m2"]}, {"name":"m1","dependencies":["m2"]}',
      '[E04] “m5”依赖的模块“m0”不存在',
      '[E04] “m5”依赖的模块“m0”不存在',
      '[E03] “m6”依赖的模块“m5”解析失败',
      '[E04] “m7”依赖的模块“m4”不存在'
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
    expect(modular.getLogs().map(item => item.toString())).toEqual([
      '[E05] 模块“m9”声明了重复的 extensionPoint “ep1”',
      '[E06] 模块“m10”引用了不存在的 extensionPoint “ep0”'
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

  test('start() 测试', () => {
    const modular = new Modular({
      modules: cloneDeep([
        data.m8,
        data.m9,
        data.m10
      ])
    })
    data.activator.clean() // 清理测试记录
    modular.start()
    expect(data.activator.getLogs()).toEqual(['m8', 'm9', 'm10'])
  })

  test('LogInfo 测试', () => {
    const log = new LogInfo('Error')
    expect(log).toEqual({ level: 'error', code: 'Error' })
    expect(log.getMessage()).toEqual('未知异常')
  })
})
