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
  }
}
