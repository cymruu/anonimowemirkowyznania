const width = 40
const targetValue = 235

export function makeProgressBar(amount) {
	const percentate = (amount / targetValue)

	const filledLength = Math.round(Math.min(percentate * width, width))
	const filledBar = filledLength ? new Array(filledLength).fill('=') : []

	const emptyLength = Math.max(0, width - filledLength)
	const emptyBar = emptyLength ? new Array(emptyLength).fill('.') : []

	return `${
		['[', ...filledBar, ...emptyBar, ']'].join('')
	} ${(percentate * 100).toFixed(0)}% (${amount}zł/${targetValue}zł)`
}
