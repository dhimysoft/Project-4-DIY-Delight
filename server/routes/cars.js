import express from 'express'
import CarsController from '../controllers/cars.js'

const router = express.Router()

router.get('/', CarsController.getCars)
router.get('/:id', CarsController.getCar)
router.post('/', CarsController.createCar)
router.patch('/:id', CarsController.updateCar)
router.delete('/:id', CarsController.deleteCar)

export default router
