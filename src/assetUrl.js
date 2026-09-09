export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export function assetCssUrl(path) {
  return `url("${assetUrl(path)}")`
}
