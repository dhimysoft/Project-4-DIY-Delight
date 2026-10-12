// Calls the API and returns the parsed JSON. Throws an Error carrying the API's
// error message when the response isn't OK, so callers can show it to the user.
const request = async (url, options = {}) => {
    let response

    try {
        response = await fetch(url, options)
    } catch (error) {
        throw new Error("Couldn't reach the server. Is it running?")
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.error || `Something went wrong (${response.status}).`)
    }

    return data
}

export const sendJSON = (url, method, body) =>
    request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

export default request
