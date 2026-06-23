import React, { useState } from 'react'
import { useApp } from '../App'

export default function InlineEditModal({ ws, onClose }) {
  const { subjects, editWorksheet } = useApp()
  const [name,    setName]    = useState(ws.name)
  const [subjKey, setSubjKey] = useState(ws.subject_key)
  const [saving,  setSaving]  = useState(false)

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    await editWorksheet(String(ws.id), { name: name.trim(), subject_key: subjKey })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <i className="ti ti-edit" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          แก้ไขชื่อใบงาน
        </div>

        {/* แสดง thumbnail ถ้ามี */}
        {ws.thumbnail_url && (
          <img
            src={ws.thumbnail_url}
            alt={ws.name}
            style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
          />
        )}

        <div className="form-group">
          <label className="form-label">ชื่อใบงาน</label>
          <input
            autoFocus
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">วิชา</label>
          <select className="form-select" value={subjKey} onChange={e => setSubjKey(e.target.value)}>
            {subjects.map(s => <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save} disabled={saving || !name.trim()}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
