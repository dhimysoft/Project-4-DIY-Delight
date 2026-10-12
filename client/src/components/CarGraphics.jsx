import React, { useId, useState } from 'react'
import { shade } from '../utilities/color'

// Everything the customizer draws is plain SVG/CSS built from the option data
// (colors, finishes, spoke styles), so a selection changes what you see.

const SPOKES = {
    five: { count: 5, hub: 7, rim: 11 },
    ten: { count: 10, hub: 4, rim: 6 },
    twenty: { count: 20, hub: 2, rim: 3.2 }
}

const PaintGradient = ({ id, color, vertical }) => (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
        <stop offset="0" stopColor={vertical ? shade(color, 0.3) : shade(color, -0.3)} />
        <stop offset={vertical ? 0.45 : 0.5} stopColor={vertical ? color : shade(color, 0.15)} />
        <stop offset="1" stopColor={shade(color, -0.4)} />
    </linearGradient>
)

const CarbonWeave = ({ id }) => (
    <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="#121316" />
        <rect width="2" height="2" fill="#2a2c32" />
        <rect x="2" y="2" width="2" height="2" fill="#2a2c32" />
    </pattern>
)

// The paint for a roof, depending on its finish
const roofPaint = (finish, ids) => ({
    body: `url(#${ids.paint})`,
    nacelles: `url(#${ids.paint})`,
    flash: '#2b2d31',
    carbon: `url(#${ids.weave})`,
    glass: 'rgba(120, 175, 205, 0.4)'
}[finish] ?? `url(#${ids.paint})`)

// ---------- Exterior ----------

export const ExteriorSwatch = ({ color }) => (
    <div
        className="exterior-swatch"
        aria-hidden="true"
        style={{ background: `linear-gradient(180deg, ${shade(color, 0.12)}, ${shade(color, -0.3)})` }}
    />
)

// ---------- Wheels ----------

const WheelArt = ({ wheel }) => {
    const { count, hub, rim } = SPOKES[wheel.style] ?? SPOKES.five

    return (
        <g>
            <circle cx="50" cy="50" r="48" fill="#0d0d0f" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#2b2b30" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="#16161a" />
            <circle cx="50" cy="50" r="30" fill="#8e9298" stroke="#5b5f64" strokeWidth="1" />
            <rect x="62" y="40" width="14" height="22" rx="4" fill={wheel.caliper} transform="rotate(-25 50 50)" />
            {Array.from({ length: count }, (_, index) => (
                <polygon
                    key={index}
                    points={`${50 - hub / 2},42 ${50 + hub / 2},42 ${50 + rim / 2},19 ${50 - rim / 2},19`}
                    fill={wheel.color}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                    transform={`rotate(${(index * 360) / count} 50 50)`}
                />
            ))}
            <circle cx="50" cy="50" r="35" fill="none" stroke={wheel.color} strokeWidth="3.2" />
            <circle cx="50" cy="50" r="9" fill={wheel.color} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="4" fill="#111" />
        </g>
    )
}

export const WheelGraphic = ({ wheel }) => (
    <svg viewBox="0 0 100 100" className="graphic wheel-graphic" role="img" aria-label={wheel.name}>
        <WheelArt wheel={wheel} />
    </svg>
)

// ---------- Interior ----------

const Seat = ({ x, interior }) => (
    <g transform={`translate(${x} 14)`}>
        <rect x="10" y="-6" width="18" height="14" rx="6" fill={shade(interior.seat, -0.2)} />
        <rect x="0" y="0" width="38" height="50" rx="14" fill={interior.seat} stroke="rgba(255, 255, 255, 0.14)" />
        <rect x="-1" y="10" width="7" height="34" rx="3.5" fill={interior.accent} />
        <rect x="32" y="10" width="7" height="34" rx="3.5" fill={interior.accent} />
        <path d="M19 14 V44" stroke={interior.accent} strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="3" y="52" width="32" height="18" rx="7" fill={shade(interior.seat, -0.12)} stroke="rgba(255, 255, 255, 0.14)" />
    </g>
)

