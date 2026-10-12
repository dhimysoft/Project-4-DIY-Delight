import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CarForm from '../components/CarForm'
import { createCar } from '../services/CarsAPI'
import '../App.css'

const CreateCar = ({ title }) => {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = title
    }, [title])

    const handleSubmit = async (car) => {
        await createCar(car)
        navigate('/customcars')
    }

    return <CarForm submitLabel="Create" onSubmit={handleSubmit} />
}

export default CreateCar
