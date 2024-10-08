const APP_STORAGE_SUFFIX = "@FrontendBoilerplate:";

function storageGet<T>(key: string): T | undefined {
  const stringified =
    typeof window !== "undefined"
      ? localStorage.getItem(`${APP_STORAGE_SUFFIX}${key}`)
      : undefined;
  if (!stringified) {
    return undefined;
  }

  return JSON.parse(stringified) as T;
}

function storageSet(key: string, data: object | string): void {
  localStorage.setItem(`${APP_STORAGE_SUFFIX}${key}`, JSON.stringify(data));
}

function storageDelete(key: string): void {
  localStorage.removeItem(`${APP_STORAGE_SUFFIX}${key}`);
}

function storageClear(): void {
  localStorage.clear();
}

export { storageGet, storageSet, storageDelete, storageClear };
