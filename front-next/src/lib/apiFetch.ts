/**
 * Wrapper sobre fetch que verifica res.ok y lanza un Error con el mensaje
 * del backend (en español). Todas las llamadas al API deben usar este helper
 * en vez de fetch directo, para que los errores se muestren al usuario.
 */

export interface ApiFetchOptions extends RequestInit {
  /** Si es true, no intenta parsear el body como JSON (para DELETE sin body). */
  noJson?: boolean
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data === 'string') return data
    if (data.message) {
      // message puede ser string o string[]
      if (Array.isArray(data.message)) return data.message[0]
      return data.message
    }
    if (data.error) return data.error
  } catch {
    // no era JSON
  }
  return `Error ${res.status}: ${res.statusText}`
}

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<any> {
  const { noJson, ...fetchOptions } = options
  const res = await fetch(url, {
    credentials: 'include',
    ...fetchOptions
  })

  if (!res.ok) {
    const message = await parseError(res)
    throw new Error(message)
  }

  if (noJson || res.status === 204) return null
  return res.json()
}

/** Helper para peticiones JSON con body (POST/PATCH). */
export function jsonBody(data: unknown): string {
  return JSON.stringify(data)
}

export const jsonHeaders = {
  'Content-Type': 'application/json'
}
