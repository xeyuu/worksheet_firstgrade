import React, { useState, useMemo } from 'react'
import { useApp } from '../App'
import PreviewModal from '../components/PreviewModal.jsx'
import DeleteModal  from '../components/DeleteModal.jsx'
import InlineEditModal from '../components/InlineEditModal.jsx'

export default function WorksheetsPage() {
  const { worksheets, subjects, selected, toggleSelect, clearSelected, printSelected, getSubject } = useApp()

  const [filter,      setFilter]      = useState('all')
  const [previewItem, setPreviewItem] = useState(null)
  const [deleteItem,  setDeleteItem]  = useState(null)
  const [editItem,    setEditItem]    = useState(null)  // ws object ที่จะแก้

  const filtered = useMemo(() =>
    filter === 'all' ? worksheets : worksheets.filter(w => w.subject_key === filter),
    [worksheets, filter]
  )

  return (
    <>
      <div className="topbar">
        <span className="page-title">ใบงานทั้งหมด</span>
        <div className="topbar-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setDeleteItem({})}>
            <i className="ti ti-trash" aria-hidden="true" /> ลบใบงาน
          </button>
        </div>
      </div>

      <div className="content">
        <div className="filter-bar">
          <button className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>ทั้งหมด</button>
          {subjects.map(s => (
            <button key={s.key} className={`chip${filter === s.key ? ' active' : ''}`} onClick={() => setFilter(s.key)}>
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
                isSelected={selected.has(String(ws.id))}
                onToggle={() => toggleSelect(String(ws.id))}
                onPreview={() => setPreviewItem(ws)}
                onEdit={() => setEditItem(ws)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="print-bar">
        <div className="print-bar-left">
          <i className="ti ti-printer" style={{ fontSize: 20, color: 'var(--accent)' }} aria-hidden="true" />
          เลือกแล้ว <strong>{selected.size}</strong> ใบ
          &nbsp;·&nbsp;
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>คลิกการ์ดเพื่อเลือก · <i className="ti ti-edit" style={{fontSize:11}}/> เพื่อแก้ชื่อ</span>
        </div>
        <button className="btn btn-primary" disabled={!selected.size} onClick={printSelected}>
          <i className="ti ti-printer" aria-hidden="true" /> ปริ้น ({selected.size} ใบ)
        </button>
      </div>

      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      {deleteItem  && <DeleteModal  onClose={() => setDeleteItem(null)} />}
      {editItem    && <InlineEditModal ws={editItem} onClose={() => setEditItem(null)} />}
    </>
  )
}

function WorksheetCard({ ws, subject, isSelected, onToggle, onPreview, onEdit }) {
  return (
    <div className={`ws-card${isSelected ? ' selected' : ''}`} onClick={onToggle}>
      {/* Thumbnail */}
      <div
        className={`ws-thumb ${subject.color}`}
        onDoubleClick={e => { e.stopPropagation(); onPreview() }}
        title="ดับเบิลคลิกเพื่อ preview"
      >
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

      {/* Body */}
      <div className="ws-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
          <div className="ws-name" style={{ flex: 1 }} title={ws.name}>{ws.name}</div>
          {/* ปุ่มแก้ไข — หยุด propagation ไม่ให้การ์ด toggle */}
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            title="แก้ไขชื่อ"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 3px', borderRadius: 4, color: 'var(--text3)',
              flexShrink: 0, lineHeight: 1,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            <i className="ti ti-edit" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
        </div>
        <div className="ws-meta">
          {ws.page_count || 1} หน้า · {ws.created_at ? new Date(ws.created_at).toLocaleDateString('th-TH') : ''}
        </div>
      </div>
    </div>
  )
}
