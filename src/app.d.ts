// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="vite-plugin-pwa/svelte" />
/// <reference types="vite-plugin-pwa/info" />

declare global {
	type BackupPayload = {
		version: number;
		exportedAt: string;
		data: Record<string, unknown> & {
			workspaces?: Record<string, unknown>;
		};
	};

	interface Window {
		loadPyodide?: (options: { indexURL: string }) => Promise<unknown>;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@yowasp/clang' {
	// Runtime export used by wasmCppRuntime; not declared in upstream types.
	export const runClang: (
		args?: string[],
		files?: Record<string, unknown>,
		options?: Record<string, unknown>
	) => Promise<Record<string, unknown>>;
}

export {};
