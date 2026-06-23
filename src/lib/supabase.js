import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables. Copy .env.example → .env and fill in your values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Storage helpers ────────────────────────────────────────────────
const BUCKET = 'worksheets'

/** Upload a File object. Returns the public URL. */
export async function uploadFile(file, path) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Delete a file from storage */
export async function deleteFile(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

// ─── DB helpers ─────────────────────────────────────────────────────

/** Worksheets */
export async function fetchWorksheets() {
  const { data, error } = await supabase
    .from('worksheets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertWorksheet(ws) {
  const { data, error } = await supabase.from('worksheets').insert(ws).select().single()
  if (error) throw error
  return data
}

export async function updateWorksheet(id, fields) {
  const { error } = await supabase.from('worksheets').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteWorksheet(id) {
  const { error } = await supabase.from('worksheets').delete().eq('id', id)
  if (error) throw error
}

/** Subjects */
export async function fetchSubjects() {
  const { data, error } = await supabase.from('subjects').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function insertSubject(subj) {
  const { data, error } = await supabase.from('subjects').insert(subj).select().single()
  if (error) throw error
  return data
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) throw error
}

/** Print history */
export async function fetchHistory() {
  const { data, error } = await supabase
    .from('print_history')
    .select('*')
    .order('printed_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertHistory(entry) {
  const { error } = await supabase.from('print_history').insert(entry)
  if (error) throw error
}

export async function clearHistoryAll() {
  const { error } = await supabase.from('print_history').delete().neq('id', 0)
  if (error) throw error
}
