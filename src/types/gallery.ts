export interface UrlPreset {
  name: string
  images: string[]
}

export interface GithubPreset {
  name: string
  type: 'github'
  owner: string
  repo: string
  branch: string
  path: string
  rawService?: string
  token?: string
  _count?: number
}

export type Preset = UrlPreset | GithubPreset

export interface GalleryUiConfig {
  columnsDesktop: number
  columnsMobile: number
  skeletonCount: number
  toastDuration: number
}

export interface GalleryBackground {
  color: string
  image?: string | null
}

export interface GalleryConfig {
  title: string
  presets: Preset[]
  defaultPreset: string | null
  ui: GalleryUiConfig
  background: GalleryBackground
  githubDefaults: {
    rawService: string
  }
}

export interface ImageData {
  src: string
  name: string
}

export interface GithubConfig {
  owner: string
  repo: string
  branch: string
  path: string
  token: string | null
  rawService: string
}
