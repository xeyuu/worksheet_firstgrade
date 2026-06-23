import React, { useState } from 'react'
import { useApp } from '../App'

const CONFIRM_KEY = 'จะลบแล้วนะ'

export default function DeleteModal({ onClose }) {
  const { worksheets, selected, removeWorksheet, clearSelected, showToast } = useApp()
  const [keyVal,  setKeyVal]  = useState('')
  const [loading, setLoading] = useState(false)

  // ใบงานที่เลือกอยู่ ถ้าไม่มีเลือก ให้แสดงทั้งหมดให้ user เลือก
  const selectedWs = worksheets.filter(w => selected.has(String(w.id)))
  const toDelete = selectedWs.length > 0 ? selectedWs : []

  async function confirm() {
    if (keyVal !== CONFIRM_KEY) {
      showToast('รหัสยืนยันไม่ถูกต้อง')
      return
    }
    if (toDelete.length === 0) {
      showToast('กรุณาเลือกใบงานก่อนลบ')
      return
    }
    setLoading(true)
    try {
      await Promise.all(toDelete.map(w => removeWorksheet(String(w.id))))
      clearSelected()
      showToast(`ลบ ${toDelete.length} ใบงานเรียบร้อย`)
      onClose()
    } catch(e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title" style={{ color: 'var(--danger)' }}>
          <i className="ti ti-trash" aria-hidden="true" />
          ยืนยันการลบ
        </div>

        {/* แสดงรายการที่จะลบ */}
        {toDelete.length > 0 ? (
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            maxHeight: 180, overflowY: 'auto'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
              จะลบใบงาน {toDelete.length} ใบต่อไปนี้:
            </div>
            {toDelete.map(w => (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0', fontSize: 13, color: 'var(--text)'
              }}>
                <i className="ti ti-file" style={{ fontSize: 14, color: 'var(--danger)', flexShrink: 0 }} aria-hidden="true" />
                {w.name}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--lemon)', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: 'var(--lemon3)'
          }}>
            <i className="ti ti-info-circle" aria-hidden="true" /> กรุณาเลือกใบงานที่ต้องการลบก่อนกดปุ่มนี้
          </div>
        )}

        <div className="form-group">
          <label className="form-label">พิมพ์รหัสยืนยันเพื่อลบ</label>
          <input
            type="text"
            className="form-input"
            value={keyVal}
            onChange={e => setKeyVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm() }}
            placeholder="พิมพ์ยืนยัน..."
            autoFocus
            style={{
              borderColor: keyVal && keyVal !== CONFIRM_KEY ? 'var(--danger)' : undefined
            }}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
          <button
            className="btn btn-danger"
            onClick={confirm}
            disabled={loading || keyVal !== CONFIRM_KEY || toDelete.length === 0}
          >
            {loading ? 'กำลังลบ...' : `ลบใบงาน${toDelete.length > 0 ? ` (${toDelete.length} ใบ)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
