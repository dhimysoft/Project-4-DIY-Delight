// Seed data for the option tables. Prices are what each option adds to the base price.

export const exteriors = [
    { name: 'Torch Red', color: '#cc0a14', price: 0 },
    { name: 'Arctic White', color: '#f2f3f1', price: 0 },
    { name: 'Black', color: '#101114', price: 0 },
    { name: 'Silver Flare Metallic', color: '#a9aeb4', price: 500 },
    { name: 'Hypersonic Gray Metallic', color: '#6a6f75', price: 500 },
    { name: 'Rapid Blue', color: '#1f6fe0', price: 500 },
    { name: 'Elkhart Lake Blue Metallic', color: '#1b3f7a', price: 500 },
    { name: 'Caffeine Metallic', color: '#4b392f', price: 500 },
    { name: 'Accelerate Yellow Tintcoat', color: '#f2c100', price: 1000 },
    { name: 'Sebring Orange Tintcoat', color: '#e4571b', price: 1000 }
]

// finish: how the roof is drawn (body | flash | nacelles | carbon | glass)
// convertible_ok: whether the roof can be fitted to a convertible
export const roofs = [
    { name: 'Body Color', finish: 'body', convertible_ok: true, price: 0 },
    { name: 'Carbon Flash Metallic', finish: 'flash', convertible_ok: true, price: 1000 },
    { name: 'Carbon Flash - Nacelles', finish: 'nacelles', convertible_ok: false, price: 1500 },
    { name: 'Transparent Roof Panel', finish: 'glass', convertible_ok: false, price: 1500 },
    { name: 'Visible Carbon Fiber', finish: 'carbon', convertible_ok: false, price: 2500 }
]

// color: rim color, caliper: brake caliper color, style: spoke layout (five | ten | twenty)
export const wheels = [
    { name: 'Silver Aluminum', color: '#c3c7cc', caliper: '#2a2a2d', style: 'five', price: 0 },
    { name: 'Carbon Flash with Accelerate Yellow Caliper', color: '#2c2d31', caliper: '#f2c100', style: 'five', price: 1000 },
    { name: 'Bronze Metallic', color: '#9a6b3c', caliper: '#2a2a2d', style: 'five', price: 995 },
    { name: 'Edge Blue', color: '#3b7bbf', caliper: '#2a2a2d', style: 'ten', price: 1295 },
    { name: 'Satin Graphite with Red Stripe', color: '#55585d', caliper: '#d3121d', style: 'ten', price: 1495 },
    { name: 'Gloss Black 20-Spoke', color: '#0b0b0d', caliper: '#cc0a14', style: 'twenty', price: 1295 }
]

// seat: main seat color, accent: bolsters and stitching
export const interiors = [
    { name: 'Jet Black', seat: '#1b1c1f', accent: '#3a3c40', price: 0 },
    { name: 'Jet Black with Gray Seat', seat: '#8a8e94', accent: '#1b1c1f', price: 295 },
    { name: 'Sky Cool Gray', seat: '#c3c7ca', accent: '#5b5f64', price: 995 },
    { name: 'Brownstone', seat: '#5b4333', accent: '#2c1f17', price: 1195 },
    { name: 'Jet Black / Adrenaline Red', seat: '#1b1c1f', accent: '#b2111b', price: 1195 },
    { name: 'Twilight Blue', seat: '#22406e', accent: '#0f1d36', price: 1295 },
    { name: 'Ceramic White', seat: '#ecebe6', accent: '#9a9a96', price: 1295 },
    { name: 'Adrenaline Red', seat: '#b2111b', accent: '#1b1c1f', price: 1495 },
    { name: 'Habanero Orange', seat: '#d9561c', accent: '#1b1c1f', price: 1495 },
    { name: 'Natural Dipped', seat: '#b47a4a', accent: '#3a2a1e', price: 1695 }
]

// Pairs of options that can't be ordered together (besides the convertible/roof
// rule, which is stored on the roofs table). Each side is [option type, option name].
export const incompatibilities = [
    {
        a: ['exterior', 'Torch Red'],
        b: ['interior', 'Adrenaline Red'],
        reason: "Torch Red paint can't be combined with an Adrenaline Red interior."
    },
    {
        a: ['exterior', 'Black'],
        b: ['wheel', 'Gloss Black 20-Spoke'],
        reason: "Gloss Black 20-Spoke wheels aren't offered with Black paint."
    },
    {
        a: ['exterior', 'Rapid Blue'],
        b: ['wheel', 'Edge Blue'],
        reason: "Edge Blue wheels aren't offered with Rapid Blue paint."
    },
    {
        a: ['exterior', 'Elkhart Lake Blue Metallic'],
        b: ['wheel', 'Edge Blue'],
        reason: "Edge Blue wheels aren't offered with Elkhart Lake Blue Metallic paint."
    },
    {
        a: ['exterior', 'Accelerate Yellow Tintcoat'],
        b: ['interior', 'Natural Dipped'],
        reason: "A Natural Dipped interior isn't offered with Accelerate Yellow Tintcoat paint."
    },
    {
        a: ['exterior', 'Arctic White'],
        b: ['interior', 'Ceramic White'],
        reason: "A Ceramic White interior isn't offered with Arctic White paint."
    },
    {
        a: ['exterior', 'Sebring Orange Tintcoat'],
        b: ['interior', 'Habanero Orange'],
        reason: "A Habanero Orange interior isn't offered with Sebring Orange Tintcoat paint."
    },
    {
        a: ['exterior', 'Caffeine Metallic'],
        b: ['interior', 'Brownstone'],
        reason: "A Brownstone interior isn't offered with Caffeine Metallic paint."
    }
]

// A couple of valid cars so the list isn't empty on a fresh database
export const sampleCars = [
    {
        name: 'Track Day',
        convertible: false,
        exterior: 'Torch Red',
        roof: 'Visible Carbon Fiber',
        wheel: 'Carbon Flash with Accelerate Yellow Caliper',
        interior: 'Natural Dipped'
    },
    {
        name: 'Weekend Cruiser',
        convertible: true,
        exterior: 'Arctic White',
        roof: 'Carbon Flash Metallic',
        wheel: 'Edge Blue',
        interior: 'Sky Cool Gray'
    }
]
