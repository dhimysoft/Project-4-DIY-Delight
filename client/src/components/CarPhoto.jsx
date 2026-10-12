import React, { useEffect, useRef } from 'react'
import photoUrl from '../assets/corvette-c8.jpg'
import paintMaskUrl from '../assets/corvette-c8-paint-mask.png'
import partsMaskUrl from '../assets/corvette-c8-parts-mask.png'

// The photo shows a Torch Red Corvette with silver wheels and a black roof. Two mask
// images (same size as the photo) say which pixels belong to which part, so each part
// can be recolored without touching anything else:
//
//   paint mask  red   = body paint (glass, trim and street are 0)
//               green = how much of the pixel's color to strip: the paint plus pale pink
//                       reflections, which would look wrong on a blue or black car
//               blue  = the inner part of the roof panel (for the two-tone roof)
//   parts mask  red   = wheel rim metal
//               green = brake calipers
//               blue  = roof panel

// Typical luminance (0-255) of each part in the photo, used to keep its shading
const PAINT_LUMINANCE = 80
const RIM_LUMINANCE = 123
const CALIPER_LUMINANCE = 45
const ROOF_LUMINANCE = 85
// Photo rims are a mid silver, so the target color is scaled down a bit
const RIM_GAIN = 0.8
const CARBON_FLASH = '#2b2d31'

const loadPixels = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight

            const context = canvas.getContext('2d', { willReadFrequently: true })
            context.drawImage(image, 0, 0)
            resolve(context.getImageData(0, 0, canvas.width, canvas.height))
        }
        image.onerror = reject
        image.src = url
    })

// Decoded once and shared by every CarPhoto on the page
let sourcePixels
const loadSource = () =>
    (sourcePixels ??= Promise.all([loadPixels(photoUrl), loadPixels(paintMaskUrl), loadPixels(partsMaskUrl)]))

const smooth = (value, low, high) => {
    const t = Math.min(1, Math.max(0, (value - low) / (high - low)))
    return t * t * (3 - 2 * t)
}

