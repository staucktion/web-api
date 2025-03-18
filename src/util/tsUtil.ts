export function hasKey<K extends string>(e: unknown, key: K): e is { [k in K]: unknown } {
	return typeof e === "object" && e !== null && key in (e as { key: unknown });
}
