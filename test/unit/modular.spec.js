import Modular from '@/index'

describe('Modular 单元测试', () => {
  it('forEachMatch 功能验证', () => {
    let modular = new Modular()
    expect(modular.getApplication().name).toEqual('Application')
  })
})
