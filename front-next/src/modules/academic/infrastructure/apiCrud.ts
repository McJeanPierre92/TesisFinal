import { apiFetch, jsonBody, jsonHeaders } from '@/lib/apiFetch'
import { Paginated } from '../domain/academic'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = jsonHeaders

// Helper genérico para fetch + desempaquetar la respuesta paginada (r.data).
// Los endpoints académicos devuelven { data, total, page, limit, totalPages };
// el frontend necesita un array plano para el DataTable client-side.
export async function fetchList<T>(resource: string): Promise<T[]> {
  const data = await apiFetch(`${API}/${resource}?page=1&limit=100`, {
    method: 'GET',
    headers
  })
  return Array.isArray(data) ? data : (data.data ?? [])
}

// Para el dashboard: solo necesita el total
export async function fetchTotal(resource: string): Promise<number> {
  try {
    const data = await apiFetch(`${API}/${resource}?page=1&limit=1`, {
      method: 'GET',
      headers
    })
    return data.total ?? 0
  } catch {
    return 0
  }
}

export async function fetchOne<T>(resource: string, id: number): Promise<T> {
  return apiFetch(`${API}/${resource}/${id}`, { method: 'GET', headers })
}

async function create(resource: string, payload: any): Promise<any> {
  return apiFetch(`${API}/${resource}`, {
    method: 'POST',
    headers,
    body: jsonBody(payload)
  })
}

async function update(
  resource: string,
  id: number,
  payload: any
): Promise<any> {
  return apiFetch(`${API}/${resource}/${id}`, {
    method: 'PATCH',
    headers,
    body: jsonBody(payload)
  })
}

async function remove(resource: string, id: number): Promise<void> {
  await apiFetch(`${API}/${resource}/${id}`, {
    method: 'DELETE',
    noJson: true
  })
}

// ============================================================
// Repositorios por entidad
// ============================================================

import {
  Institution,
  Level,
  Subject,
  ClassGroup,
  Enrollment,
  TeachingAssignment,
  Schedule
} from '../domain/academic'

type CrudRepo<T> = {
  getAll: () => Promise<T[]>
  getOne: (id: number) => Promise<T>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
  delete: (id: number) => Promise<void>
}

export const apiInstitution = (): CrudRepo<Institution> => ({
  getAll: () => fetchList<Institution>('institution'),
  getOne: (id) => fetchOne('institution', id),
  create: (data) => create('institution', data),
  update: (id, data) => update('institution', id, data),
  delete: (id) => remove('institution', id)
})

export const apiLevel = (): CrudRepo<Level> => ({
  getAll: () => fetchList<Level>('level'),
  getOne: (id) => fetchOne('level', id),
  create: (data) => create('level', data),
  update: (id, data) => update('level', id, data),
  delete: (id) => remove('level', id)
})

export const apiSubject = (): CrudRepo<Subject> => ({
  getAll: () => fetchList<Subject>('subject'),
  getOne: (id) => fetchOne('subject', id),
  create: (data) => create('subject', data),
  update: (id, data) => update('subject', id, data),
  delete: (id) => remove('subject', id)
})

export const apiClassGroup = (): CrudRepo<ClassGroup> => ({
  getAll: () => fetchList<ClassGroup>('class-group'),
  getOne: (id) => fetchOne('class-group', id),
  create: (data) => create('class-group', data),
  update: (id, data) => update('class-group', id, data),
  delete: (id) => remove('class-group', id)
})

export const apiEnrollment = (): CrudRepo<Enrollment> => ({
  getAll: () => fetchList<Enrollment>('enrollment'),
  getOne: (id) => fetchOne('enrollment', id),
  create: (data) => create('enrollment', data),
  update: (id, data) => update('enrollment', id, data),
  delete: (id) => remove('enrollment', id)
})

export const apiTeachingAssignment = (): CrudRepo<TeachingAssignment> => ({
  getAll: () => fetchList<TeachingAssignment>('teaching-assignment'),
  getOne: (id) => fetchOne('teaching-assignment', id),
  create: (data) => create('teaching-assignment', data),
  update: (id, data) => update('teaching-assignment', id, data),
  delete: (id) => remove('teaching-assignment', id)
})

export const apiSchedule = (): CrudRepo<Schedule> => ({
  getAll: () => fetchList<Schedule>('schedule'),
  getOne: (id) => fetchOne('schedule', id),
  create: (data) => create('schedule', data),
  update: (id, data) => update('schedule', id, data),
  delete: (id) => remove('schedule', id)
})

// Helper para obtener usuarios (no paginado, array plano)
export async function fetchUsers(): Promise<any[]> {
  const data = await apiFetch(`${API}/user`, { method: 'GET', headers })
  return Array.isArray(data) ? data : []
}
