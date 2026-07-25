import { $lb } from './dom'
import { state } from './store'

function resetZoom(): void {
  state.zoom = 1
  state.panX = 0
  state.panY = 0
  applyTransform()
  $lb.zoomLevel.textContent = '1×'
}

function applyTransform(): void {
  $lb.img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`
}

function updateZoom(delta: number, cx?: number, cy?: number): void {
  const old = state.zoom
  state.zoom = Math.max(1, Math.min(10, state.zoom + delta))
  if (state.zoom === 1) {
    state.panX = 0
    state.panY = 0
  } else if (cx != null) {
    const ratio = state.zoom / old
    state.panX = cx - ratio * (cx - state.panX)
    state.panY = cy - ratio * (cy - state.panY)
  }
  applyTransform()
  $lb.zoomLevel.textContent = state.zoom.toFixed(1) + '×'
}

export function openLightbox(index: number): void {
  if (!state.images.length || !state.images[index]) return
  state.currentIndex = index
  resetZoom()
  updateLightbox()
  $lb.wrap.classList.add('open')
  document.body.style.overflow = 'hidden'
}

export function closeLightbox(): void {
  $lb.wrap.classList.remove('open')
  document.body.style.overflow = ''
  resetZoom()
}

function updateLightbox(): void {
  const img = state.images[state.currentIndex]
  if (!img) return
  $lb.img.classList.add('no-anim')
  $lb.img.src = img.src
  $lb.img.alt = img.name
  $lb.img.onload = function () {
    resetZoom()
    $lb.img.classList.remove('no-anim')
  }
  $lb.caption.textContent = `${state.currentIndex + 1} / ${state.images.length} — ${img.name}`
}

function prevImage(): void {
  if (!state.images.length) return
  state.currentIndex = (state.currentIndex - 1 + state.images.length) % state.images.length
  updateLightbox()
}

function nextImage(): void {
  if (!state.images.length) return
  state.currentIndex = (state.currentIndex + 1) % state.images.length
  updateLightbox()
}

$lb.close.addEventListener('click', closeLightbox)
$lb.bg.addEventListener('click', closeLightbox)
$lb.prev.addEventListener('click', prevImage)
$lb.next.addEventListener('click', nextImage)

$lb.zoomIn.addEventListener('click', () => updateZoom(0.5))
$lb.zoomOut.addEventListener('click', () => updateZoom(-0.5))
$lb.zoomReset.addEventListener('click', resetZoom)

$lb.imgWrap.addEventListener('wheel', function (e) {
  e.preventDefault()
  const rect = $lb.imgWrap.getBoundingClientRect()
  updateZoom(e.deltaY < 0 ? 0.5 : -0.5, e.clientX - rect.left, e.clientY - rect.top)
}, { passive: false })

let isDragging = false
let dragStartX = 0, dragStartY = 0

$lb.imgWrap.addEventListener('mousedown', function (e) {
  if (state.zoom <= 1) return
  isDragging = true
  dragStartX = e.clientX - state.panX
  dragStartY = e.clientY - state.panY
  $lb.imgWrap.classList.add('dragging')
})

document.addEventListener('mousemove', function (e) {
  if (!isDragging) return
  state.panX = e.clientX - dragStartX
  state.panY = e.clientY - dragStartY
  applyTransform()
})

document.addEventListener('mouseup', function () {
  if (isDragging) {
    isDragging = false
    $lb.imgWrap.classList.remove('dragging')
  }
})

let distStart = 0, zoomStart = 1

$lb.imgWrap.addEventListener('touchstart', function (e) {
  if (e.touches.length === 2) {
    distStart = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    zoomStart = state.zoom
  }
}, { passive: true })

$lb.imgWrap.addEventListener('touchmove', function (e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    const s = dist / distStart
    state.zoom = Math.max(1, Math.min(10, zoomStart * s))
    $lb.img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`
    $lb.img.classList.add('no-anim')
    $lb.zoomLevel.textContent = state.zoom.toFixed(1) + '×'
  }
}, { passive: false })

$lb.imgWrap.addEventListener('touchend', function (e) {
  if (e.touches.length < 2) {
    $lb.img.classList.remove('no-anim')
    if (state.zoom === 1) {
      state.panX = 0
      state.panY = 0
      applyTransform()
    }
  }
}, { passive: true })

$lb.imgWrap.addEventListener('dblclick', function (e) {
  if (state.zoom > 1) {
    resetZoom()
    return
  }
  const rect = $lb.imgWrap.getBoundingClientRect()
  updateZoom(2, e.clientX - rect.left, e.clientY - rect.top)
})

document.addEventListener('keydown', function (e) {
  if (!$lb.wrap.classList.contains('open')) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
})
