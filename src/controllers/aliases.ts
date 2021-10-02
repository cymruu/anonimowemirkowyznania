const adjectives = [
	'przyczajony', 'ukryty', 'niebieski', 'różowy', 'białkowy', 'podgnity', 'spocony', 'przystojny', 'ładny',
	'bezwzględny', 'cyniczny', 'lubieżny', 'żarliwy', 'elegancki', 'świetlisty', 'systematyczny', 'radosny',
	'terminowy', 'rzeczywisty', 'samotny', 'skrajny', 'szczęśliwy', 'odległy', 'spieniony', 'waleczny', 'agresywny',
	'mglisty', 'zdrowy', 'przyjemny', 'bogaty', 'bliski', 'biedny', 'azjatycki', 'święty', 'świecki',
	'meksykański', 'luksusowy', 'ponadgabarytowy', 'okiełznany', 'wierzgający', 'mętny', 'uzależniony',
	'pusty', 'uwielbiany', 'szklany', 'gwiezdny', 'mocny', 'silny', 'uprzejmy', 'miłosny', 'wolny',
	'plujacy', 'ognisty', 'iskrzacy', 'wykopowy', 'gruby', 'sześcioramienny', 'troskliwy', 'zakochany',
	'afrykański', 'czarny', 'biały', 'analogowy', 'pijany', 'zauroczony', 'zepsuty', 'nagi', 'polny',
	'zbożowy', 'charyzmatyczny', 'rudy', 'ciepły', 'niepełnosprawny', 'chytry', 'destrukcyjny', 'wybuchowy',
	'dobry', 'metalowy', 'aluminiowy', 'obity', 'trzeźwy', 'ezoteryczny', 'magiczny', 'mikroblogowy', 'gigantyczny',
	'głuchy', 'niewidomy', 'hałaśliwy', 'ostry', 'potężny', 'wybitny', 'czarodziejski', 'elficki', 'diabelski',
	'ponury', 'anonimowy', 'wygadany', 'wiedźmiński', 'pospolity', 'fikuśny',
	'zuchwały', 'wybrany', 'zrzędliwy', 'płodny', 'chrupiący',
	'urodzajny', 'słoneczny', 'słodki', 'sycący', 'suchy', 'białogłowy',
	'chłodny', 'tłusty', 'drapieżny', 'mocny', 'uśmiechnięty', 'ostry', 'zazdrosny', 'frasobliwy',
	'lojalny', 'nietuzinkowy', 'konserwatywny', 'żółty', 'czterokopytny', 'płaski', 'filigranowy',
	'morski'
]
const male = [
	'tygrys', 'niebieskipasek', 'ziomek', 'warchlak', 'cielak', 'piwniczak',
	'Mirek', 'rogal', 'pan', 'kloszard', 'seba', 'drań', 'dryblas', 'paw', 'konserwator',
	'hultaj', 'jegomość', 'łobuz', 'potwór', 'sadysta', 'nomad', 'tyran', 'narrator', 'esteta',
	'władca', 'góral', 'bydlak', 'rozbójnik', 'marzyciel', 'szejk', 'szambonurek',
	'eskimos', 'browar', 'barman', 'jabol', 'towarzysz', 'programista', 'obywatel',
	'wybranek', 'kat', 'degenerat', 'Michał', 'starzec', 'dziadek', 'ogrodnik', 'plantator',
	'daniel', 'ekolog', 'onkolog', 'urolog', 'dyrektor', 'grabarz', 'żniwiarz', 'dyrygent',
	'karp', 'baran', 'orangutan', 'wybraniec', 'knur', 'papież', 'szef', 'król', 'kalafior',
	'magik', 'czubek', 'świrus', 'listonosz', 'górnik', 'Janusz', 'bizon', 'kangur',
	'koczkodan', 'koń', 'lemur', 'mrówkojad', 'osioł', 'piżmowół'
]
const female = [
	'pantera', 'rozowypasek', 'Karyna', 'pani', 'kreatura', 'krowa', 'marzycielka', 'kaczka',
	'loszka', 'hostessa', 'eskimoska', 'franca', 'barmanka', 'mucha', 'osa', 'oślica', 'orka',
	'niewiasta', 'ropucha', 'alpaka', 'foka', 'kapucynka',
	'dziewczyna', 'baba', 'towarzyszka', 'programistka', 'obywatelka', 'ukochana', 'samica',
	'przyjaciółka', 'wybranka', 'dama', 'stara', 'Ania', 'babcia', 'feministka',
	'łania', 'żona', 'kochanka', 'kuropatwa', 'płaszczka', 'Julka', 'Grażyna', 'lama',
	'panda', 'surykatka', 'świnka', 'żyrafa'
]

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
function femaleForm(string) {
	return string.slice(0, -1) + 'a'
}
function getRandomItem(items) {
	return items[Math.floor(Math.random() * items.length)]
}
function getAlias() {
	const isMale = Math.random() >= 0.5
	let adj = capitalize(getRandomItem(adjectives))
	if (isMale === false) {
		adj = femaleForm(adj)
	}
	const name = capitalize(isMale ? getRandomItem(male) : getRandomItem(female))
	return `${adj}${name}`
}
export default getAlias
