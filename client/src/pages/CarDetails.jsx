import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OptionImage } from '../components/CarGraphics'
import { deleteCar, getCar } from '../services/CarsAPI'
import { formatPrice } from '../utilities/calcprice'
import '../App.css'
import '../css/Cars.css'

const CarDetails = ({ title }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = title
    }, [title])

    useEffect(() => {
        getCar(id).then(setCar).catch((err) => setError(err.message))
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${car.name}"?`)) return

        try {
            await deleteCar(car.id)
            navigate('/customcars')
        } catch (err) {
            setError(err.message)
        }
    }

    if (error) {
        return <p className="form-message error" role="alert">{error}</p>
    }

    if (!car) {
        return <p className="form-message">Loading car…</p>
    }

    // The four images, each with the name and price of the option it shows
    const features = [
        { type: 'exterior', label: 'Exterior', option: car.exterior },
        { type: 'roof', label: 'Roof', option: car.roof },
        { type: 'wheel', label: 'Wheels', option: car.wheel },
        { type: 'interior', label: 'Interior', option: car.interior }
    ]

    return (
        <div className="cars-page">
            <article>
                <header>
                    <span className="car-icon" aria-hidden="true">🚗</span>
                    <h3>{car.name}</h3>
                    {car.convertible && <span className="tag">Convertible</span>}
                </header>

                <div className="car-detail">
                    <div className="car-actions">
                        <p className="price"><span aria-hidden="true">💰</span> {formatPrice(car.total_price)}</p>
                        <div className="buttons">
                            <Link to={`/edit/${car.id}`} role="button">Edit</Link>
                            <button type="button" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>

                    <div className="feature-grid">
                        {features.map(({ type, label, option }) => (
                            <figure key={label}>
                                <div className="feature-image">
                                    <OptionImage type={type} option={option} selection={car} convertible={car.convertible} />
                                </div>
                                <figcaption>
                                    <strong>{label}:</strong> {option.name}
                                    <span className="option-price">
                                        {option.price ? `+${formatPrice(option.price)}` : 'Included'}
                                    </span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    )
}

export default CarDetails
