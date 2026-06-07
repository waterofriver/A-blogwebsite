const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "")

export const getBackendBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  if (!baseUrl) {
    throw new Error("Missing backend base URL configuration. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BACKEND_URL in .env.local.")
  }

  return normalizeBaseUrl(baseUrl)
}