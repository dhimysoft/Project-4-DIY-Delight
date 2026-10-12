// Mirrors server/utilities/validation.js. The server re-checks every submission;
// this copy lets the UI warn about impossible combinations before submitting.

export const OPTION_TYPES = ['exterior', 'roof', 'wheel', 'interior']

// selection: { exterior, roof, wheel, interior } option objects
// rules: the incompatibilities returned by the options API
// Returns every problem with the combination as { message, types }, where
// types lists which option groups the problem involves.
export const findConflicts = (selection, convertible, rules) => {
    const conflicts = []

    if (convertible && selection.roof && !selection.roof.convertible_ok) {
        conflicts.push({
            message: `The ${selection.roof.name} roof isn't available on a convertible.`,
            types: ['roof']
        })
    }

    for (const rule of rules) {
        if (selection[rule.type_a]?.id === rule.id_a && selection[rule.type_b]?.id === rule.id_b) {
            conflicts.push({ message: rule.reason, types: [rule.type_a, rule.type_b] })
        }
    }

    return conflicts
}

// Why `option` can't be picked for `type` given the rest of the build, or null if it can.
// Only problems involving that option group count, so one bad pairing elsewhere
// doesn't grey out every other option.
export const getOptionConflict = (type, option, selection, convertible, rules) => {
    const conflict = findConflicts({ ...selection, [type]: option }, convertible, rules)
        .find((found) => found.types.includes(type))

    return conflict ? conflict.message : null
}
