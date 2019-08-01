import Identity from 'Identity';

const getUser = async (name: string, passphrase?: string, unlock?: boolean) => {
  const privateKey = await Identity.create({
    name,
    email: `${name}@example.com`,
    passphrase,
  });
  const bob = await Identity.open(privateKey, unlock ? passphrase : undefined);
  return bob;
}

const getBob = (passphrase?: string, unlock?: boolean) => getUser('bob', passphrase, unlock);
const getAlice = (passphrase?: string, unlock?: boolean) => getUser('alice', passphrase, unlock);

describe('Identity', () => {
  it('should be able to create a new unprotected identity', async () => {
    const bob = await getBob();
    expect(bob).toBeDefined();
    expect(bob.isUnlocked).toBeTruthy();
    expect(bob.isPrivate).toBeTruthy();
  });

  it('should be able to create a new protected identity', async () => {
    const bob = await getBob('test', false);
    expect(bob).toBeDefined();
    expect(bob.isUnlocked).toBeFalsy();
    expect(bob.isPrivate).toBeTruthy();
  });

  it('should be able to unlock a protected identity', async () => {
    const bob = await getBob('test', true);
    expect(bob).toBeDefined();
    expect(bob.isUnlocked).toBeTruthy();
    expect(bob.isPrivate).toBeTruthy();
  });

  it('should be able to get public key', async () => { 
    const bob = await getBob();
    expect(bob.publicKey).toBeDefined();
    expect(bob.publicKey.armor()).toBeDefined();
  });

  it('should be able to open user from public key', async () => { 
    const bobPrivate = await getBob();
    const publicKey = bobPrivate.publicKey.armor();
    const bobPublic = await Identity.open(publicKey);
    expect(bobPublic).toBeDefined();
    expect(bobPublic.isUnlocked).toBeTruthy();
    expect(bobPublic.isPrivate).toBeFalsy();
  });

  it('should be able to encrypt string for self', async () => { 
    const bob = await getBob();
    const encrypted = await bob.encrypt('hello', [bob]);
    expect(encrypted).toBeDefined();
  });

  it('should be able to decrypt string for self', async () => { 
    const bob = await getBob();
    const encrypted = await bob.encrypt('hello', [bob]);
    const decrypted = await bob.decrypt(encrypted, [bob]);
    expect(decrypted.sender.fingerprint).toBe(bob.fingerprint);
    expect(decrypted.data).toBe('hello');
  });

  it('should be able to encrypt string for other', async () => { 
    const bob = await getBob();
    const alice = await getAlice();
    const encrypted = await bob.encrypt('hello', [alice]);
    expect(encrypted).toBeDefined();
  });

  it('should be able to decrypt string from other', async () => { 
    const bob = await getBob();
    const alice = await getAlice();
    const encrypted = await bob.encrypt('hello', [alice]);
    const decrypted = await alice.decrypt(encrypted, [bob]);
    expect(decrypted.sender.fingerprint).toBe(bob.fingerprint);
    expect(decrypted.data).toBe('hello');
  });

  it('should reject messages from unknown users', async () => { 
    const bob = await getBob();
    const alice = await getAlice();
    const encrypted = await bob.encrypt('hello', [alice]);
    let errorMessage: string = '';
    try {
      await alice.decrypt(encrypted, [alice]);
    } catch (err) {
      errorMessage = err.message;
    }
    expect(errorMessage).toBe('Sender not known');
  });
});