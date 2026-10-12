import express from 'express'
import OptionsController from '../controllers/options.js'

const router = express.Router()

router.get('/', OptionsController.getAllOptions)
router.get('/:type', OptionsController.getOptionsByType)
router.get('/:type/:id', OptionsController.getOptionById)

export default router
