import openpgp, {
  key as PgpKey,
  message as PgpMessage,
  KeyOptions, EncryptOptions,
  DecryptOptions,
} from 'openpgp';
import { DecryptionError, BaseError } from '../errors';

interface CreateOptions {
  name: string;
  email: string;
  passphrase?: string;
}

export interface Message<DataType> {
  data: DataType;
  sender: Identity;
}

class Identity {
  private _key: openpgp.key.Key;

  constructor(key: openpgp.key.Key) {
    this._key = key;
  }

  get fingerprint() {
    return this._key.getFingerprint();
  }

  get publicKey() {
    return this._key.toPublic();
  }

  get isPrivate() {
    return this._key.isPrivate();
  }

  get isUnlocked() {
    const result = this._key.isDecrypted();
    return result === null ? true : result;
  }

  hasId(id: any) {
    return id.bytes === (this._key.getKeyId() as any).bytes;
  }

  unlock(passphrase: string) {
    return this._key.decrypt(passphrase);
  }

  async encrypt(data: any, receivers: Identity[]) {
    const raw = JSON.stringify(data);
    const options: EncryptOptions = {
      message: PgpMessage.fromText(raw),
      publicKeys: receivers.map(r => r.publicKey),
      privateKeys: [this._key],
    };
    const result = await openpgp.encrypt(options);
    return result.data as string;
  }

  async decrypt<Type = unknown>(armored: string, senders: Identity[]): Promise<Message<Type>> {
    try {
      const options: DecryptOptions = {
        message: await PgpMessage.readArmored(armored),
        publicKeys: senders.map(r => r.publicKey),
        privateKeys: [this._key],
      };
      const result = await openpgp.decrypt(options);
      const [signature] = result.signatures;
      if (!signature.valid) { throw new Error('Sender not known'); }
      const data = JSON.parse(result.data as string) as Type;
      const sender = senders.find(s => s.hasId(signature.keyid));
      if (!sender) { throw new Error('Sender identity not found'); }
      return {
        sender,
        data,
      };
    } catch (err) {
      if (err instanceof BaseError) { throw err; }
      throw new DecryptionError(err);
    }
  }

  public static async create({
    name,
    email,
    passphrase,
  }: CreateOptions) {
    const options: KeyOptions = {
      userIds: [{
        name,
        email,
      }],
      passphrase,
      curve: 'ed25519',
    };
    const key = await openpgp.generateKey(options);
    const privkey = key.privateKeyArmored;

    return privkey;
  }

  public static async open(armored: string, passphrase?: string) {
    const { keys } = await PgpKey.readArmored(armored);
    const [key] = keys;
    const identity = new Identity(key);
    if (passphrase) {
      await identity.unlock(passphrase);
    }
    return identity;
  }
}

export default Identity;
