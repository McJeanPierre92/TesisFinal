export const downloadFile = (blob: Blob, fileName: string) => {
  const url = globalThis.window.URL.createObjectURL(blob)
  const element = globalThis.document.createElement('a')

  element.href = url
  element.setAttribute('download', fileName)
  document.body.appendChild(element)

  element.click()
  element.remove()
  window.URL.revokeObjectURL(url)
}
