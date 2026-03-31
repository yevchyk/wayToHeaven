function getStorage() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage;
}

export function loadJsonFromStorage<TValue>(key: string, fallbackValue: TValue): TValue {
  const storage = getStorage();

  if (!storage) {
    return fallbackValue;
  }

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue) as TValue;
  } catch {
    return fallbackValue;
  }
}

export function saveJsonToStorage<TValue>(key: string, value: TValue) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota and availability failures for optional shell persistence.
  }
}
