export async function loadDevFallbackJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load dev fallback JSON: ${path}`)
  }

  return (await response.json()) as T
}

export async function tryLoadDevFallbackJson<T>(path: string): Promise<T | null> {
  try {
    return await loadDevFallbackJson<T>(path)
  } catch {
    return null
  }
}
