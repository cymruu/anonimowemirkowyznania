const adjectives = ['przyczajony', 'ukryty', 'niebieski', 'różowy', 'Białkowy', 'Podgnity', 'Spocony', 'przystojny', 'ładny', 'bezwzględny', 'cyniczny', 'lubieżny', 'żarliwy', 'elegancki', 'świetlisty', 'systematyczny', 'radosny', 'terminowy', 'rzeczywisty', 'samotny', 'szczęśliwy', 'odległy', 'spieniony', 'waleczny', 'agresywny', 'mglisty', 'zdrowy', 'przyjemny', 'bogaty', 'bliski', 'biedny', 'azjatycki', 'święty', 'świecki', 'meksykański', 'luksusowy', 'ponadgabarytowy', 'okiełznany', 'wierzgający', 'mętny', 'uzależniony', 'pusty', 'uwielbiany', 'szklany', 'gwiezdny', 'mocny', 'silny', 'uprzejmy', 'miłosny', 'wolny', 'plujacy', 'ognisty', 'iskrzacy', 'wykopowy', 'gruby', 'sześcioramienny', 'troskliwy', 'zakochany', 'afrykański', 'czarny', 'biały', 'analny', 'analogowy', 'pijany', 'naćpany', 'zepsuty', 'nagi', 'polny', 'zbożowy', 'charyzmatyczny', 'rudy', 'ciepły', 'niepełnosprawny', 'chytry', 'destrukcyjny', 'wybuchowy', 'dobry', 'metalowy', 'aluminiowy', 'obity','trzeźwy', 'ezoteryczny', 'magiczny', 'mikroblogowy', 'gigantyczny', 'głuchy', 'niewidomy', 'hałaśliwy'];
const male = ['tygrys', 'kondon', 'niebieskipasek', 'ziomek', 'warchlak', 'cielak', 'piwniczak', 'przegryw', 'Mirek', 'rogal', 'pan', 'żul', 'menel', 'stulejarz', 'seba', 'drań', 'dryblas', 'hultaj', 'jegomość', 'łobuz', 'potwór', 'sadysta', 'nomad', 'tyran', 'narrator', 'esteta', 'władca', 'góral', 'morderca', 'bydlak', 'rozbójnik', 'marzyciel', 'szejk', 'azjata', 'eskimos', 'murzyn', 'browar', 'barman', 'jabol', 'towarzysz', 'programista', 'obywatel', 'wybranek', 'kat', 'zwyrodnialec', 'zboczeniec', 'dewiant', 'Michał', 'starzec', 'dziadek'];
const female = ['pantera', 'rozowypasek', 'loszka', 'Karyna', 'pani', 'kreatura', 'krowa', 'marzycielka', 'kaczka', 'maciora', 'loszka', 'hostessa', 'azjatka', 'eskimoska', 'murzynka', 'franca', 'barmanka', 'dziewczyna', 'baba', 'towarzyszka', 'programistka', 'obywatelka', 'ukochana', 'samica', 'przyjaciółka', 'wybranka', 'dama', 'stara', 'Ania', 'Elfka', 'babcia'];

function capitalize(string){
  return string.charAt(0).toUpperCase()+string.slice(1);
}
function femaleForm(string){
  return string.slice(0,-1)+'a';
}
function getAlias(sex) {
  sex?alias = capitalize(adjectives[Math.floor(Math.random()*adjectives.length)])+capitalize(male[Math.floor(Math.random()*male.length)]):alias =  capitalize(femaleForm(adjectives[Math.floor(Math.random()*adjectives.length)]))+capitalize(female[Math.floor(Math.random()*female.length)]);
  return alias;
}
module.exports = getAlias;
