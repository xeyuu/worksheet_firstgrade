import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { extractPdfPages, extractImagePage } from '../lib/pdf'
import { uploadFile, insertWorksheet } from '../lib/supabase'

export default function UploadPage() {
  const { subjects, addWorksheets, showToast } = useApp()
  const navigate = useNavigate()
  const inputRef  = useRef()

  const [pages,      setPages]      = useState([])      // { pageNumber, dataUrl, selected }
  const [selPages,   setSelPages]   = useState(new Set())
  const [fileName,   setFileName]   = useState('')
  const [subjectKey, setSubjectKey] = useState('thai')
  const [rawFile,    setRawFile]    = useState(null)
  const [isPdf,      setIsPdf]      = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [processing, setProcessing] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setRawFile(file)
    setFileName(file.name.replace(/\.[^/.]+$/, ''))
    setProcessing(true)
    setPages([])
    setSelPages(new Set())
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const isPdfFile = ext === 'pdf'
      setIsPdf(isPdfFile)
      const extracted = isPdfFile
        ? await extractPdfPages(file, 1.5)
        : await extractImagePage(file)
      setPages(extracted)
      setSelPages(new Set(extracted.map(p => p.pageNumber)))
    } catch (e) {
      showToast('อ่านไฟล์ไม่สำเร็จ: ' + e.message)
    } finally {
      setProcessing(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function togglePage(n) {
    setSelPages(prev => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      return next
    })
  }
  function selectAll()   { setSelPages(new Set(pages.map(p => p.pageNumber))) }
  function deselectAll() { setSelPages(new Set()) }

  async function save() {
    if (!fileName.trim()) { showToast('กรุณาตั้งชื่อใบงาน'); return }
    if (!selPages.size)   { showToast('กรุณาเลือกอย่างน้อย 1 หน้า'); return }
    if (!rawFile)         { showToast('ไม่พบไฟล์'); return }

    setLoading(true)
    try {
      const saved = []
      const selectedPageNums = [...selPages].sort((a, b) => a - b)

      for (const pageNum of selectedPageNums) {
        const page = pages.find(p => p.pageNumber === pageNum)
        const label = selectedPageNums.length > 1 ? `${fileName} (หน้า ${pageNum})` : fileName

        // 1. Upload original file (only once for page 1, re-use path for others)
        let storagePath = null
        let fileUrl = null
        if (pageNum === selectedPageNums[0]) {
          const ext = rawFile.name.split('.').pop().toLowerCase()
          storagePath = `uploads/${Date.now()}_p${pageNum}.${ext}`
          fileUrl = await uploadFile(rawFile, storagePath)
        }

        // 2. Upload thumbnail (PNG dataUrl → Blob)
        let thumbUrl = null
        if (page?.dataUrl) {
          const blob = await dataUrlToBlob(page.dataUrl)
          const thumbPath = `thumbnails/${Date.now()}_p${pageNum}.png`
          thumbUrl = await uploadFile(new File([blob], 'thumb.png', { type: 'image/png' }), thumbPath)
        }

        // 3. Insert DB row
        const row = await insertWorksheet({
          name:          label,
          subject_key:   subjectKey,
          page_number:   pageNum,
          page_count:    selectedPageNums.length,
          storage_path:  storagePath,
          file_url:      fileUrl,
          thumbnail_url: thumbUrl,
          printed:       false,
        })
        saved.push(row)
      }

      addWorksheets(saved)
      showToast(`บันทึก ${saved.length} ใบงานเรียบร้อย ✓`)
      navigate('/')
    } catch (e) {
      showToast('บันทึกไม่สำเร็จ: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <span className="page-title">อัปโหลดไฟล์ใหม่</span>
      </div>
      <div className="content">
        {/* Upload zone */}
        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          <i className="ti ti-cloud-upload" aria-hidden="true" />
          <p>คลิกหรือลากไฟล์มาวางที่นี่</p>
          <small>รองรับ PDF · JPG · PNG</small>
        </div>
        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => handleFile(e.target.files[0])}
        />

        {/* Processing spinner */}
        {processing && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text3)' }}>กำลังอ่านไฟล์...</p>
          </div>
        )}

        {/* Page thumbnails */}
        {pages.length > 0 && !processing && (
          <>
            <div className="section-header" style={{ marginTop: 8 }}>
              <span className="section-title">
                เลือกหน้า{' '}
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>
                  {selPages.size}/{pages.length} หน้า
                </span>
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={selectAll}>เลือกทั้งหมด</button>
                <button className="btn btn-outline btn-sm" onClick={deselectAll}>ยกเลิกทั้งหมด</button>
              </div>
            </div>

            <div className="pages-grid">
              {pages.map(p => (
                <div
                  key={p.pageNumber}
                  className={`page-thumb${selPages.has(p.pageNumber) ? ' selected' : ''}`}
                  onClick={() => togglePage(p.pageNumber)}
                >
                  <img src={p.dataUrl} alt={`หน้า ${p.pageNumber}`} />
                  <div className="page-thumb-check"><i className="ti ti-check" aria-hidden="true" /></div>
                  <div className="page-thumb-label">หน้า {p.pageNumber}</div>
                </div>
              ))}
            </div>

            {/* Save form */}
            <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <div className="form-group">
                <label className="form-label">ชื่อใบงาน</label>
                <input
                  type="text"
                  className="form-input"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="ตั้งชื่อใบงาน..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">วิชา</label>
                <select className="form-select" value={subjectKey} onChange={e => setSubjectKey(e.target.value)}>
                  {subjects.map(s => (
                    <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>
              {selPages.size > 1 && (
                <div className="info-box">
                  <i className="ti ti-info-circle" aria-hidden="true" /> จะบันทึกเป็น {selPages.size} ใบงานแยกกันตามหน้าที่เลือก
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => navigate('/')}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={save} disabled={loading}>
                  {loading
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} /> กำลังบันทึก...</>
                    : <><i className="ti ti-check" aria-hidden="true" /> บันทึกใบงาน</>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
