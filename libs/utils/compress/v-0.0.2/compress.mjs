export async function compressImage(file, { maxBytes = 250_000, maxDim = 1536 } = {}) {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const toBlob = (q) => new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', q)
  })

  for (const q of [0.85, 0.75, 0.65, 0.55, 0.5]) {
    const blob = await toBlob(q)
    if (blob.size <= maxBytes) return blob
  }
  return toBlob(0.5)
}
