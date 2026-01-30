import { Feature, Action, getFeature, getAction } from '@ihelpee/crud';

describe('#crud', () => {
  const feature = 'feature';
  const action = 'action';

  @Feature(feature)
  class TestClass {
    @Action(action)
    root() {}
  }

  describe('#feature decorator', () => {
    it('should save metadata', () => {
      const metadata = getFeature(TestClass);
      expect(metadata).toBe(feature);
    });
  });
  describe('#action decorator', () => {
    it('should save metadata', () => {
      const metadata = getAction(TestClass.prototype.root);
      expect(metadata).toBe(action);
    });
  });
});
