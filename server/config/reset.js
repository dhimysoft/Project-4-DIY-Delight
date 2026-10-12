import { pool } from './database.js'
import { exteriors, roofs, wheels, interiors, incompatibilities, sampleCars } from './data.js'

// Drops and recreates every table, so any cars saved before are lost
const createTables = async () => {
    await pool.query(`
        DROP TABLE IF EXISTS custom_cars;
        DROP TABLE IF EXISTS incompatibilities;
        DROP TABLE IF EXISTS exteriors;
        DROP TABLE IF EXISTS roofs;
        DROP TABLE IF EXISTS wheels;
        DROP TABLE IF EXISTS interiors;

        CREATE TABLE exteriors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) NOT NULL,
            price INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE roofs (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            finish VARCHAR(20) NOT NULL,
            convertible_ok BOOLEAN NOT NULL DEFAULT false,
            price INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE wheels (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) NOT NULL,
            caliper VARCHAR(7) NOT NULL,
            style VARCHAR(20) NOT NULL,
            price INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE interiors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            seat VARCHAR(7) NOT NULL,
            accent VARCHAR(7) NOT NULL,
            price INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE incompatibilities (
            id SERIAL PRIMARY KEY,
            type_a VARCHAR(20) NOT NULL,
            id_a INTEGER NOT NULL,
            type_b VARCHAR(20) NOT NULL,
            id_b INTEGER NOT NULL,
            reason TEXT NOT NULL
        );

        CREATE TABLE custom_cars (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            convertible BOOLEAN NOT NULL DEFAULT false,
            exterior_id INTEGER NOT NULL REFERENCES exteriors(id),
            roof_id INTEGER NOT NULL REFERENCES roofs(id),
            wheel_id INTEGER NOT NULL REFERENCES wheels(id),
            interior_id INTEGER NOT NULL REFERENCES interiors(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `)
    console.log('🎉 tables created successfully')
}

// Inserts the rows and returns a { name: id } lookup so other seed data can refer to them
const insertOptions = async (table, rows) => {
    const ids = {}

    for (const row of rows) {
        const columns = Object.keys(row)
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
        const results = await pool.query(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
            Object.values(row)
        )
        ids[row.name] = results.rows[0].id
    }

    return ids
}

const seedTables = async () => {
    const ids = {
        exterior: await insertOptions('exteriors', exteriors),
        roof: await insertOptions('roofs', roofs),
        wheel: await insertOptions('wheels', wheels),
        interior: await insertOptions('interiors', interiors)
    }

    const idFor = (type, name) => {
        if (!ids[type][name]) throw new Error(`Unknown ${type} "${name}" in seed data`)
        return ids[type][name]
    }

    for (const { a, b, reason } of incompatibilities) {
        await pool.query(
            'INSERT INTO incompatibilities (type_a, id_a, type_b, id_b, reason) VALUES ($1, $2, $3, $4, $5)',
            [a[0], idFor(...a), b[0], idFor(...b), reason]
        )
    }

    for (const car of sampleCars) {
        await pool.query(
            `INSERT INTO custom_cars (name, convertible, exterior_id, roof_id, wheel_id, interior_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                car.name,
                car.convertible,
                idFor('exterior', car.exterior),
                idFor('roof', car.roof),
                idFor('wheel', car.wheel),
                idFor('interior', car.interior)
            ]
        )
    }

    console.log('🌱 tables seeded successfully')
}

const resetDatabase = async () => {
    try {
        await createTables()
        await seedTables()
    } catch (error) {
        console.error('⚠️ error resetting database:', error)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

resetDatabase()
