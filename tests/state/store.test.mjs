import { StateStore, cloneValue } from "../../src/state/store";
import { createDefaultState } from "../../src/state/defaultState";

describe("cloneValue", () => {
  it("deep clones a plain object", () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = cloneValue(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it("deep clones an array", () => {
    const original = [1, [2, 3]];
    const cloned = cloneValue(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[1]).not.toBe(original[1]);
  });

  it("returns undefined for undefined input", () => {
    expect(cloneValue(undefined)).toBeUndefined();
  });

  it("returns null for null input", () => {
    expect(cloneValue(null)).toBeNull();
  });

  it("drops undefined values from objects (JSON.stringify behavior)", () => {
    const result = cloneValue({ a: 1, b: undefined, c: 3 });
    expect(result).toEqual({ a: 1, c: 3 });
    expect(result).not.toHaveProperty("b");
  });

  it("converts NaN to null", () => {
    const result = cloneValue({ a: NaN });
    expect(result.a).toBeNull();
  });

  it("converts Infinity to null", () => {
    const result = cloneValue({ a: Infinity });
    expect(result.a).toBeNull();
  });

  it("converts -Infinity to null", () => {
    const result = cloneValue({ a: -Infinity });
    expect(result.a).toBeNull();
  });

  it("drops function properties", () => {
    const result = cloneValue({ a: 1, fn: () => {} });
    expect(result).toEqual({ a: 1 });
    expect(result).not.toHaveProperty("fn");
  });

  it("handles nested objects with mixed values", () => {
    const original = { a: { b: undefined, c: 2 }, d: [1, undefined, 3] };
    const cloned = cloneValue(original);
    expect(cloned.a).toEqual({ c: 2 });
    expect(cloned.d).toEqual([1, null, 3]);
  });

  it("handles primitives", () => {
    expect(cloneValue(42)).toBe(42);
    expect(cloneValue("hello")).toBe("hello");
    expect(cloneValue(true)).toBe(true);
    expect(cloneValue(false)).toBe(false);
  });
});

function track(store, path = "") {
  const calls = [];
  store.subscribe(path, (next, prev) => calls.push({ next, prev }));
  return calls;
}

describe("StateStore", () => {
  it("creates with default state", () => {
    const store = new StateStore({ a: 1 });
    expect(store.get()).toEqual({ a: 1 });
  });

  it("deep clones initial state", () => {
    const original = { a: { b: 1 } };
    const store = new StateStore(original);
    original.a.b = 99;
    expect(store.get("a.b")).toBe(1);
  });

  it("get() returns full state with no path", () => {
    const store = new StateStore({ a: 1, b: 2 });
    expect(store.get()).toEqual({ a: 1, b: 2 });
  });

  it("get() returns nested value with dot path", () => {
    const store = new StateStore({ a: { b: { c: 42 } } });
    expect(store.get("a.b.c")).toBe(42);
  });

  it("get() returns undefined for nonexistent path", () => {
    const store = new StateStore({ a: 1 });
    expect(store.get("b.c")).toBeUndefined();
  });

  it("get() returns undefined for partially nonexistent path", () => {
    const store = new StateStore({ a: { b: 1 } });
    expect(store.get("a.x.y")).toBeUndefined();
  });

  it("set() merges deeply into existing state", () => {
    const store = new StateStore({ a: { b: 1, c: 2 }, d: 3 });
    store.set({ a: { b: 99 } });
    expect(store.get()).toEqual({ a: { b: 99, c: 2 }, d: 3 });
  });

  it("set() replaces arrays entirely", () => {
    const store = new StateStore({ items: [1, 2, 3] });
    store.set({ items: [4, 5] });
    expect(store.get("items")).toEqual([4, 5]);
  });

  it("set() handles null values", () => {
    const store = new StateStore({ a: { b: 1 } });
    store.set({ a: null });
    expect(store.get("a")).toBeNull();
  });

  it("set() does not deep-clone arrays (reference assigned)", () => {
    const store = new StateStore({ items: [] });
    const arr = [1, 2, 3];
    store.set({ items: arr });
    expect(store.get("items")).toBe(arr);
  });

  it("set() emits change notification", () => {
    const store = new StateStore({ a: 1 });
    const calls = track(store);
    store.set({ a: 2 });
    expect(calls).toHaveLength(1);
    expect(calls[0].next).toEqual({ a: 2 });
  });

  it("set() does NOT emit when value is unchanged", () => {
    const store = new StateStore({ a: 1 });
    const calls = track(store);
    store.set({ a: 1 });
    expect(calls).toHaveLength(0);
  });

  it("replace() sets value at dot path", () => {
    const store = new StateStore({ a: { b: 1 } });
    store.replace("a.b", 99);
    expect(store.get("a.b")).toBe(99);
  });

  it("replace() creates intermediate objects", () => {
    const store = new StateStore({});
    store.replace("x.y.z", 42);
    expect(store.get("x.y.z")).toBe(42);
  });

  it("replace() deep-clones the value", () => {
    const store = new StateStore({});
    const inner = { b: 1 };
    store.replace("a", inner);
    expect(store.get("a")).not.toBe(inner);
  });

  it("replace() emits change", () => {
    const store = new StateStore({ a: 1 });
    const calls = track(store, "a");
    store.replace("a", 2);
    expect(calls).toHaveLength(1);
  });

  it("reset() replaces entire state", () => {
    const store = new StateStore({ a: 1, b: 2 });
    store.reset({ c: 3 });
    expect(store.get()).toEqual({ c: 3 });
  });

  it("reset() deep-clones the new state", () => {
    const original = { a: { b: 1 } };
    const store = new StateStore({});
    store.reset(original);
    original.a.b = 99;
    expect(store.get("a.b")).toBe(1);
  });

  it("reset() emits change", () => {
    const store = new StateStore({ a: 1 });
    const calls = track(store);
    store.reset({ a: 2 });
    expect(calls).toHaveLength(1);
  });

  it("transaction() batches multiple sets into one emit", () => {
    const store = new StateStore({ a: 1, b: 2 });
    const calls = track(store);
    store.transaction(() => {
      store.set({ a: 10 });
      store.set({ b: 20 });
    });
    expect(calls).toHaveLength(1);
    expect(store.get()).toEqual({ a: 10, b: 20 });
  });

  it("transaction() does not emit if nothing changed", () => {
    const store = new StateStore({ a: 1 });
    const calls = track(store);
    store.transaction(() => {
      store.set({ a: 1 });
    });
    expect(calls).toHaveLength(0);
  });

  it("nested transaction() only emits once on outer completion", () => {
    const store = new StateStore({ a: 1, b: 2 });
    const calls = track(store);
    store.transaction(() => {
      store.set({ a: 10 });
      store.transaction(() => {
        store.set({ b: 20 });
      });
    });
    expect(calls).toHaveLength(1);
  });

  it("subscribe() fires callback on matching path change", () => {
    const store = new StateStore({ a: 1, b: 2 });
    const aCalls = [];
    const bCalls = [];
    store.subscribe("a", (next, prev) => aCalls.push({ next, prev }));
    store.subscribe("b", (next, prev) => bCalls.push({ next, prev }));
    store.set({ a: 10 });
    expect(aCalls).toHaveLength(1);
    expect(aCalls[0].next).toBe(10);
    expect(aCalls[0].prev).toBe(1);
    expect(bCalls).toHaveLength(0);
  });

  it("subscribe() fires on nested path changes", () => {
    const store = new StateStore({ x: { y: 1 } });
    const calls = [];
    store.subscribe("x.y", (next, prev) => calls.push({ next, prev }));
    store.set({ x: { y: 2 } });
    expect(calls).toHaveLength(1);
    expect(calls[0].next).toBe(2);
  });

  it("subscribe() returns unsubscribe function", () => {
    const store = new StateStore({ a: 1 });
    const calls = [];
    const unsubscribe = store.subscribe("a", (next, prev) => calls.push({ next, prev }));
    unsubscribe();
    store.set({ a: 2 });
    expect(calls).toHaveLength(0);
  });

  it("subscribe('') watches entire state", () => {
    const store = new StateStore({ a: 1 });
    const calls = [];
    store.subscribe("", (next) => calls.push(next));
    store.set({ a: 2 });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ a: 2 });
  });

  it("multiple subscribers all receive notifications", () => {
    const store = new StateStore({ a: 1 });
    const c1 = [];
    const c2 = [];
    store.subscribe("a", (n) => c1.push(n));
    store.subscribe("a", (n) => c2.push(n));
    store.set({ a: 2 });
    expect(c1).toHaveLength(1);
    expect(c2).toHaveLength(1);
  });

  it("does not call subscriber when its watched path did not change", () => {
    const store = new StateStore({ a: 1, b: 2 });
    const calls = [];
    store.subscribe("b", (n) => calls.push(n));
    store.set({ a: 99 });
    expect(calls).toHaveLength(0);
  });

  it("handles being recreated with createDefaultState", () => {
    const defaultState = createDefaultState();
    const store = new StateStore(defaultState);
    const state = store.get();
    expect(state).toHaveProperty("viewer");
    expect(state).toHaveProperty("cell");
    expect(state).toHaveProperty("bond");
    expect(state).toHaveProperty("plugins");
    expect(state).toHaveProperty("camera");
    expect(state).toHaveProperty("animation");
    expect(state).toHaveProperty("materials");
    expect(state).toHaveProperty("shapes");
    expect(state.viewer.modelStyle).toBe(0);
    expect(state.camera.zoom).toBe(1);
  });

  it("createDefaultState is independent across calls", () => {
    const a = createDefaultState();
    const b = createDefaultState();
    expect(a).toEqual(b);
    a.viewer.modelStyle = 99;
    expect(b.viewer.modelStyle).toBe(0);
  });
});

