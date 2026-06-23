import React, { useState } from 'react'
import { useApp } from '../App'

const CONFIRM_KEY = 'จะลบแล้วนะ'

export default function DeleteModal({ onClose }) {
  const { worksheets, removeWorksheet, showToast } = useApp()
  const [wsId,    setWsId]    = useState(worksheets[0]?.id || '')
  const [keyVal,  setKeyVal]  = useState('')
  const [loading, setLoading] = useState(false)

  async function confirm() {
    if (keyVal !== CONFIRM_KEY) {
      showToast(`กรุณาพิมพ์ "${CONFIRM_KEY}" ให้ถูกต้อง`)
      return
    }
    setLoading(true)
    await removeWorksheet(wsId)
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title" style={{ color: 'var(--danger)' }}>
          <i className="ti ti-trash" aria-hidden="true" />
          ยืนยันการลบ
        </div>
        <div className="form-group">
          <label className="form-label">เลือกใบงานที่ต้องการลบ</label>
          <select className="form-select" value={wsId} onChange={e => setWsId(e.target.value)}>
            {worksheets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">
            พิมพ์ <strong style={{ color: 'var(--danger)' }}>{CONFIRM_KEY}</strong> เพื่อยืนยัน
          </label>
          <input
            type="text"
            className="form-input"
            value={keyVal}
            onChange={e => setKeyVal(e.target.value)}
            placeholder="พิมพ์ยืนยัน..."
            style={{ borderColor: keyVal && keyVal !== CONFIRM_KEY ? 'var(--danger)' : undefined }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-danger" onClick={confirm} disabled={loading || keyVal !== CONFIRM_KEY}>
            {loading ? 'กำลังลบ...' : 'ลบใบงาน'}
          </button>
        </div>
      </div>
    </div>
  )
}
