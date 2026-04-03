import type { GameSaveSnapshot, GameSaveSummary } from '@engine/types/save';

const LOCAL_STORAGE_KEY = 'wey-to-heaven/save-slots/v1';
const INDEXED_DB_NAME = 'wey-to-heaven-save-slots';
const INDEXED_DB_STORE_NAME = 'slots';

interface StoredSaveRecord {
  slotId: string;
  snapshot: GameSaveSnapshot;
}

export interface SavePersistence {
  delete(slotId: string): Promise<boolean>;
  listSummaries(): Promise<GameSaveSummary[]>;
  load(slotId: string): Promise<GameSaveSnapshot | null>;
  save(snapshot: GameSaveSnapshot): Promise<void>;
}

function isRecordShape(value: unknown): value is StoredSaveRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'slotId' in value && 'snapshot' in value;
}

function sortSummaries(summaries: readonly GameSaveSummary[]) {
  return [...summaries].sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

function getLocalStorage() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage;
}

function loadLocalRecords() {
  const storage = getLocalStorage();

  if (!storage) {
    return {} as Record<string, StoredSaveRecord>;
  }

  try {
    const rawValue = storage.getItem(LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return {} as Record<string, StoredSaveRecord>;
    }

    const parsed = JSON.parse(rawValue) as Record<string, StoredSaveRecord>;

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, StoredSaveRecord] => isRecordShape(entry[1])),
    );
  } catch {
    return {} as Record<string, StoredSaveRecord>;
  }
}

function saveLocalRecords(records: Record<string, StoredSaveRecord>) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota failures and keep the runtime responsive.
  }
}

class LocalStorageSavePersistence implements SavePersistence {
  async delete(slotId: string) {
    const records = loadLocalRecords();

    if (!(slotId in records)) {
      return false;
    }

    delete records[slotId];
    saveLocalRecords(records);

    return true;
  }

  async listSummaries() {
    return sortSummaries(Object.values(loadLocalRecords()).map((record) => record.snapshot.summary));
  }

  async load(slotId: string) {
    return loadLocalRecords()[slotId]?.snapshot ?? null;
  }

  async save(snapshot: GameSaveSnapshot) {
    const records = loadLocalRecords();

    records[snapshot.summary.slotId] = {
      slotId: snapshot.summary.slotId,
      snapshot,
    };
    saveLocalRecords(records);
  }
}

class IndexedDbSavePersistence implements SavePersistence {
  private databasePromise: Promise<IDBDatabase> | null = null;

  async delete(slotId: string) {
    const database = await this.getDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(INDEXED_DB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_STORE_NAME);
      const request = store.delete(slotId);

      request.onerror = () => reject(request.error ?? new Error('Unable to delete the save slot.'));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Unable to delete the save slot.'));
    });

    return true;
  }

  async listSummaries() {
    const records = await this.getAllRecords();

    return sortSummaries(records.map((record) => record.snapshot.summary));
  }

  async load(slotId: string) {
    const database = await this.getDatabase();

    return new Promise<GameSaveSnapshot | null>((resolve, reject) => {
      const transaction = database.transaction(INDEXED_DB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(INDEXED_DB_STORE_NAME);
      const request = store.get(slotId);

      request.onsuccess = () => {
        const record = request.result as StoredSaveRecord | undefined;

        resolve(record?.snapshot ?? null);
      };
      request.onerror = () => reject(request.error ?? new Error('Unable to load the save slot.'));
    });
  }

  async save(snapshot: GameSaveSnapshot) {
    const database = await this.getDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(INDEXED_DB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_STORE_NAME);
      const request = store.put({
        slotId: snapshot.summary.slotId,
        snapshot,
      } satisfies StoredSaveRecord);

      request.onerror = () => reject(request.error ?? new Error('Unable to save the snapshot.'));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save the snapshot.'));
    });
  }

  private async getAllRecords() {
    const database = await this.getDatabase();

    return new Promise<StoredSaveRecord[]>((resolve, reject) => {
      const transaction = database.transaction(INDEXED_DB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(INDEXED_DB_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as StoredSaveRecord[]) ?? []);
      request.onerror = () => reject(request.error ?? new Error('Unable to list save slots.'));
    });
  }

  private getDatabase() {
    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const openRequest = indexedDB.open(INDEXED_DB_NAME, 1);

        openRequest.onupgradeneeded = () => {
          const database = openRequest.result;

          if (!database.objectStoreNames.contains(INDEXED_DB_STORE_NAME)) {
            database.createObjectStore(INDEXED_DB_STORE_NAME, {
              keyPath: 'slotId',
            });
          }
        };
        openRequest.onsuccess = () => resolve(openRequest.result);
        openRequest.onerror = () => reject(openRequest.error ?? new Error('Unable to open save database.'));
      });
    }

    return this.databasePromise;
  }
}

export function createSavePersistence(): SavePersistence {
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDbSavePersistence();
  }

  return new LocalStorageSavePersistence();
}
