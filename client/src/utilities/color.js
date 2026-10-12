// Mixes a #rrggbb color toward white (amount > 0) or black (amount < 0).
// amount runs from -1 to 1; returns a CSS rgb() string.
export const shade = (hex, amount) => {
    const value = parseInt(hex.slice(1), 16)
    const target = amount < 0 ? 0 : 255
    const mix = (channel) => Math.round(channel + (target - channel) * Math.abs(amount))

    return `rgb(${mix((value >> 16) & 255)}, ${mix((value >> 8) & 255)}, ${mix(value & 255)})`
}
