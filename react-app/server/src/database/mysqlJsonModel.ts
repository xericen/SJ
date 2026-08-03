import { randomBytes } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { getDatabasePool } from '../config/database.js';

type PlainDocument = Record<string, any>;
type Filter = Record<string, any>;
type Update = { $set?: PlainDocument; $unset?: PlainDocument; $setOnInsert?: PlainDocument } | PlainDocument;
type Options = { upsert?: boolean; returnDocument?: 'before' | 'after' };

const objectId = () => randomBytes(12).toString('hex');
const clone = <T>(value: T): T => structuredClone(value);

const getPath = (source: any, path: string) => path.split('.').reduce((value, key) => value?.[key], source);
const setPath = (target: PlainDocument, path: string, value: any) => {
  const keys = path.split('.');
  const last = keys.pop()!;
  let cursor = target;
  for (const key of keys) cursor = cursor[key] ??= {};
  cursor[last] = value;
};
const unsetPath = (target: PlainDocument, path: string) => {
  const keys = path.split('.');
  const last = keys.pop()!;
  const parent = keys.reduce((value, key) => value?.[key], target);
  if (parent) delete parent[last];
};

const matches = (document: PlainDocument, filter: Filter = {}) => Object.entries(filter).every(([path, wanted]) => {
  const actual = getPath(document, path);
  if (wanted && typeof wanted === 'object' && !Array.isArray(wanted) && '$in' in wanted) {
    const candidates = wanted.$in.map(String);
    return Array.isArray(actual)
      ? actual.some((value) => candidates.includes(String(value)))
      : candidates.includes(String(actual));
  }
  if (wanted && typeof wanted === 'object' && !Array.isArray(wanted) && '$ne' in wanted) {
    return String(actual) !== String(wanted.$ne);
  }
  return String(actual) === String(wanted);
});

const applyUpdate = (document: PlainDocument, update: Update, inserting = false) => {
  const operators = ['$set', '$unset', '$setOnInsert'].some((key) => key in update);
  if (!operators) Object.entries(update).forEach(([path, value]) => setPath(document, path, clone(value)));
  Object.entries((update as any).$set ?? {}).forEach(([path, value]) => setPath(document, path, clone(value)));
  Object.keys((update as any).$unset ?? {}).forEach((path) => unsetPath(document, path));
  if (inserting) Object.entries((update as any).$setOnInsert ?? {}).forEach(([path, value]) => setPath(document, path, clone(value)));
};

const project = (document: PlainDocument, selection?: string) => {
  if (!selection) return clone(document);
  const paths = selection.split(/\s+/).map((path) => path.replace(/^\+/, '')).filter(Boolean);
  if (!paths.length) return clone(document);
  const result: PlainDocument = { _id: document._id };
  if (document.id !== undefined) result.id = document.id;
  for (const path of paths) {
    const value = getPath(document, path);
    if (value !== undefined) setPath(result, path, clone(value));
  }
  return result;
};

class MysqlDocument {
  [key: string]: any;
  private __collection: string;

  constructor(collection: string, data: PlainDocument) {
    this.__collection = collection;
    Object.assign(this, data);
  }

  get(path: string) { return getPath(this, path); }
  set(path: string, value: any) { setPath(this, path, value); return this; }
  async save() {
    this.updatedAt = new Date();
    await persist(this.__collection, this);
    return this;
  }
  toObject() { return serializable(this); }
  toJSON() { return serializable(this); }
}

const serializable = (document: PlainDocument) => Object.fromEntries(
  Object.entries(document).filter(([key]) => !key.startsWith('__')).map(([key, value]) => [key, value]),
);

const persist = async (collection: string, document: PlainDocument) => {
  const data = serializable(document);
  const id = String(data._id ?? objectId());
  data._id = id;
  data.id ??= id;
  await getDatabasePool().execute(
    `INSERT INTO jochwon_documents (collection_name, document_id, document_data)
     VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE document_data = VALUES(document_data)`,
    [collection, id, JSON.stringify(data)],
  );
};

const load = async (collection: string): Promise<PlainDocument[]> => {
  const [rows] = await getDatabasePool().execute<RowDataPacket[]>(
    'SELECT document_data FROM jochwon_documents WHERE collection_name = ?',
    [collection],
  );
  return rows.map((row) => typeof row.document_data === 'string' ? JSON.parse(row.document_data) : row.document_data);
};

