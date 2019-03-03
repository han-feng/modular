const logs = []
const activator = {
  logs,
  start (modular, module) {
    logs.push(module.name)
  },
  clean () {
    logs.splice(0, logs.length)
  }
}

export default {
  activator,
  m1: {
    name: 'm1',
    dependencies: [
      'm2'
    ]
  },
  m2: {
    name: 'm2',
    dependencies: [
      'm3'
    ]
  },
  m3: {
    name: 'm3',
    dependencies: [
      'm1'
    ]
  },
  m4: {
  },
  m5: {
    name: 'm5',
    dependencies: [
      'm0'
    ]
  },
  m6: {
    name: 'm6',
    dependencies: [
      'm5'
    ]
  },
  m7: {
    name: 'm7',
    dependencies: [
      'm4',
      'm5'
    ]
  },
  m8: {
    name: 'm8',
    extensionPoints: {
      'ep1': {},
      'ep2': {}
    },
    activator
  },
  m9: {
    name: 'm9',
    dependencies: [
      'm8'
    ],
    extensionPoints: {
      'ep1': {},
      'ep3': {}
    },
    extensions: {
      'ep1': {
        m9: 'm9-ext1'
      }
    },
    activator
  },
  m10: {
    name: 'm10',
    dependencies: [
      'm8',
      'm9'
    ],
    extensionPoints: {
      'ep4': {},
      'ep5': {}
    },
    extensions: {
      'ep0': {
        m10: 'm10-ext0'
      },
      'ep1': {
        m10: 'm10-ext1',
        m9: 'm10->m9-ext1'
      }
    },
    activator
  },
  ep1: {
    module: 'm8',
    config: {}
  },
  ep2: {
    module: 'm8',
    config: {}
  },
  ep3: {
    module: 'm9',
    config: {}
  },
  ep4: {
    module: 'm10',
    config: {}
  },
  ep5: {
    module: 'm10',
    config: {}
  }
}
