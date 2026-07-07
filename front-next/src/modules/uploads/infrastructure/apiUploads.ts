import { apiFetch } from '@/lib/apiFetch'

const API = process.env.NEXT_PUBLIC_URL_API

export type UploadResult = {
  fileUrl: string
  originalName: string
  size: number
  mimetype: string
}

/**
 * Sube un archivo al endpoint de entregas.
 * Usa FormData (NO JSON) porque va un file binario.
 */
export const uploadSubmissionFile = async (
  file: File
): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)

  // No se setea Content-Type: el navegador lo hace automáticamente con el boundary
  return apiFetch(`${API}/uploads/submission-file`, {
    method: 'POST',
    body: formData
  })
}

