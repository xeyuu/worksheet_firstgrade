import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  fetchWorksheets, fetchSubjects, fetchHistory,
  deleteWorksheet as dbDeleteWs,
  updateWorksheet as dbUpdateWs,
  insertHistory, clearHistoryAll,
  deleteFile,
} from './lib/supabase'
import { useToast } from './hooks/useToast'

import WorksheetsPage from './pages/WorksheetsPage.jsx'
import UploadPage     from './pages/UploadPage.jsx'
import HistoryPage    from './pages/HistoryPage.jsx'
import SubjectsPage   from './pages/SubjectsPage.jsx'

// ─── App context ───────────────────────────────────────────────────────
const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const DEFAULT_SUBJECTS = [
  { id: 'thai', key: 'thai', label: 'ภาษาไทย', emoji: '🇹🇭', color: 'thai', locked: true },
  { id: 'math', key: 'math', label: 'คณิตศาสตร์', emoji: '📐', color: 'math', locked: true },
  { id: 'art',  key: 'art',  label: 'ศิลปะ',      emoji: '🎨', color: 'art',  locked: true },
]

export default function App() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { toast, showToast } = useToast()

  const [worksheets, setWorksheets] = useState([])
  const [subjects,   setSubjects]   = useState(DEFAULT_SUBJECTS)
  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(new Set())

  // ── Load from Supabase ───────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [ws, subj, hist] = await Promise.all([
          fetchWorksheets(),
          fetchSubjects(),
          fetchHistory(),
        ])
        setWorksheets(ws || [])
        // Merge DB subjects with locked defaults
        const dbSubj = subj || []
        const merged = [
          ...DEFAULT_SUBJECTS,
          ...dbSubj.filter(s => !DEFAULT_SUBJECTS.find(d => d.key === s.key)),
        ]
        setSubjects(merged)
        setHistory(hist || [])
      } catch (e) {
        showToast('ไม่สามารถโหลดข้อมูลได้: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Subject helper ───────────────────────────────────────
  const getSubject = useCallback(
    (key) => subjects.find(s => s.key === key) || { label: key, emoji: '📄', color: 'other' },
    [subjects]
  )

  // ── Selection ────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])
  const clearSelected = useCallback(() => setSelected(new Set()), [])

  // ── Print ─────────────────────────────────────────────────
  const printSelected = useCallback(async () => {
    if (!selected.size) return
    const ids = [...selected]
    const items = worksheets.filter(w => ids.includes(String(w.id)))
    const names = items.map(w => w.name)
    const subjLabels = [...new Set(items.map(w => getSubject(w.subject_key).label))]
    const entry = {
      worksheet_ids: ids,
      worksheet_names: names,
      subject_labels: subjLabels,
      printed_at: new Date().toISOString(),
    }
    try {
      await insertHistory(entry)
      await Promise.all(ids.map(id => dbUpdateWs(id, { printed: true })))
      setWorksheets(prev => prev.map(w => ids.includes(String(w.id)) ? { ...w, printed: true } : w))
      setHistory(prev => [{ ...entry, id: Date.now() }, ...prev])
      clearSelected()

      // เปิดไฟล์จริงแต่ละใบในแท็บใหม่ให้ browser จัดการ print
      const fileUrls = [...new Set(items.map(w => w.file_url).filter(Boolean))]
      if (fileUrls.length === 0) {
        showToast('ไม่พบไฟล์สำหรับปริ้น')
        return
      }
      if (fileUrls.length === 1) {
        const win = window.open(fileUrls[0], '_blank')
        if (win) win.onload = () => { win.focus(); win.print() }
      } else {
        fileUrls.forEach((url, i) => {
          setTimeout(() => window.open(url, '_blank'), i * 600)
        })
      }
      showToast(`เปิดไฟล์ปริ้น ${names.length} ใบเรียบร้อย ✓`)
    } catch (e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message)
    }
  }, [selected, worksheets, getSubject, clearSelected])

  // ── Edit name ─────────────────────────────────────────────
  const editWorksheet = useCallback(async (id, fields) => {
    try {
      await dbUpdateWs(id, fields)
      setWorksheets(prev => prev.map(w => w.id === id ? { ...w, ...fields } : w))
      showToast('บันทึกเรียบร้อย')
    } catch (e) {
      showToast('แก้ไขไม่สำเร็จ: ' + e.message)
    }
  }, [])

  // ── Delete worksheet ──────────────────────────────────────
  const removeWorksheet = useCallback(async (id) => {
    const ws = worksheets.find(w => w.id === id)
    try {
      if (ws?.storage_path) await deleteFile(ws.storage_path)
      await dbDeleteWs(id)
      setWorksheets(prev => prev.filter(w => w.id !== id))
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
      showToast('ลบใบงานเรียบร้อย')
    } catch (e) {
      showToast('ลบไม่สำเร็จ: ' + e.message)
    }
  }, [worksheets])

  // ── Add worksheet (called from UploadPage) ────────────────
  const addWorksheets = useCallback((newItems) => {
    setWorksheets(prev => [...newItems, ...prev])
  }, [])

  // ── Add subject ───────────────────────────────────────────
  const addSubject = useCallback((subj) => {
    setSubjects(prev => [...prev, subj])
  }, [])

  // ── Remove subject ────────────────────────────────────────
  const removeSubject = useCallback((key) => {
    setSubjects(prev => prev.filter(s => s.key !== key))
    showToast('ลบวิชาเรียบร้อย')
  }, [])

  // ── Clear history ─────────────────────────────────────────
  const clearAllHistory = useCallback(async () => {
    try {
      await clearHistoryAll()
      setHistory([])
      showToast('ล้างประวัติเรียบร้อย')
    } catch (e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message)
    }
  }, [])

  const nav = (path) => navigate(path)
  const currentPath = location.pathname

  const ctx = {
    worksheets, subjects, history,
    loading, selected,
    getSubject,
    toggleSelect, clearSelected, printSelected,
    editWorksheet, removeWorksheet, addWorksheets,
    addSubject, removeSubject, clearAllHistory,
    showToast,
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <i className="ti ti-notebook" aria-hidden="true" />
            ใบงาน
          </div>
          <NavItem icon="ti-layout-grid" label="ใบงานทั้งหมด" path="/"         current={currentPath} onClick={() => nav('/')} />
          <NavItem icon="ti-upload"      label="อัปโหลดไฟล์"  path="/upload"    current={currentPath} onClick={() => nav('/upload')} />
          <NavItem icon="ti-history"     label="ประวัติปริ้น"  path="/history"   current={currentPath} onClick={() => nav('/history')} />
          <NavItem icon="ti-book"        label="จัดการวิชา"   path="/subjects"  current={currentPath} onClick={() => nav('/subjects')} />
          <div className="sidebar-footer">
            <i className="ti ti-database" style={{ fontSize: 14 }} aria-hidden="true" /> บันทึกบน Supabase
            <br /><span>ไฟล์ไม่หายแม้ปิดเว็บ</span>
          </div>
        </aside>

        {/* Pages */}
        <div className="main">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : (
            <Routes>
              <Route path="/"         element={<WorksheetsPage />} />
              <Route path="/upload"   element={<UploadPage />} />
              <Route path="/history"  element={<HistoryPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
            </Routes>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </AppCtx.Provider>
  )
}

function NavItem({ icon, label, path, current, onClick }) {
  const active = current === path || (path !== '/' && current.startsWith(path))
  return (
    <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <i className={`ti ${icon}`} aria-hidden="true" />
      {label}
    </button>
  )
}
