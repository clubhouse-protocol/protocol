interface Transporter {
  get: (id: string) => Promise<string | undefined>;
  add: (id: string, data: string) => Promise<void>;
  waitForSignal?: (signal: string) => Promise<void>;
}

export default Transporter;
