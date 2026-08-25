// AI bounding boxes are approximate, so the raw model rectangle is only used as a
// search hint here. The sheet image is scanned for actual ink (handwriting) pixels
// and the highlight strips are snapped onto the written words themselves — which
// removes empty space inside the box and recovers answer lines the model missed.
const WORKING_SIZE = 1400

function luminance(data, index) {
  return 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]
}

// Bradley adaptive threshold: a pixel is ink when clearly darker than its local
// neighbourhood. Survives shadows and uneven photo lighting far better than one
// global cut-off, so faint ruled lines stay out of the mask.
function buildInkMask(data, width, height) {
  const stride = width + 1
  const integral = new Float64Array(stride * (height + 1))
  for (let y = 0; y < height; y++) {
    let rowSum = 0
    for (let x = 0; x < width; x++) {
      rowSum += luminance(data, (y * width + x) * 4)
      integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + rowSum
    }
  }
  const radius = Math.max(12, Math.round(Math.min(width, height) / 16))
  const mask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    const top = Math.max(0, y - radius)
    const bottom = Math.min(height - 1, y + radius)
    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - radius)
      const right = Math.min(width - 1, x + radius)
      const area = (bottom - top + 1) * (right - left + 1)
      const mean = (integral[(bottom + 1) * stride + right + 1] - integral[top * stride + right + 1] - integral[(bottom + 1) * stride + left] + integral[top * stride + left]) / area
      mask[y * width + x] = luminance(data, (y * width + x) * 4) < mean * 0.86 ? 1 : 0
    }
  }
  return mask
}

function toPixelRects(regions, width, height) {
  return regions.map(({ x, y, width: w, height: h }) => ({
    x: Math.round(x * width),
    y: Math.round(y * height),
    w: Math.max(2, Math.round(w * width)),
    h: Math.max(2, Math.round(h * height)),
  }))
}

function mergeWindows(rects) {
  const sorted = [...rects].sort((a, b) => a.y - b.y)
  const merged = []
  for (const rect of sorted) {
    const last = merged[merged.length - 1]
    if (last && rect.y <= last.y + last.h) {
      const right = Math.max(last.x + last.w, rect.x + rect.w)
      const bottom = Math.max(last.y + last.h, rect.y + rect.h)
      last.x = Math.min(last.x, rect.x)
      last.y = Math.min(last.y, rect.y)
      last.w = right - last.x
      last.h = bottom - last.y
    } else merged.push({ ...rect })
  }
  return merged
}

function rowProfile(mask, width, zone) {
  const counts = new Array(zone.h).fill(0)
  for (let y = 0; y < zone.h; y++) {
    let count = 0
    const offset = (zone.y + y) * width
    for (let x = zone.x; x < zone.x + zone.w; x++) count += mask[offset + x]
    counts[y] = count
  }
  return counts
}

function extractBands(counts, startY) {
  const maxCount = Math.max(...counts, 0)
  const threshold = Math.max(3, Math.ceil(maxCount * 0.06))
  const bands = []
  let current = null
  counts.forEach((count, index) => {
    if (count >= threshold) {
      if (!current) current = { y0: startY + index, y1: startY + index + 1, ink: 0 }
      current.y1 = startY + index + 1
      current.ink += count
    } else if (current) {
      bands.push(current)
      current = null
    }
  })
  if (current) bands.push(current)
  return bands.filter((band) => band.y1 - band.y0 >= 2 && band.ink >= 3)
}

function trimColumns(mask, width, band, zone) {
  const rows = band.y1 - band.y0
  const threshold = Math.max(1, Math.round(rows * 0.05))
  const counts = new Array(zone.w).fill(0)
  for (let y = band.y0; y < band.y1; y++) {
    const offset = y * width
    for (let x = zone.x; x < zone.x + zone.w; x++) counts[x - zone.x] += mask[offset + x]
  }
  let left = counts.findIndex((count) => count >= threshold)
  if (left === -1) return null
  let right = counts.length - 1
  while (right > left && counts[right] < threshold) right--
  const pad = Math.max(2, Math.round(width * 0.002))
  return {
    x: Math.max(zone.x, zone.x + left - pad),
    y: band.y0,
    w: Math.min(zone.x + zone.w, zone.x + right + pad + 1) - Math.max(zone.x, zone.x + left - pad),
    h: rows,
  }
}

