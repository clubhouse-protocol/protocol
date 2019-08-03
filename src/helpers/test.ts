import Identity from '../Identity';
import Transporter from '../Transporter';

const createUser = async () => {
  const key = await Identity.create({
    name: 'bob',
    email: 'bob@example.com',
  });
  return Identity.open(key);
};

const createUsers = (count: number) => {
  const tasks: Promise<Identity>[] = [];
  for (let i = 0; i < count; i += 1) {
    tasks.push(createUser());
  }
  return Promise.all(tasks);
};

class TestTransporter implements Transporter {
  data: {[id: string]: string};

  constructor() {
    this.data = {};
  }

  async get(id: string) {
    return this.data[id];
  }

  async add(id: string, value: string) {
    this.data[id] = value;
  }
}

export {
  createUser,
  createUsers,
  TestTransporter,
};
