import React from 'react'
import { useApp } from '../App'

export default function HistoryPage() {
  const { history, clearAllHistory } = useApp()

  return (
    <>
      <div className="topbar">
        <span className="page-title">ประวัติการปริ้น</span>
        {history.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={clearAllHistory}>
            <i className="ti ti-trash" aria-hidden="true" /> ล้างประวัติ
          </button>
        )}
      </div>
      <div className="content">
        {history.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-history" />
            <p>ยังไม่มีประวัติการปริ้น</p>
          </div>
        ) : (
          history.map((h, i) => (
            <div key={h.id || i} className="history-item">
              <div className="history-icon">📄</div>
              <div className="history-info">
                <div className="history-name">
                  {Array.isArray(h.worksheet_names) ? h.worksheet_names.join(', ') : h.worksheet_names}
                </div>
                <div className="history-meta">
                  <i className="ti ti-calendar" style={{ fontSize: 12 }} aria-hidden="true" />
                  {' '}{h.printed_at ? new Date(h.printed_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                  {' · '}{Array.isArray(h.worksheet_names) ? h.worksheet_names.length : 1} ใบ
                </div>
              </div>
              {h.subject_labels?.[0] && (
                <span className="history-badge badge-math">{h.subject_labels[0]}</span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
