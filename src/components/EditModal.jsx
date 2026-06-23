import React, { useState, useEffect } from 'react'
import { useApp } from '../App'

export default function EditModal({ onClose }) {
  const { worksheets, subjects, editWorksheet } = useApp()
  const [wsId,    setWsId]    = useState(String(worksheets[0]?.id || ''))
  const [name,    setName]    = useState('')
  const [subjKey, setSubjKey] = useState('thai')

  useEffect(() => {
    // Supabase returns id as number — must compare as string to match dropdown value
    const ws = worksheets.find(w => String(w.id) === wsId)
    if (ws) { setName(ws.name); setSubjKey(ws.subject_key) }
  }, [wsId, worksheets])

  async function save() {
    if (!name.trim()) return
    await editWorksheet(wsId, { name: name.trim(), subject_key: subjKey })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <i className="ti ti-edit" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          แก้ไขชื่อใบงาน
        </div>
        <div className="form-group">
          <label className="form-label">เลือกใบงาน</label>
          <select className="form-select" value={wsId} onChange={e => setWsId(e.target.value)}>
            {worksheets.map(w => <option key={w.id} value={String(w.id)}>{w.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">ชื่อใหม่</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ชื่อใบงาน..."
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
          <button className="btn btn-primary" onClick={save}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
