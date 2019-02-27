import Modular from '@/index'

describe('Modular 单元测试', () => {
  it('无参数 Modular 对象验证', () => {
    let modular = new Modular()
    const app = modular.getApplication()
    const app2 = modular.getModule('Application')
    const modules = modular.getModules()
    const exts = modular.getExtension('test')
    const points = modular.getExtensionPoint('test')
    // 不可变对象测试
    expect(() => { modules.push('test') }).toThrowError(TypeError)
    expect(() => { exts.push('test') }).toThrowError(TypeError)
    expect(() => { points.push('test') }).toThrowError(TypeError)
    expect(() => { app.name = 'test' }).toThrowError(TypeError)
    expect(() => { app.test = 'test' }).toThrowError(TypeError)
    expect(() => { delete app.name }).toThrowError(TypeError)
    expect(() => { app2.name = 'test' }).toThrowError(TypeError)
    expect(() => { app2.test = 'test' }).toThrowError(TypeError)
    expect(() => { delete app2.name }).toThrowError(TypeError)
    // 默认值测试
    expect(app).toBe(app2)
    expect(app).toEqual({ name: 'Application' })
    expect(modules).toEqual([app])
    expect(exts).toEqual({})
    expect(points).toEqual({})
    expect(modular.strict).toBe(false)
    // 上述执行过程无错误日志产生
    expect(modular.errors).toEqual([])
  })
})
