import type { ImageData } from '../../types/gallery'
import { $ } from './dom'
import { state } from './store'
import { openLightbox } from './lightbox'
import { showToast } from './ui'

function tryLoad(url: string, idx: number, retried?: boolean): void {
  const img = new Image()
  img.onload = function () {
    state.images[idx] = {
      src: url,
      name: url.split('/').pop()?.split('?')[0]?.split('#')[0] || 'image',
    }
    replaceSkeleton(idx, url)
    if (getLoadedCount() === state.images.length) finishLoad()
  }
  img.onerror = function () {
    if (!retried) {
      setTimeout(() => tryLoad(url, idx, true), 300)
      return
    }
    const sk = $.gallery.querySelector(`.skeleton[data-index="${idx}"]`)
    if (sk) sk.remove()
    if (getLoadedCount() === state.images.length) finishLoad()
  }
  img.src = url
}

function getLoadedCount(): number {
  return state.images.filter(Boolean).length
}

function replaceSkeleton(idx: number, url: string): void {
  const sk = $.gallery.querySelector(`.skeleton[data-index="${idx}"]`)
  if (!sk) return
  sk.remove()
  const item = document.createElement('div')
  item.className = 'gallery-item'
  item.dataset.index = String(idx)
  item.innerHTML = `<img src="${url}" alt="" loading="lazy">`
  item.addEventListener('click', function () {
    openLightbox(parseInt(this.dataset.index!))
  })
  const after = $.gallery.children[idx]
  after
    ? $.gallery.insertBefore(item, after)
    : $.gallery.appendChild(item)
}

function finishLoad(): void {
  $.gallery.querySelectorAll('.skeleton').forEach((el) => el.remove())
  const actual = state.images.filter(Boolean).length
  const total = state.images.length
  $.countInfo.textContent = `共 ${total} 张图片`
  if (actual < total) {
    showToast(`已加载 ${actual}/${total} 张 (${total - actual} 张失败)`)
  } else {
    showToast(`已加载 ${actual} 张图片`)
  }
}

export function loadUrls(urls: string[], _statusText?: string): void {
  state.images = []
  $.gallery.innerHTML = ''
  const count = urls.length
  if (!count) {
    showToast('没有图片')
    return
  }

  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div')
    sk.className = 'skeleton'
    sk.dataset.index = String(i)
    $.gallery.appendChild(sk)
  }

  state.images = new Array(count)
  urls.forEach((url, idx) => tryLoad(url, idx))
}

export function loadFolderFiles(files: File[]): void {
  state.images = []
  $.gallery.innerHTML = ''
  const count = files.length
  if (!count) return

  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div')
    sk.className = 'skeleton'
    sk.dataset.index = String(i)
    $.gallery.appendChild(sk)
  }

  state.images = new Array(count)
  let loaded = 0

  files.forEach((file, idx) => {
    const reader = new FileReader()
    reader.onload = function (ev) {
      state.images[idx] = { src: ev.target!.result as string, name: file.name }
      loaded++
      replaceSkeleton(idx, ev.target!.result as string)
      if (loaded === count) {
        $.gallery.querySelectorAll('.skeleton').forEach((el) => el.remove())
        $.countInfo.textContent = `共 ${loaded} 张图片`
        showToast(`已加载 ${loaded} 张图片`)
      }
    }
    reader.readAsDataURL(file)
  })
}
