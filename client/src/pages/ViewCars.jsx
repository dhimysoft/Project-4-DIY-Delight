import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCar, getAllCars } from '../services/CarsAPI'
import { formatPrice } from '../utilities/calcprice'
import '../App.css'
import '../css/Cars.css'

const ViewCars = ({ title }) => {
    const [cars, setCars] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = title
    }, [title])

    useEffect(() => {
        getAllCars().then(setCars).catch((err) => setError(err.message))
    }, [])

    const handleDelete = async (car) => {
        if (!window.confirm(`Delete "${car.name}"?`)) return

        try {
            await deleteCar(car.id)
            setCars((current) => current.filter((item) => item.id !== car.id))
            setError('')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="cars-page">
            {error && <p className="form-message error" role="alert">{error}</p>}

            {cars === null && !error && <p className="form-message">Loading cars…</p>}

            {cars?.length === 0 && (
                <article>
                    <header><h3>No cars yet 🚗</h3></header>
                    <p>Build your first one on the <Link to="/">Customize</Link> page.</p>
                </article>
            )}

            {cars?.map((car) => (
                <article key={car.id}>
                    <header>
                        <span className="car-icon" aria-hidden="true">🚗</span>
                        <h3>{car.name}</h3>
                        {car.convertible && <span className="tag">Convertible</span>}
                    </header>

                    <div className="car-summary">
                        <ul className="features">
                            <li><span aria-hidden="true">🖌️</span> <strong>Exterior:</strong> {car.exterior.name}</li>
                            <li><span aria-hidden="true">🛞</span> <strong>Wheels:</strong> {car.wheel.name}</li>
                            <li><span aria-hidden="true">😎</span> <strong>Roof:</strong> {car.roof.name}</li>
                            <li><span aria-hidden="true">💺</span> <strong>Interior:</strong> {car.interior.name}</li>
                        </ul>

                        <div className="car-actions">
                            <p className="price"><span aria-hidden="true">💰</span> {formatPrice(car.total_price)}</p>
                            <div className="buttons">
                                <Link to={`/customcars/${car.id}`} role="button">Details</Link>
                                <Link to={`/edit/${car.id}`} role="button">Edit</Link>
                                <button type="button" onClick={() => handleDelete(car)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}

export default ViewCars
