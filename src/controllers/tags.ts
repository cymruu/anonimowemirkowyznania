export function getTags(string) {
	const match = /#\w+/g
	const tags = string.match(match) || []
	return tags.map((v) => { return [v, 1] }).concat([['#anonimowemirkowyznania', 1]])
}
export function trimTags(string, toTrim) {
	for (const i in toTrim) {
		if (toTrim[i][1] == 0) {
			string = string.replace(toTrim[i][0], '♯' + toTrim[i][0].slice(1))
		}
	}
	return string
}
export function prepareArray(array, tag) {
	for (const i in array) {
		if (array[i][0] == '#' + tag) {
			array[i][1] ? array[i][1] = 0 : array[i][1] = 1
		}
	}
	return array
}
