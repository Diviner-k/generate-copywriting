// Canvas size — big enough for text, matches preview aspect
const CARD_W = 320
const CARD_H = 460
const PADDING = 20
const CARD_PADDING = 20

function wrapText(ctx, text, maxWidth) {
  const lines = []
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const test = current + char
    const metrics = ctx.measureText(test)
    if (metrics.width > maxWidth && current.length > 0) {
      lines.push(current)
      current = char
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawCard(ctx, data) {
  // Background — Geist dark gradient
  const gradSteps = 20
  for (let i = 0; i < gradSteps; i++) {
    const ratio = i / gradSteps
    const r = Math.round(23 * (1 - ratio) + 77 * ratio)
    const g = Math.round(23 * (1 - ratio) + 77 * ratio)
    const b = Math.round(23 * (1 - ratio) + 77 * ratio)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, (CARD_H / gradSteps) * i, CARD_W, CARD_H / gradSteps + 1)
  }

  // Decorative circle
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.arc(CARD_W / 2, 50, 80, 0, Math.PI * 2)
  ctx.fill()

  // Header
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 30px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🌟 文案大师 🌟', CARD_W / 2, 80)
  ctx.font = '13px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('一键生成你的社交文案', CARD_W / 2, 108)

  // White card — topic
  const cardX = PADDING
  const cardY = 130
  const cardW = CARD_W - PADDING * 2
  const topicLines = wrapText(ctx, data.topic || '', cardW - CARD_PADDING * 2)
  const cardH = 50 + topicLines.length * 28 + 50

  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(0,0,0,0.12)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  roundRect(ctx, cardX, cardY, cardW, cardH, 16)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  let y = cardY + 36
  ctx.fillStyle = '#2D1528'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  for (const line of topicLines) {
    ctx.fillText(line, CARD_W / 2, y)
    y += 28
  }

  // Divider
  y += 4
  ctx.strokeStyle = '#F0E0E8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cardX + 30, y)
  ctx.lineTo(cardX + cardW - 30, y)
  ctx.stroke()
  y += 24

  // Style badge — teal accent
  ctx.fillStyle = '#00ac96'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('🎨 ' + (data.style || '未知风格'), CARD_W / 2, y)

  // Footer
  const footerY = cardY + cardH + 36
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('扫码体验 · 文案大师', CARD_W / 2, footerY)
  ctx.font = '10px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('你的专属AI文案助手', CARD_W / 2, footerY + 22)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export function drawShareCard(cardData) {
  return new Promise((resolve, reject) => {
    try {
      if (wx.createOffscreenCanvas) {
        const canvas = wx.createOffscreenCanvas({
          type: '2d',
          width: CARD_W,
          height: CARD_H
        })
        const ctx = canvas.getContext('2d')
        drawCard(ctx, cardData)

        wx.canvasToTempFilePath({
          canvas: canvas,
          x: 0, y: 0,
          width: CARD_W, height: CARD_H,
          destWidth: CARD_W, destHeight: CARD_H,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => reject(new Error('Offscreen export failed: ' + JSON.stringify(err)))
        })
        return
      }

      const ctx = uni.createCanvasContext('shareCanvas')
      drawCard(ctx, cardData)
      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            width: CARD_W, height: CARD_H,
            destWidth: CARD_W, destHeight: CARD_H,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(new Error('Fallback toTempFilePath failed: ' + JSON.stringify(err)))
          })
        }, 500)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export function saveToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          uni.showModal({
            title: '需要相册权限',
            content: '请在设置中允许小程序保存图片到相册',
            success: () => uni.openSetting({})
          })
        }
        reject(err)
      }
    })
  })
}