// A color to paint with, plus how dark it is (dark colors get extra reflections)
const makeColor = (hex) => {
    const value = parseInt(hex.slice(1), 16)
    const rgb = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
    return { rgb, darkness: 1 - (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255 }
}

// Writes into `out` the color for a pixel of a part: `color` scaled by how bright the
// pixel is compared with the part's typical brightness. Dark colors would look flat,
// so their brighter pixels (reflections) are lifted a little.
const tint = (out, color, luminance, reference, gain = 1) => {
    const brightness = luminance / reference
    const gloss = Math.max(0, brightness - 1) * color.darkness * 70

    out[0] = color.rgb[0] * brightness * gain + gloss
    out[1] = color.rgb[1] * brightness * gain + gloss
    out[2] = color.rgb[2] * brightness * gain + gloss
}

// Returns a copy of the photo with the paint, wheels and roof recolored
const repaint = (photo, paintMask, partsMask, { paint, rim, caliper, roofFinish }) => {
    const result = new ImageData(new Uint8ClampedArray(photo.data), photo.width, photo.height)
    const pixels = result.data
    const flash = makeColor(CARBON_FLASH)
    const colored = [0, 0, 0]
    const flashed = [0, 0, 0]

    for (let i = 0; i < pixels.length; i += 4) {
        const neutral = paintMask.data[i + 1] / 255
        const rimAmount = partsMask.data[i] / 255
        const caliperAmount = partsMask.data[i + 1] / 255
        const roofAmount = partsMask.data[i + 2] / 255
        if (neutral === 0 && rimAmount === 0 && caliperAmount === 0 && roofAmount === 0) continue

        const luminance = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]

        if (neutral > 0) {
            const amount = paintMask.data[i] / 255
            tint(colored, paint, luminance, PAINT_LUMINANCE)

            // Strip the original (red) tint, then fade from what's left to the new paint
            for (let c = 0; c < 3; c++) {
                const base = luminance + (pixels[i + c] - luminance) * (1 - neutral)
                pixels[i + c] = base + (colored[c] - base) * amount
            }
        }

        if (rimAmount > 0) {
            tint(colored, rim, luminance, RIM_LUMINANCE, RIM_GAIN)
            for (let c = 0; c < 3; c++) pixels[i + c] += (colored[c] - pixels[i + c]) * rimAmount
        }

        if (caliperAmount > 0) {
            tint(colored, caliper, luminance, CALIPER_LUMINANCE)
            for (let c = 0; c < 3; c++) pixels[i + c] += (colored[c] - pixels[i + c]) * caliperAmount
        }

        if (roofAmount > 0) {
            const pixel = i / 4
            const x = pixel % photo.width
            const y = Math.floor(pixel / photo.width)

            switch (roofFinish) {
                case 'flash':
                    tint(colored, flash, luminance, ROOF_LUMINANCE)
                    break
                case 'nacelles': {
                    // Painted in the middle, carbon flash around the edges
                    const middle = paintMask.data[i + 2] / 255
                    tint(colored, paint, luminance, ROOF_LUMINANCE)
                    tint(flashed, flash, luminance, ROOF_LUMINANCE)
                    for (let c = 0; c < 3; c++) colored[c] = flashed[c] + (colored[c] - flashed[c]) * middle
                    break
                }
                case 'carbon': {
                    // A 2px checker weave, still lit by the photo's reflections
                    const level = ((x >> 1) + (y >> 1)) % 2 === 0 ? 62 : 26
                    const lit = Math.min(1.8, 0.6 + luminance / 150)
                    colored[0] = colored[1] = colored[2] = level * lit
                    break
                }
                case 'glass': {
                    // See-through: the sky and cabin show through a blue-gray tint
                    const lit = 0.35 + 0.5 * (luminance / 255)
                    colored[0] = pixels[i] * 0.4 + 150 * lit
                    colored[1] = pixels[i + 1] * 0.4 + 195 * lit
                    colored[2] = pixels[i + 2] * 0.4 + 220 * lit
                    break
                }
                default:
                    tint(colored, paint, luminance, ROOF_LUMINANCE)
            }

            // Bright reflections stay as they were
            const reflection = roofFinish === 'glass' ? 0 : smooth(luminance, 130, 210)
            for (let c = 0; c < 3; c++) {
                const roof = colored[c] * (1 - reflection) + luminance * reflection
                pixels[i + c] += (roof - pixels[i + c]) * roofAmount
            }
        }
    }

    return result
}

const CarPhoto = ({ exterior, roof, wheel, convertible }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        let cancelled = false

        loadSource().then(([photo, paintMask, partsMask]) => {
            if (cancelled || !canvasRef.current) return

            const look = {
                paint: makeColor(exterior.color),
                rim: makeColor(wheel.color),
                caliper: makeColor(wheel.caliper),
                roofFinish: roof.finish
            }
            canvasRef.current.getContext('2d').putImageData(repaint(photo, paintMask, partsMask, look), 0, 0)
        })

        return () => {
            cancelled = true
        }
    }, [exterior.color, wheel.color, wheel.caliper, roof.finish])

    return (
        <figure className="car-photo">
            <canvas
                ref={canvasRef}
                width="1280"
                height="720"
                role="img"
                aria-label={`${exterior.name} Chevrolet Corvette with ${roof.name} roof and ${wheel.name} wheels`}
            />
            {convertible && <span className="tag photo-tag">Convertible</span>}
            <figcaption>
                Photo:{' '}
                <a
                    href="https://commons.wikimedia.org/wiki/File:Chevrolet_Corvette_C8_Stingray_3LT_Coupe_Z51_Torch_Red.jpg"
                    target="_blank"
                    rel="noreferrer"
                >
                    Ethan Llamas
                </a>
                , <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
                {' '}(recolored)
            </figcaption>
        </figure>
    )
}

export default CarPhoto
