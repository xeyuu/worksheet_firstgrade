import * as pdfjsLib from 'pdfjs-dist'

// Point to the worker bundled with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

/**
 * Given a File (PDF), return an array of { pageNumber, dataUrl } objects
 * where each dataUrl is a PNG thumbnail of that page.
 */
export async function extractPdfPages(file, scale = 1.2) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    pages.push({ pageNumber: i, dataUrl: canvas.toDataURL('image/png') })
  }

  return pages
}

/**
 * Given a File (image: jpg/png), return a single-element array
 * with a dataUrl thumbnail.
 */
export async function extractImagePage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve([{ pageNumber: 1, dataUrl: e.target.result }])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
