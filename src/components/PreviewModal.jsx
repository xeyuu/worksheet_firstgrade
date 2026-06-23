import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { extractPdfPages, extractImagePage } from '../lib/pdf'

export default function PreviewModal({ item, onClose }) {
  const { getSubject } = useApp()
  const subject = getSubject(item.subject_key)

  const [pages,      setPages]      = useState([])
  const [currentPg,  setCurrentPg]  = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [viewMode,   setViewMode]   = useState('image')   // 'image' | 'pdf'

  useEffect(() => {
    if (item.thumbnail_url) {
      setPages([{ dataUrl: item.thumbnail_url, pageNumber: item.page_number || 1 }])
      return
    }
    // Fallback: if no thumbnail try to preview via file_url
    if (item.file_url) {
      if (item.file_url.match(/\.pdf$/i)) {
        setViewMode('pdf')
      } else {
        setPages([{ dataUrl: item.file_url, pageNumber: 1 }])
      }
    }
  }, [item])

  // Keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')        onClose()
      if (e.key === 'ArrowRight') setCurrentPg(p => Math.min(p + 1, pages.length - 1))
      if (e.key === 'ArrowLeft')  setCurrentPg(p => Math.max(p - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pages.length, onClose])

  const currentPage = pages[currentPg]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{subject.emoji}</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {subject.label}
                {pages.length > 1 && ` · หน้า ${currentPg + 1}/${pages.length}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <i className="ti ti-external-link" aria-hidden="true" /> เปิดไฟล์ต้นฉบับ
              </a>
            )}
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              <i className="ti ti-x" aria-hidden="true" /> ปิด
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="preview-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" />
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text3)' }}>กำลังโหลดไฟล์...</p>
            </div>
          )}

          {/* PDF embed */}
          {viewMode === 'pdf' && item.file_url && !loading && (
            <iframe
              className="preview-pdf-frame"
              src={item.file_url + '#toolbar=1&navpanes=0'}
              title={item.name}
            />
          )}

          {/* Image preview */}
          {viewMode === 'image' && !loading && currentPage && (
            <>
              <img src={currentPage.dataUrl} alt={`หน้า ${currentPage.pageNumber}`} />
              {/* Page navigation */}
              {pages.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {pages.map((p, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm${i === currentPg ? ' btn-primary' : ' btn-outline'}`}
                      onClick={() => setCurrentPg(i)}
                    >
                      {p.pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* No preview */}
          {!loading && !currentPage && viewMode !== 'pdf' && (
            <div className="empty-state">
              <i className="ti ti-photo-off" />
              <p>ไม่มีภาพ preview — กดเปิดไฟล์ต้นฉบับ</p>
            </div>
          )}
        </div>

        {/* Arrow nav hint */}
        {pages.length > 1 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="btn btn-outline btn-sm" disabled={currentPg === 0} onClick={() => setCurrentPg(p => p - 1)}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> ก่อนหน้า
            </button>
            <button className="btn btn-outline btn-sm" disabled={currentPg === pages.length - 1} onClick={() => setCurrentPg(p => p + 1)}>
              ถัดไป <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
