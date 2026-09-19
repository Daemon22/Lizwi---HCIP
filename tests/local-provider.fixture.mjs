export function createFixtureProvider() {
  return {
    name: 'fixture-local-provider',
    capabilities: ['hand', 'posture'],
    available: true,
    initialized: false,
    async initialize() {
      this.initialized = true;
      return true;
    },
    async update(payload = {}) {
      return { ok: true, source: 'fixture', payload };
    },
    async shutdown() {
      this.initialized = false;
      return true;
    }
  };
}
