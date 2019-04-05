import { DefaultExtensionPoint, Type } from '@/ExtensionPoint'

describe('ExtensionPoint 单元测试', () => {
  test('Multiple 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Multiple })

    point.addExtension({ name: 'e1' }, { name: 'e2' }, { name: 'e3' })
    expect(point.getExtension()).toEqual([
      { name: 'e1' },
      { name: 'e2' },
      { name: 'e3' }
    ])

    point.addExtension([{ name: 'e1' }, { name: 'e2' }, { name: 'e3' }])
    expect(point.getExtension()).toEqual([
      { name: 'e1' },
      { name: 'e2' },
      { name: 'e3' },
      [{ name: 'e1' }, { name: 'e2' }, { name: 'e3' }]
    ])

    point.addExtension(...[{ name: 'e1' }, { name: 'e2' }, { name: 'e3' }])
    expect(point.getExtension()).toEqual([
      { name: 'e1' },
      { name: 'e2' },
      { name: 'e3' },
      [{ name: 'e1' }, { name: 'e2' }, { name: 'e3' }],
      { name: 'e1' },
      { name: 'e2' },
      { name: 'e3' }
    ])
  })

  test('Single 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Single })

    point.addExtension(
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    )
    expect(point.getExtension()).toEqual({ name: 'e3', p3: 'test3' })
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    ])

    point.addExtension([
      { name: 'e1', p4: 'test4' },
      { name: 'e2' },
      { name: 'e3' }
    ])
    expect(point.getExtension()).toEqual([
      { name: 'e1', p4: 'test4' },
      { name: 'e2' },
      { name: 'e3' }
    ])
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' },
      [{ name: 'e1', p4: 'test4' }, { name: 'e2' }, { name: 'e3' }]
    ])

    point.addExtension(
      ...[{ name: 'e1' }, { name: 'e2', p5: 'test5' }, { name: 'e3' }]
    )
    expect(point.getExtension()).toEqual({ name: 'e3' })
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' },
      [{ name: 'e1', p4: 'test4' }, { name: 'e2' }, { name: 'e3' }],
      { name: 'e1' },
      { name: 'e2', p5: 'test5' },
      { name: 'e3' }
    ])
  })

  test('Mixin 测试', () => {
    const point = new DefaultExtensionPoint({ type: Type.Mixin })

    point.addExtension(
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    )
    expect(point.getExtension()).toEqual({
      name: 'e3',
      p1: 'test1',
      p2: 'test2',
      p3: 'test3'
    })
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' }
    ])

    point.addExtension([
      { name: 'e1', p4: 'test4' },
      { name: 'e2' },
      { name: 'e3' }
    ])
    expect(point.getExtension()).toEqual({
      0: { name: 'e1', p4: 'test4' },
      1: { name: 'e2' },
      2: { name: 'e3' },
      name: 'e3',
      p1: 'test1',
      p2: 'test2',
      p3: 'test3'
    })
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' },
      [{ name: 'e1', p4: 'test4' }, { name: 'e2' }, { name: 'e3' }]
    ])

    point.addExtension(
      ...[{ name: 'e1' }, { name: 'e2', p5: 'test5' }, { name: 'e3' }]
    )
    expect(point.getExtension()).toEqual({
      0: { name: 'e1', p4: 'test4' },
      1: { name: 'e2' },
      2: { name: 'e3' },
      name: 'e3',
      p1: 'test1',
      p2: 'test2',
      p3: 'test3',
      p5: 'test5'
    })
    expect(point.getExtensions()).toEqual([
      { name: 'e1', p1: 'test1' },
      { name: 'e2', p2: 'test2' },
      { name: 'e3', p3: 'test3' },
      [{ name: 'e1', p4: 'test4' }, { name: 'e2' }, { name: 'e3' }],
      { name: 'e1' },
      { name: 'e2', p5: 'test5' },
      { name: 'e3' }
    ])
  })
})
