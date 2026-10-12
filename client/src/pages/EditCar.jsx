import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CarForm from '../components/CarForm'
import { getCar, updateCar } from '../services/CarsAPI'
import '../App.css'

const EditCar = ({ title }) => {
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

    const handleSubmit = async (changes) => {
        const saved = await updateCar(id, changes)
        navigate(`/customcars/${saved.id}`)
    }

    if (error) {
        return <p className="form-message error" role="alert">{error}</p>
    }

    if (!car) {
        return <p className="form-message">Loading car…</p>
    }

    return (
        <CarForm car={car} submitLabel="Save" onSubmit={handleSubmit}>
            <Link to={`/customcars/${id}`} role="button" className="secondary">Cancel</Link>
        </CarForm>
    )
}

export default EditCar