function isRuledLineOnly(band, zoneWidth, height) {
  const rows = band.y1 - band.y0
  return rows <= Math.max(2, Math.round(height * 0.004)) && band.ink / rows > zoneWidth * 0.82
}

// Pure core (no DOM) so the snapping logic stays testable: takes RGBA pixels plus
// normalized seed rectangles, returns tightened normalized rectangles.
export function snapRegionsToInk(pixels, width, height, regions) {
  const mask = buildInkMask(pixels, width, height)
  const padX = Math.round(width * 0.02)
  const padY = Math.round(height * 0.16)
  const results = []
  for (const seed of mergeWindows(toPixelRects(regions, width, height))) {
    const zone = {
      x: Math.max(0, seed.x - padX),
      y: Math.max(0, seed.y - padY),
      w: Math.min(width, seed.x + seed.w + padX) - Math.max(0, seed.x - padX),
      h: Math.min(height, seed.y + seed.h + padY) - Math.max(0, seed.y - padY),
    }
    const bands = extractBands(rowProfile(mask, width, zone), zone.y)
    const coreBands = bands.filter((band) => band.y0 < seed.y + seed.h && band.y1 > seed.y)
    if (!coreBands.length) continue
    // Lines of the same paragraph sit close together; a much wider gap means the
    // next answer starts. Absorbing nearby bands recovers lines the model skipped
    // without bleeding into the neighbouring question.
    const gaps = coreBands.slice(1).map((band, index) => band.y0 - coreBands[index].y1)
    const sortedGaps = [...gaps].sort((a, b) => a - b)
    const medianGap = sortedGaps.length % 2 ? sortedGaps[(sortedGaps.length - 1) / 2] : (sortedGaps[sortedGaps.length / 2 - 1] + sortedGaps[sortedGaps.length / 2]) / 2
    const joinGap = Math.max(medianGap * 1.7, height * 0.007, 4)
    let first = bands.indexOf(coreBands[0])
    let last = bands.indexOf(coreBands[coreBands.length - 1])
    while (first > 0 && bands[first].y0 - bands[first - 1].y1 <= joinGap) first--
    while (last < bands.length - 1 && bands[last + 1].y0 - bands[last].y1 <= joinGap) last++
    for (const band of bands.slice(first, last + 1)) {
      if (isRuledLineOnly(band, zone.w, height)) continue
      const trimmed = trimColumns(mask, width, band, zone)
      if (trimmed) results.push(trimmed)
    }
  }
  const settled = mergeWindows(results.sort((a, b) => a.y - b.y))
  return settled.map(({ x, y, w, h }) => ({ x: x / width, y: y / height, width: w / width, height: h / height }))
}

async function loadDecoded(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Older browsers ignore the orientation option or lack createImageBitmap entirely.
  }
  try {
    return await createImageBitmap(file)
  } catch {
    // Fall through to the Image element path.
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = () => reject(new Error(`Could not decode ${file.name}`))
      image.src = url
    })
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function refineAnswerRegions(file, regions) {
  if (!regions.length || typeof createImageBitmap === 'undefined' && typeof Image === 'undefined') return []
  const decoded = await loadDecoded(file)
  const sourceWidth = decoded.width || decoded.naturalWidth
  const sourceHeight = decoded.height || decoded.naturalHeight
  const scale = Math.min(1, WORKING_SIZE / Math.max(sourceWidth, sourceHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(decoded, 0, 0, canvas.width, canvas.height)
  if ('close' in decoded) decoded.close()
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
  return snapRegionsToInk(data, canvas.width, canvas.height, regions)
}
