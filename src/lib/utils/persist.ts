"use client";

import { type Mutate, type StoreApi } from "zustand";

export type StoreWithPersist<T> = Mutate<
	StoreApi<T>,
	[["zustand/persist", unknown]]
>;

export const withStorageDOMEvents = <T>(store: StoreWithPersist<T>) => {
	if (typeof window === "undefined") {
		// console.warn("withStorageDOMEvents: window is undefined");
		return;
	}
	const storageEventCallback = (e: StorageEvent) => {
		if (e.key === store.persist.getOptions().name && e.newValue) {
			void store.persist.rehydrate();
		}
	};

	window.addEventListener("storage", storageEventCallback);

	return () => {
		window.removeEventListener("storage", storageEventCallback);
	};
};