class MysqlQuery implements PromiseLike<any> {
  private selection?: string;
  private sortSpec?: Record<string, 1 | -1>;
  private maxItems?: number;

  constructor(private readonly executeQuery: () => Promise<any>, private readonly documents = true) {}
  select(selection: string) { this.selection = selection; return this; }
  sort(spec: Record<string, 1 | -1>) { this.sortSpec = spec; return this; }
  limit(value: number) { this.maxItems = value; return this; }
  lean() { return new MysqlQuery(() => this.materialize(true), false); }

  private async materialize(forcePlain = false) {
    let value = await this.executeQuery();
    const process = (item: any) => {
      if (!item) return item;
      const plain = project(serializable(item), this.selection);
      return forcePlain || !this.documents ? plain : new MysqlDocument(item.__collection, plain);
    };
    if (Array.isArray(value)) {
      if (this.sortSpec) value.sort((left, right) => {
        for (const [path, direction] of Object.entries(this.sortSpec!)) {
          const a = getPath(left, path); const b = getPath(right, path);
          if (a < b) return -direction;
          if (a > b) return direction;
        }
        return 0;
      });
      if (this.maxItems !== undefined) value = value.slice(0, this.maxItems);
      return value.map(process);
    }
    return process(value);
  }

  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.materialize().then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null) {
    return this.materialize().catch(onrejected);
  }
}

export const createMysqlJsonModel = (collection: string, defaults: (input: PlainDocument) => PlainDocument = (input) => input): any => ({
  find(filter: Filter = {}) {
    return new MysqlQuery(async () => (await load(collection)).filter((document) => matches(document, filter)).map((document) => new MysqlDocument(collection, document)));
  },
  findOne(filter: Filter) {
    return new MysqlQuery(async () => {
      const document = (await load(collection)).find((candidate) => matches(candidate, filter));
      return document ? new MysqlDocument(collection, document) : null;
    });
  },
  findById(id: string) { return this.findOne({ _id: id }); },
  async create(input: PlainDocument) {
    const now = new Date();
    const data = defaults({ ...clone(input), _id: input._id ?? objectId(), createdAt: input.createdAt ?? now, updatedAt: now });
    data.id ??= data._id;
    const document = new MysqlDocument(collection, data);
    await persist(collection, document);
    return document;
  },
  findOneAndUpdate(filter: Filter, update: Update, options: Options = {}) {
    return new MysqlQuery(async () => {
      const documents = await load(collection);
      let data = documents.find((candidate) => matches(candidate, filter));
      const before = data ? clone(data) : null;
      if (!data && options.upsert) {
        const base = Object.fromEntries(Object.entries(filter).filter(([, value]) => !value || typeof value !== 'object' || Array.isArray(value)));
        data = defaults({ ...base, _id: objectId(), createdAt: new Date() });
        data.id ??= data._id;
        applyUpdate(data, update, true);
      } else if (data) applyUpdate(data, update);
      if (!data) return null;
      data.updatedAt = new Date();
      await persist(collection, data);
      const result = options.returnDocument === 'before' ? before : data;
      return result ? new MysqlDocument(collection, result) : null;
    });
  },
  findByIdAndUpdate(id: string, update: Update, options: Options = {}) { return this.findOneAndUpdate({ _id: id }, update, options); },
  async updateOne(filter: Filter, update: Update, options: Options = {}) {
    const document = await this.findOneAndUpdate(filter, update, options);
    return { acknowledged: true, matchedCount: document ? 1 : 0, modifiedCount: document ? 1 : 0 };
  },
  async exists(filter: Filter) { return (await this.findOne(filter).lean()) ? { _id: true } : null; },
  async countDocuments(filter: Filter = {}) { return (await load(collection)).filter((document) => matches(document, filter)).length; },
  async findOneAndDelete(filter: Filter) {
    const document = (await load(collection)).find((candidate) => matches(candidate, filter));
    if (!document) return null;
    await getDatabasePool().execute('DELETE FROM jochwon_documents WHERE collection_name = ? AND document_id = ?', [collection, document._id]);
    return new MysqlDocument(collection, document);
  },
});
