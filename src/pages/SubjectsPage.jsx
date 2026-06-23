import React, { useState } from 'react'
import { useApp } from '../App'
import { insertSubject, deleteSubject as dbDeleteSubject } from '../lib/supabase'

const COLOR_OPTIONS = [
  { key: 'sky',      bg: 'var(--sky)',     border: 'var(--sky2)',      emoji: '🔷' },
  { key: 'rose',     bg: 'var(--rose)',    border: 'var(--rose2)',     emoji: '🌸' },
  { key: 'lemon',    bg: 'var(--lemon)',   border: 'var(--lemon2)',    emoji: '⭐' },
  { key: 'peach',    bg: 'var(--peach)',   border: 'var(--peach2)',    emoji: '🍊' },
  { key: 'mint',     bg: 'var(--mint)',    border: 'var(--mint2)',     emoji: '🌿' },
  { key: 'lavender', bg: 'var(--lavender)', border: 'var(--lavender2)', emoji: '💜' },
]

export default function SubjectsPage() {
  const { subjects, worksheets, addSubject, removeSubject, showToast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [name,  setName]  = useState('')
  const [color, setColor] = useState('sky')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim()) { showToast('กรุณาใส่ชื่อวิชา'); return }
    setSaving(true)
    const picked = COLOR_OPTIONS.find(c => c.key === color)
    try {
      const row = await insertSubject({
        key:   'subj_' + Date.now(),
        label: name.trim(),
        emoji: picked?.emoji || '📚',
        color: color,
      })
      addSubject({ ...row, locked: false })
      setShowModal(false)
      setName('')
      showToast('เพิ่มวิชา "' + name.trim() + '" เรียบร้อย')
    } catch (e) {
      showToast('เพิ่มวิชาไม่สำเร็จ: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(s) {
    if (worksheets.some(w => w.subject_key === s.key)) {
      showToast('ไม่สามารถลบวิชาที่มีใบงานอยู่'); return
    }
    try {
      await dbDeleteSubject(s.id)
      removeSubject(s.key)
    } catch (e) {
      showToast('ลบไม่สำเร็จ: ' + e.message)
    }
  }

  return (
    <>
      <div className="topbar">
        <span className="page-title">จัดการวิชา</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> เพิ่มวิชา
        </button>
      </div>
      <div className="content">
        <div className="grid">
          {subjects.map(s => {
            const count = worksheets.filter(w => w.subject_key === s.key).length
            return (
              <div key={s.key} className="subj-card">
                <div className={`subj-thumb ${s.color}`} style={{ fontSize: 32 }}>{s.emoji}</div>
                <div className="subj-body">
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{count} ใบงาน</div>
                  </div>
                  {s.locked
                    ? <span style={{ fontSize: 10, color: 'var(--text3)' }}>ค่าเริ่มต้น</span>
                    : <button className="subj-del" onClick={() => handleDelete(s)}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <i className="ti ti-book" style={{ color: 'var(--accent)' }} aria-hidden="true" />
              เพิ่มวิชาใหม่
            </div>
            <div className="form-group">
              <label className="form-label">ชื่อวิชา</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น วิทยาศาสตร์, ภาษาอังกฤษ..."
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">สีธีม</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.key}
                    className={`color-swatch${color === c.key ? ' picked' : ''}`}
                    style={{ background: c.bg, borderColor: c.border }}
                    onClick={() => setColor(c.key)}
                    title={c.emoji}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'เพิ่มวิชา'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
