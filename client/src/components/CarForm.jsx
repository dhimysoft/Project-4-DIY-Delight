import React, { useEffect, useMemo, useState } from 'react'
import Modal from 'react-modal'
import { getAllOptions } from '../services/OptionsAPI'
import { calcTotalPrice, formatPrice } from '../utilities/calcprice'
import { OPTION_TYPES, findConflicts, getOptionConflict } from '../utilities/validation'
import CarPhoto from './CarPhoto'
import { OptionImage } from './CarGraphics'
import '../css/CarForm.css'

// Label shown on the buttons and emoji used in the summary, and the key each
// group of options has in the options API response
const GROUPS = {
    exterior: { label: 'Exterior', emoji: '🖌️', key: 'exteriors' },
    roof: { label: 'Roof', emoji: '😎', key: 'roofs' },
    wheel: { label: 'Wheels', emoji: '🛞', key: 'wheels' },
    interior: { label: 'Interior', emoji: '💺', key: 'interiors' }
}

// The customizer used to create a car and to edit an existing one.
// car: the saved car being edited (omit when creating)
// onSubmit: called with the car to save; may throw an Error to show its message
const CarForm = ({ car, submitLabel, onSubmit, children }) => {
    const [options, setOptions] = useState(null)
    const [loadError, setLoadError] = useState('')
    const [selection, setSelection] = useState(null)
    const [convertible, setConvertible] = useState(false)
    const [name, setName] = useState('')
    const [openType, setOpenType] = useState(null)
    const [notice, setNotice] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getAllOptions().then(setOptions).catch((err) => setLoadError(err.message))
    }, [])

    // Start from the saved car when editing, otherwise from the first option of each group
    useEffect(() => {
        if (!options) return

        const pick = (type) => {
            const choices = options[GROUPS[type].key]
            return choices.find((choice) => choice.id === car?.[type]?.id) ?? choices[0]
        }

        setSelection(Object.fromEntries(OPTION_TYPES.map((type) => [type, pick(type)])))
        setConvertible(car?.convertible ?? false)
        setName(car?.name ?? '')
    }, [options, car])

    const conflicts = useMemo(
        () => (options && selection ? findConflicts(selection, convertible, options.incompatibilities) : []),
        [options, selection, convertible]
    )

    if (loadError) {
        return <p className="form-message error" role="alert">{loadError}</p>
    }

    if (!options || !selection) {
        return <p className="form-message">Loading options…</p>
    }

    const totalPrice = calcTotalPrice(options.basePrice, selection)
    const message = error || conflicts[0]?.message

    const openGroup = (type) => {
        setNotice('')
        setOpenType(openType === type ? null : type)
    }

    const choose = (type, option, conflict) => {
        if (conflict) {
            setNotice(conflict)
            return
        }

        setNotice('')
        setError('')
        setSelection({ ...selection, [type]: option })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (conflicts.length > 0) {
            setError(conflicts[0].message)
            return
        }

        setError('')
        setSaving(true)

        try {
            await onSubmit({
                name: name.trim(),
                convertible,
                exterior_id: selection.exterior.id,
                roof_id: selection.roof.id,
                wheel_id: selection.wheel.id,
                interior_id: selection.interior.id
            })
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }
    }

    return (
        <>
            <form className="car-form" onSubmit={handleSubmit}>
                <div className="options-bar">
                    <label className="convertible-toggle">
                        <input
                            type="checkbox"
                            checked={convertible}
                            onChange={(event) => {
                                setConvertible(event.target.checked)
                                setError('')
                            }}
                        />
                        Convertible
                    </label>

                    <div className="option-buttons">
                        {OPTION_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={openType === type ? 'active' : ''}
                                onClick={() => openGroup(type)}
                            >
                                {GROUPS[type].label}
                            </button>
                        ))}
                    </div>

                    <div className="submit-group">
                        <input
                            type="text"
                            value={name}
                            maxLength={100}
                            placeholder="My New Car"
                            aria-label="Car name"
                            required
                            onChange={(event) => {
                                setName(event.target.value)
                                setError('')
                            }}
                        />
                        {children}
                        <button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
                    </div>
                </div>

                {message && (
                    <p className={`form-message ${error ? 'error' : 'warning'}`} role="alert">
                        {error ? '' : '⚠️ '}{message}
                    </p>
                )}

                <div className="preview">
                    <div className="preview-card">
                        <CarPhoto
                            exterior={selection.exterior}
                            roof={selection.roof}
                            wheel={selection.wheel}
                            convertible={convertible}
                        />
                        <ul className="preview-summary">
                            {OPTION_TYPES.map((type) => (
                                <li key={type}>
                                    <span aria-hidden="true">{GROUPS[type].emoji}</span>
                                    <strong>{GROUPS[type].label}:</strong> {selection[type].name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="price-badge" aria-live="polite">
                    <span aria-hidden="true">💰</span> {formatPrice(totalPrice)}
                </div>
            </form>

            <Modal
                isOpen={openType !== null}
                onRequestClose={() => setOpenType(null)}
                parentSelector={() => document.getElementById('root')}
                ariaHideApp={false}
                className="options-modal"
                overlayClassName="options-overlay"
                contentLabel={openType ? `Choose ${GROUPS[openType].label}` : 'Options'}
            >
                {openType && (
                    <>
                        <div className="options-modal-body">
                            <div className="option-grid">
                                {options[GROUPS[openType].key].map((option) => {
                                    const conflict = getOptionConflict(
                                        openType, option, selection, convertible, options.incompatibilities
                                    )
                                    const selected = selection[openType].id === option.id

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`option-tile${selected ? ' selected' : ''}${conflict ? ' unavailable' : ''}`}
                                            aria-pressed={selected}
                                            aria-disabled={conflict ? 'true' : undefined}
                                            title={conflict || option.name}
                                            onClick={() => choose(openType, option, conflict)}
                                        >
                                            <OptionImage
                                                type={openType}
                                                option={option}
                                                selection={selection}
                                                convertible={convertible}
                                            />
                                            <span className="option-name">{option.name}</span>
                                            <span className="option-price">
                                                {conflict ? 'Unavailable' : option.price ? `+${formatPrice(option.price)}` : 'Included'}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            <button type="button" className="done-button" onClick={() => setOpenType(null)}>
                                Done
                            </button>
                        </div>

                        {notice && <p className="modal-notice" role="alert">⚠️ {notice}</p>}
                    </>
                )}
            </Modal>
        </>
    )
}

export default CarForm
