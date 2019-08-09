import { hash, hmac } from './security';

describe('helpers', () => {
  describe('security', () => {
    describe('hash', () => {
      it('should generate different hex for different values', async () => {
        const a = await hash('a');
        const b = await hash('b');

        expect(a).not.toBe(b);
      });

      it('should generate identitcal hex for identitcal values', async () => {
        const a = await hash('a');
        const b = await hash('a');

        expect(a).toBe(b);
      });

      it('should support large values', async () => {
        const value = new Array(1024).fill(undefined).map(() => String.fromCharCode(
          Math.round(Math.random() * 255),
        )).join();
        const a = await hash(value);
        const b = await hash(value);

        expect(a).toBe(b);
      });
    });

    describe('hmac', () => {
      it('should generate different hex for different values', async () => {
        const a = await hmac('a', 'a');
        const b = await hmac('b', 'a');

        expect(a).not.toBe(b);
      });

      it('should generate identitcal hex for identitcal values', async () => {
        const a = await hmac('a', 'a');
        const b = await hmac('a', 'a');

        expect(a).toBe(b);
      });

      it('should generate different hex for different keys', async () => {
        const a = await hmac('a', 'a');
        const b = await hmac('a', 'b');

        expect(a).not.toBe(b);
      });

      it('should support large values', async () => {
        const value = new Array(1024).fill(undefined).map(() => String.fromCharCode(
          Math.round(Math.random() * 255),
        )).join();
        const a = await hmac(value, value);
        const b = await hmac(value, value);

        expect(a).toBe(b);
      });
    });
  });
});
