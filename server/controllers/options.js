import { pool } from '../config/database.js'
import { BASE_PRICE } from '../config/pricing.js'

// Option type -> table name. The table name is also the type used in API paths.
export const OPTION_TABLES = {
    exterior: 'exteriors',
    roof: 'roofs',
    wheel: 'wheels',
    interior: 'interiors'
}

const TABLE_NAMES = Object.values(OPTION_TABLES)

const getAllOptions = async (req, res) => {
    try {
        const [exteriors, roofs, wheels, interiors, incompatibilities] = await Promise.all([
            pool.query('SELECT * FROM exteriors ORDER BY id ASC'),
            pool.query('SELECT * FROM roofs ORDER BY id ASC'),
            pool.query('SELECT * FROM wheels ORDER BY id ASC'),
            pool.query('SELECT * FROM interiors ORDER BY id ASC'),
            pool.query('SELECT * FROM incompatibilities ORDER BY id ASC')
        ])

        res.status(200).json({
            basePrice: BASE_PRICE,
            exteriors: exteriors.rows,
            roofs: roofs.rows,
            wheels: wheels.rows,
            interiors: interiors.rows,
            incompatibilities: incompatibilities.rows
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not load the options.' })
    }
}

const getOptionsByType = async (req, res) => {
    try {
        const { type } = req.params
        if (!TABLE_NAMES.includes(type)) {
            return res.status(404).json({ error: `Unknown option type "${type}".` })
        }

        // type was checked against the list of table names above
        const results = await pool.query(`SELECT * FROM ${type} ORDER BY id ASC`)
        res.status(200).json(results.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not load the options.' })
    }
}

const getOptionById = async (req, res) => {
    try {
        const { type } = req.params
        const id = parseInt(req.params.id)
        if (!TABLE_NAMES.includes(type)) {
            return res.status(404).json({ error: `Unknown option type "${type}".` })
        }
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'The option id must be a number.' })
        }

        const results = await pool.query(`SELECT * FROM ${type} WHERE id = $1`, [id])
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Option not found.' })
        }

        res.status(200).json(results.rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Could not load the option.' })
    }
}

export default {
    getAllOptions,
    getOptionsByType,
    getOptionById
}
