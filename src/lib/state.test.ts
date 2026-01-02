import { beforeEach, describe, expect, test } from "bun:test";

import { initApp, sarcasmMode, saveSarcasmMode } from "./state";

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  clear(): void {
    this.store = {};
  }
}

describe("sarcasm mode persistence", () => {
  beforeEach(() => {
    globalThis.localStorage = new LocalStorageMock();
    globalThis.window = globalThis as typeof globalThis & Window;
  });

  test("sarcasmMode defaults to false when localStorage is empty", () => {
    initApp();
    expect(sarcasmMode.value).toBe(false);
  });

  test("saveSarcasmMode persists to localStorage", () => {
    saveSarcasmMode(true);
    expect(localStorage.getItem("worksafe-sarcasm-mode")).toBe("true");
    expect(sarcasmMode.value).toBe(true);

    saveSarcasmMode(false);
    expect(localStorage.getItem("worksafe-sarcasm-mode")).toBe("false");
    expect(sarcasmMode.value).toBe(false);
  });

  test("initApp loads sarcasmMode from localStorage", () => {
    localStorage.setItem("worksafe-sarcasm-mode", "true");
    initApp();
    expect(sarcasmMode.value).toBe(true);

    localStorage.clear();
    localStorage.setItem("worksafe-sarcasm-mode", "false");
    initApp();
    expect(sarcasmMode.value).toBe(false);
  });

  test("sarcasmMode persists across app reload simulation", () => {
    saveSarcasmMode(true);
    expect(sarcasmMode.value).toBe(true);

    initApp();
    expect(sarcasmMode.value).toBe(true);

    saveSarcasmMode(false);
    expect(sarcasmMode.value).toBe(false);

    initApp();
    expect(sarcasmMode.value).toBe(false);
  });
});
