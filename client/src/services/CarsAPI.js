import request, { sendJSON } from './request'

const API_URL = '/api/cars'

export const getAllCars = () => request(API_URL)

export const getCar = (id) => request(`${API_URL}/${id}`)

export const createCar = (car) => sendJSON(API_URL, 'POST', car)

export const updateCar = (id, car) => sendJSON(`${API_URL}/${id}`, 'PATCH', car)

export const deleteCar = (id) => request(`${API_URL}/${id}`, { method: 'DELETE' })
