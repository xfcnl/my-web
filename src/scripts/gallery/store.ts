import type { Preset, GithubConfig, ImageData } from '../../types/gallery'
import galleryConfig from '../../config/gallery-config.json'

const STORAGE_KEY = 'gallery_presets'

export const state = {
  images: [] as ImageData[],
  currentIndex: 0,
  currentPresetId: null as number | null,
  lastGithubConfig: null as GithubConfig | null,
  zoom: 1,
  panX: 0,
  panY: 0,
}

export function getBuiltinPresets(): Preset[] {
  return galleryConfig.presets ?? []
}

export function loadCustomPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomPresets(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function getAllPresets(): Preset[] {
  return [...getBuiltinPresets(), ...loadCustomPresets()]
}

export function presetIconClass(p: Preset): string {
  if (p.type === 'github') return 'fa-brands fa-github'
  if ('images' in p && p.images?.length) {
    const first = p.images[0]
    if (first?.startsWith('data:')) return 'fa-solid fa-folder'
  }
  return 'fa-regular fa-image'
}

export function presetCount(p: Preset): string {
  if (p.type === 'github')
    return p._count != null ? `${p._count} 张` : ''
  return 'images' in p && p.images ? `${p.images.length} 张` : ''
}
