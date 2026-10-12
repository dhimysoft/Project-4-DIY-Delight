import { pool } from '../config/database.js'
import { BASE_PRICE } from '../config/pricing.js'
import { OPTION_TABLES } from './options.js'
import { OPTION_TYPES, findConflicts } from '../utilities/validation.js'

// A car joined with the options it uses, plus its total price
const CAR_SELECT = `
    SELECT c.id, c.name, c.convertible, c.created_at,
           to_jsonb(e) AS exterior,
           to_jsonb(r) AS roof,
           to_jsonb(w) AS wheel,
           to_jsonb(i) AS interior,
           $1::int + e.price + r.price + w.price + i.price AS total_price
    FROM custom_cars c
    JOIN exteriors e ON e.id = c.exterior_id
    JOIN roofs r ON r.id = c.roof_id
    JOIN wheels w ON w.id = c.wheel_id
    JOIN interiors i ON i.id = c.interior_id
`

const fetchCar = async (id) => {
    const results = await pool.query(`${CAR_SELECT} WHERE c.id = $2`, [BASE_PRICE, id])
    return results.rows[0]
}

// Checks a car submission and returns { car } with clean values, or { status, error }.
// Rejects bad input (400) and impossible feature combinations (422).
const validateCar = async (input) => {
    const name = typeof input.name === 'string' ? input.name.trim() : ''
    if (name.length === 0 || name.length > 100) {
        return { status: 400, error: 'Give your car a name (up to 100 characters).' }
    }

    if (typeof input.convertible !== 'boolean') {
        return { status: 400, error: 'Convertible must be true or false.' }
    }

    const selection = {}
    for (const type of OPTION_TYPES) {
        const id = input[`${type}_id`]
        if (!Number.isInteger(id)) {
            return { status: 400, error: `Choose a ${type} option.` }
        }

        const results = await pool.query(`SELECT * FROM ${OPTION_TABLES[type]} WHERE id = $1`, [id])
        if (results.rows.length === 0) {
            return { status: 400, error: `That ${type} option doesn't exist.` }
        }
        selection[type] = results.rows[0]
    }

    const rules = await pool.query('SELECT * FROM incompatibilities')
    const [conflict] = findConflicts(selection, input.convertible, rules.rows)
    if (conflict) {
        return { status: 422, error: conflict.message }
    }

    return {
        car: {
            name,
            convertible: input.convertible,
            exterior_id: selection.exterior.id,
            roof_id: selection.roof.id,
            wheel_id: selection.wheel.id,
            interior_id: selection.interior.id
        }
    }
}

const getCars = async (req, res) => {
    try {
        const results = await pool.query(`${CAR_SELECT} ORDER BY c.id ASC`, [BASE_PRICE])
        res.status(200).json(results.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not load the cars.' })
    }
}

const getCar = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'The car id must be a number.' })
        }

        const car = await fetchCar(id)
        if (!car) {
            return res.status(404).json({ error: 'Car not found.' })
        }

        res.status(200).json(car)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not load the car.' })
    }
}

const createCar = async (req, res) => {
    try {
        const { car, status, error } = await validateCar(req.body)
        if (error) {
            return res.status(status).json({ error })
        }

        const results = await pool.query(
            `INSERT INTO custom_cars (name, convertible, exterior_id, roof_id, wheel_id, interior_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [car.name, car.convertible, car.exterior_id, car.roof_id, car.wheel_id, car.interior_id]
        )

        res.status(201).json(await fetchCar(results.rows[0].id))
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not save the car.' })
    }
}

const updateCar = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'The car id must be a number.' })
        }

        const existing = await pool.query('SELECT * FROM custom_cars WHERE id = $1', [id])
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found.' })
        }

        // Fields missing from the request keep their current values
        const { car, status, error } = await validateCar({ ...existing.rows[0], ...req.body })
        if (error) {
            return res.status(status).json({ error })
        }

        await pool.query(
            `UPDATE custom_cars
             SET name = $1, convertible = $2, exterior_id = $3, roof_id = $4, wheel_id = $5, interior_id = $6
             WHERE id = $7`,
            [car.name, car.convertible, car.exterior_id, car.roof_id, car.wheel_id, car.interior_id, id]
        )

        res.status(200).json(await fetchCar(id))
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not update the car.' })
    }
}

const deleteCar = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'The car id must be a number.' })
        }

        const results = await pool.query('DELETE FROM custom_cars WHERE id = $1 RETURNING *', [id])
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found.' })
        }

        res.status(200).json(results.rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not delete the car.' })
    }
}

export default {
    getCars,
    getCar,
    createCar,
    updateCar,
    deleteCar
}
