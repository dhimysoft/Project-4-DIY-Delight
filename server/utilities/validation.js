// Mirrors client/src/utilities/validation.js so the server never trusts the client.

export const OPTION_TYPES = ['exterior', 'roof', 'wheel', 'interior']

// selection: { exterior, roof, wheel, interior } option rows
// rules: rows from the incompatibilities table
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
