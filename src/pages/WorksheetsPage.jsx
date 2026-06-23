import React, { useState, useMemo } from 'react'
import { useApp } from '../App'
import PreviewModal from '../components/PreviewModal.jsx'
import EditModal    from '../components/EditModal.jsx'
import DeleteModal  from '../components/DeleteModal.jsx'

export default function WorksheetsPage() {
  const { worksheets, subjects, selected, toggleSelect, clearSelected, printSelected, getSubject } = useApp()

  const [filter,       setFilter]       = useState('all')
  const [previewItem,  setPreviewItem]  = useState(null)
  const [editItem,     setEditItem]     = useState(null)
  const [deleteItem,   setDeleteItem]   = useState(null)

  const filtered = useMemo(() =>
    filter === 'all' ? worksheets : worksheets.filter(w => w.subject_key === filter),
    [worksheets, filter]
  )

  return (
    <>
      <div className="topbar">
        <span className="page-title">ใบงานทั้งหมด</span>
        <div className="topbar-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setEditItem({})}>
            <i className="ti ti-edit" aria-hidden="true" /> แก้ไขชื่อ
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setDeleteItem({})}>
            <i className="ti ti-trash" aria-hidden="true" /> ลบใบงาน
          </button>
        </div>
      </div>

      <div className="content">
        {/* Filter chips */}
        <div className="filter-bar">
          <button className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>ทั้งหมด</button>
          {subjects.map(s => (
            <button
              key={s.key}
              className={`chip${filter === s.key ? ' active' : ''}`}
              onClick={() => setFilter(s.key)}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        <div className="section-header">
          <span className="section-title">
            ใบงาน <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 13 }}>{filtered.length} ใบ</span>
          </span>
          {selected.size > 0 && (
            <button className="btn btn-outline btn-sm" onClick={clearSelected}>ยกเลิกทั้งหมด</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-file-off" />
            <p>ยังไม่มีใบงาน — ลองอัปโหลดใหม่สิ</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(ws => (
              <WorksheetCard
                key={ws.id}
                ws={ws}
                subject={getSubject(ws.subject_key)}
                isSelected={selected.has(ws.id)}
                onToggle={() => toggleSelect(ws.id)}
                onPreview={() => setPreviewItem(ws)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print bar */}
      <div className="print-bar">
        <div className="print-bar-left">
          <i className="ti ti-printer" style={{ fontSize: 20, color: 'var(--accent)' }} aria-hidden="true" />
          เลือกแล้ว <strong>{selected.size}</strong> ใบ
          &nbsp;·&nbsp;
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>คลิกที่ใบงานเพื่อเลือก / ดับเบิลคลิกเพื่อ preview</span>
        </div>
        <button className="btn btn-primary" disabled={!selected.size} onClick={printSelected}>
          <i className="ti ti-printer" aria-hidden="true" /> ปริ้น ({selected.size} ใบ)
        </button>
      </div>

      {/* Modals */}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      {editItem    && <EditModal    onClose={() => setEditItem(null)} />}
      {deleteItem  && <DeleteModal  onClose={() => setDeleteItem(null)} />}
    </>
  )
}

function WorksheetCard({ ws, subject, isSelected, onToggle, onPreview }) {
  const [clicks, setClicks] = useState(0)

  function handleClick() {
    setClicks(n => {
      const next = n + 1
      if (next === 2) { onPreview(); return 0 }
      setTimeout(() => setClicks(0), 300)
      return next
    })
    onToggle()
  }

  return (
    <div
      className={`ws-card${isSelected ? ' selected' : ''}`}
      onClick={handleClick}
      title="คลิกเลือก · ดับเบิลคลิก preview"
    >
      <div className={`ws-thumb ${subject.color}`}>
        {ws.thumbnail_url
          ? <img src={ws.thumbnail_url} alt={ws.name} />
          : <span className="ws-thumb-icon">{subject.emoji}</span>
        }
        <span className={`ws-badge badge-${subject.color}`}>{subject.label}</span>
        <div className="ws-check"><i className="ti ti-check" aria-hidden="true" /></div>
        {ws.printed && (
          <div className="ws-printed"><i className="ti ti-printer" aria-hidden="true" /></div>
        )}
      </div>
      <div className="ws-body">
        <div className="ws-name" title={ws.name}>{ws.name}</div>
        <div className="ws-meta">{ws.page_count || 1} หน้า · {ws.created_at ? new Date(ws.created_at).toLocaleDateString('th-TH') : ''}</div>
      </div>
    </div>
  )
}
