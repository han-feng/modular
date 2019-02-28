export default {
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
  }
}
