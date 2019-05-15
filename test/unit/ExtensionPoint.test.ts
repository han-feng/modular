import { cloneDeep } from 'lodash'
import { DefaultExtensionPoint, Type } from '@/ExtensionPoint'

describe('ExtensionPoint 单元测试', () => {
  test('Multiple 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Multiple })

    point.addPreprocessors({
      process() {
        return null
      }
    })
    const ma1: any[] = [{ name: 'e1' }, { name: 'e2' }, { name: 'e3' }]
    const me1 = cloneDeep(ma1)
    me1.forEach(item => item['@module'] = 'm1')
    point.addExtension('m1', { name: 'e1' }, { name: 'e2' }, { name: 'e3' })
    point.getExtension() // 增加分支覆盖率
    expect(point.getExtension()).toEqual(me1)

    const me2: any = cloneDeep(ma1)
    me2['@module'] = 'm2'
    point.addExtension('m2', cloneDeep(ma1))
    expect(point.getExtension()).toEqual([...me1, me2])

    const me3 = cloneDeep(ma1)
    me3.forEach(item => item['@module'] = 'm3')
    point.addExtension('m3', ...cloneDeep(ma1))
    expect(point.getExtension()).toEqual([
      ...me1,
      me2,
      ...me3,
    ])
    point.addPreprocessors({
      process() {
        return { name: 'e0' }
      }
    })
    expect(point.getExtension()).toEqual({ name: 'e0' })
  })

  test('Single 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Single })

    const ma1: any[] = [
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    ]
    const me1 = cloneDeep(ma1)
    me1.forEach(item => item['@module'] = 'm1')
    point.addExtension('m1',
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    )
    expect(point.getExtension()).toEqual({ 'name': 'e3', 'p3': 'test3', '@module': 'm1' })
    expect(point.getExtensions()).toEqual(me1)

    const ma2: any[] = [
      { name: 'e1', p4: 'test4' },
      { name: 'e2' },
      { name: 'e3' }
    ]
    const me2: any = cloneDeep(ma2)
    me2['@module'] = 'm2'
    point.addExtension('m2', cloneDeep(ma2))
    expect(point.getExtension()).toEqual(me2)
    expect(point.getExtensions()).toEqual([...me1, me2])

    const ma3: any[] = [{ name: 'e1' }, { name: 'e2', p5: 'test5' }, { name: 'e3' }]
    const me3 = cloneDeep(ma3)
    me3.forEach(item => item['@module'] = 'm3')
    point.addExtension('m3', ...cloneDeep(ma3))
    expect(point.getExtension()).toEqual({ 'name': 'e3', '@module': 'm3' })
    expect(point.getExtensions()).toEqual([...me1, me2, ...me3])
  })

  test('Mixin 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Mixin })

    const ma1: any[] = [
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    ]
    const me1 = {
      name: 'e3',
      p1: 'test1',
      p2: 'test2',
      p3: 'test3'
    }
    const mes1 = cloneDeep(ma1)
    mes1.forEach(item => item['@module'] = 'm1')
    point.addExtension('m1',
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    )
    expect(point.getExtension()).toEqual(me1)
    expect(point.getExtensions()).toEqual(mes1)

    const ma2: any[] = [
      { name: 'e1', p4: 'test4' },
      { name: 'e2' },
      { name: 'e3' }
    ]
    const me2 = { ...me1, ...ma2 }
    const mes2: any = cloneDeep(ma2)
    mes2['@module'] = 'm2'
    point.addExtension('m2', cloneDeep(ma2))
    expect(point.getExtension()).toEqual(me2)
    expect(point.getExtensions()).toEqual([...mes1, mes2])

    const ma3: any[] = [{ name: 'e1' }, { name: 'e2', p5: 'test5' }, { name: 'e3' }]
    const mes3 = cloneDeep(ma3)
    mes3.forEach(item => item['@module'] = 'm3')
    point.addExtension('m3', ...cloneDeep(ma3))
    expect(point.getExtension()).toEqual({ ...me2, p5: 'test5' })
    expect(point.getExtensions()).toEqual([...mes1, mes2, ...mes3])
  })
})
