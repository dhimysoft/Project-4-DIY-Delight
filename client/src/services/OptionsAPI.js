import request from './request'

// Every customizable option, the base price, and the rules for impossible combinations
export const getAllOptions = () => request('/api/options')
