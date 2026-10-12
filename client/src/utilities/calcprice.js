import { OPTION_TYPES } from './validation'

// The base price plus the price of every selected option
export const calcTotalPrice = (basePrice, selection) =>
    OPTION_TYPES.reduce((total, type) => total + (selection[type]?.price ?? 0), basePrice)

export const formatPrice = (price) => `$${price.toLocaleString('en-US')}`