export const SeatGraphic = ({ interior }) => {
    const uid = useId().replace(/:/g, '')

    return (
        <svg viewBox="0 0 120 90" className="graphic seat-graphic" role="img" aria-label={interior.name}>
            <defs>
                <linearGradient id={`${uid}-cabin`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3a3d43" />
                    <stop offset="1" stopColor="#1b1c20" />
                </linearGradient>
            </defs>
            <rect width="120" height="90" rx="6" fill={`url(#${uid}-cabin)`} />
            <rect width="120" height="8" rx="3" fill="#0c0c0e" />
            <rect x="50" y="14" width="20" height="62" rx="5" fill="#0f1012" />
            <circle cx="60" cy="30" r="4" fill="#3a3c40" />
            <Seat x={8} interior={interior} />
            <Seat x={74} interior={interior} />
        </svg>
    )
}

// ---------- Roof (top view) ----------

const TOP_BODY = 'M50 4 C66 4 78 10 82 28 C85 44 86 60 86 76 C86 100 84 130 85 150 C86 175 80 200 66 208 C60 211 40 211 34 208 C20 200 14 175 15 150 C16 130 14 100 14 76 C14 60 15 44 18 28 C22 10 34 4 50 4 Z'

const TopSeat = ({ x, seat, accent }) => (
    <g>
        <rect x={x} y="100" width="17" height="16" rx="5" fill={seat} stroke="rgba(255, 255, 255, 0.16)" strokeWidth="0.6" />
        <rect x={x} y="116" width="17" height="10" rx="4" fill={shade(seat, -0.18)} stroke="rgba(255, 255, 255, 0.16)" strokeWidth="0.6" />
        <rect x={x + 3} y="126" width="11" height="5" rx="2.5" fill={accent} />
    </g>
)

export const RoofGraphic = ({ roof, exterior, interior, convertible = false }) => {
    const uid = useId().replace(/:/g, '')
    const ids = { paint: `${uid}-paint`, weave: `${uid}-weave` }
    const color = exterior?.color ?? '#888888'
    const seat = interior?.seat ?? '#1b1c1f'
    const accent = interior?.accent ?? '#3a3c40'
    const finish = roof?.finish ?? 'body'
    const showCabin = convertible || finish === 'glass'
    const panel = convertible ? { y: 136, height: 26 } : { y: 90, height: 42 }
    const louverY = convertible ? 168 : 156

    return (
        <svg viewBox="0 0 100 220" className="graphic roof-graphic" role="img" aria-label={roof?.name ?? 'Roof'}>
            <defs>
                <PaintGradient id={ids.paint} color={color} />
                <CarbonWeave id={ids.weave} />
            </defs>

            {[[9, 34, 9, 32], [82, 34, 9, 32], [7, 150, 10, 42], [83, 150, 10, 42]].map(([x, y, width, height]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} rx="3" fill="#0b0b0d" />
            ))}

            <path d={TOP_BODY} fill={`url(#${ids.paint})`} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" />
            <path d="M22 30 L36 16 M78 30 L64 16" stroke="#0b0b0d" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 10 V70" stroke="rgba(0, 0, 0, 0.18)" strokeWidth="1" />
            <path d="M30 92 L34 72 L66 72 L70 92 Z" fill="#14202b" />
            <rect x="9" y="84" width="7" height="6" rx="2" fill={shade(color, -0.45)} />
            <rect x="84" y="84" width="7" height="6" rx="2" fill={shade(color, -0.45)} />

            {showCabin && (
                <g>
                    <rect x="28" y="94" width="44" height="38" rx="4" fill="#15161a" />
                    <TopSeat x={31} seat={seat} accent={accent} />
                    <TopSeat x={52} seat={seat} accent={accent} />
                </g>
            )}

            {finish === 'glass' && !convertible ? (
                <g>
                    <rect x="28" y={panel.y} width="44" height={panel.height} rx="4" fill={roofPaint('glass', ids)} />
                    <path d="M32 94 L52 94 L38 130 L32 130 Z" fill="rgba(255, 255, 255, 0.16)" />
                </g>
            ) : (
                <g>
                    <rect
                        x="28" y={panel.y} width="44" height={panel.height} rx="4"
                        fill={roofPaint(finish, ids)}
                        stroke="rgba(0, 0, 0, 0.4)" strokeWidth="0.8"
                    />
                    {finish === 'nacelles' && (
                        <g fill="#2b2d31">
                            <rect x="28" y={panel.y} width="7" height={panel.height} rx="3" />
                            <rect x="65" y={panel.y} width="7" height={panel.height} rx="3" />
                        </g>
                    )}
                </g>
            )}

            {!convertible && <path d="M31 134 L69 134 L66 148 L34 148 Z" fill="#10171d" />}
            <path
                d={[0, 8, 16, 24].map((offset) => `M35 ${louverY + offset} H65`).join(' ')}
                stroke="rgba(0, 0, 0, 0.4)" strokeWidth="2"
            />
            <path d="M19 200 L36 206 M81 200 L64 206" stroke="#e01c24" strokeWidth="3" strokeLinecap="round" />
        </svg>
    )
}

// ---------- Picks the right image for an option group ----------

// An option can have a photo: put a file named after the option in
// client/public/options/<roofs|wheels|interiors>/, for example
// client/public/options/roofs/visible-carbon-fiber.png. Options without a photo
// (or whose photo is missing) fall back to the drawings above.
const PHOTO_FOLDERS = { roof: 'roofs', wheel: 'wheels', interior: 'interiors' }
const PHOTO_EXTENSIONS = ['png', 'jpg', 'webp']

export const photoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Photo URLs that failed to load, so they aren't requested again every time a picker opens
const missingPhotos = new Set()

const photoUrls = (type, option) =>
    PHOTO_EXTENSIONS.map((extension) => `/options/${PHOTO_FOLDERS[type]}/${photoSlug(option.name)}.${extension}`)

const OptionPhoto = ({ type, option, fallback }) => {
    const [, setFailures] = useState(0)
    const url = photoUrls(type, option).find((candidate) => !missingPhotos.has(candidate))

    if (!url) return fallback

    return (
        <img
            className="graphic option-photo"
            src={url}
            alt={option.name}
            onError={() => {
                missingPhotos.add(url)
                setFailures((count) => count + 1)
            }}
        />
    )
}

export const OptionImage = ({ type, option, selection, convertible }) => {
    switch (type) {
        case 'exterior':
            return <ExteriorSwatch color={option.color} />
        case 'roof':
            return (
                <OptionPhoto
                    type={type}
                    option={option}
                    fallback={
                        <RoofGraphic
                            roof={option}
                            exterior={selection.exterior}
                            interior={selection.interior}
                            convertible={convertible}
                        />
                    }
                />
            )
        case 'wheel':
            return <OptionPhoto type={type} option={option} fallback={<WheelGraphic wheel={option} />} />
        case 'interior':
            return <OptionPhoto type={type} option={option} fallback={<SeatGraphic interior={option} />} />
        default:
            return null
    }
}
