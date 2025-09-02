// テスト環境（Vitest）でZustandストアを自動的にリセットする仕組みを構築する

import { act } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import * as zustand from 'zustand';

// 元のzustandライブラリから、実際の`create`と`createStore`関数をインポートしておく。
// これらは後で、リセット機能を追加したカスタム版の関数内で使用される。
const { create: actualCreate, createStore: actualCreateStore } =
  await vi.importActual<typeof zustand>('zustand');

// アプリ内で宣言された全てのストアのリセット関数を保持するためのSetオブジェクト。
// Setを使うことで、同じリセット関数が重複して登録されるのを防ぐ。
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
  // to support curried version of create
  return typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried;
}) as typeof zustand.create;

const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const createStore = (<T>(stateCreator: zustand.StateCreator<T>) => {
  // to support curried version of createStore
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
}) as typeof zustand.createStore;

// reset all stores after each test run
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
});
