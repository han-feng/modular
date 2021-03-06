import { default as Modular, ModuleConfig, Activator } from '@/index'
import { Type, DefaultExtensionPoint } from '@/ExtensionPoint'

class LoggerActivator implements Activator {
  private static logs: string[] = []
  start(modular: Modular, module: ModuleConfig) {
    LoggerActivator.logs.push(module.name)
  }
  clean() {
    LoggerActivator.logs.splice(0, LoggerActivator.logs.length)
  }
  getLogs() {
    return LoggerActivator.logs
  }
}

const activator = new LoggerActivator()

export default {
  activator,
  m1: {
    name: 'm1',
    dependencies: ['m2']
  },
  m2: {
    name: 'm2',
    dependencies: ['m3']
  },
  m3: {
    name: 'm3',
    dependencies: ['m1']
  },
  m4: {
    name: ''
  },
  m5: {
    name: 'm5',
    dependencies: ['m0']
  },
  m6: {
    name: 'm6',
    dependencies: ['m5']
  },
  m7: {
    name: 'm7',
    dependencies: ['m4', 'm5']
  },
  m8: {
    name: 'm8',
    extensionPoints: {
      ep1: { type: Type.Multiple },
      ep2: { type: Type.Multiple }
    },
    activator
  },
  m9: {
    name: 'm9',
    dependencies: ['m8'],
    extensionPoints: {
      ep1: { type: Type.Multiple },
      ep3: { type: Type.Multiple }
    },
    extensions: {
      ep1: {
        '@module': 'm9',
        'm9': { name: 'm9-ext1' }
      }
    },
    activator
  },
  m10: {
    name: 'm10',
    dependencies: ['m8', 'm9'],
    extensionPoints: {
      ep4: { type: Type.Multiple },
      ep5: { type: Type.Multiple }
    },
    extensions: {
      ep0: {
        '@module': 'm10',
        'm10': { name: 'm10-ext0' }
      },
      ep1: [
        {
          '@module': 'm10',
          'name': 'm10-ext1'
        },
        {
          '@module': 'm10',
          'name': 'm10->m9-ext1'
         }
      ],
      ep2: {
        '@module': 'm10',
        'm10': 'm10=ext2'
      }
    },
    preprocessors: {
      ep0: {
        process() {
          throw new Error('该语句不应该被执行到')
        }
      },
      ep1: {
        process() {
          return null
        }
      },
      ep2: {
        process(extensions: any[]) {
          return extensions
        }
      }
    },
    activator
  },
  ep1: new DefaultExtensionPoint({
    module: 'm8',
    type: Type.Multiple
  }),
  ep2: new DefaultExtensionPoint({
    module: 'm8',
    type: Type.Multiple
  }),
  ep3: new DefaultExtensionPoint({
    module: 'm9',
    type: Type.Multiple
  }),
  ep4: new DefaultExtensionPoint({
    module: 'm10',
    type: Type.Multiple
  }),
  ep5: new DefaultExtensionPoint({
    module: 'm10',
    type: Type.Multiple
  })
}
