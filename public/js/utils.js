// --- Utils

const debounce = (fn, delay = 200) => {
    let timeoutId

    return function (...args) {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

const he = () => {}
