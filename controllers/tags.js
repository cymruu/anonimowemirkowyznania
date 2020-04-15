const tagController = {
  getTags: function (string) {
    const match = /#\w+/g;
    var tags = string.match(match) || [];
    return tags.map((v) => { return [v, 1] }).concat([['#anonimowemirkowyznania', 1]]);
  },
  trimTags: function (string, toTrim) {
    for (var i in toTrim) {
      if (toTrim[i][1] == 0) {
        string = string.replace(toTrim[i][0], '♯' + toTrim[i][0].slice(1));
      }
    }
    return string;
  },
  prepareArray: function (array, tag) {
    for (var i in array) {
      if (array[i][0] == '#' + tag) {
        array[i][1] ? array[i][1] = 0 : array[i][1] = 1;
      }
    }
    return array;
  }
}
module.exports = tagController;
