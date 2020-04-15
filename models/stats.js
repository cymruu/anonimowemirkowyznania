var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const logger = require('../logger.js');

const statsModel = new mongoose.Schema({
    period: { type: mongoose.Schema.Types.String, enum: ['day', 'month', 'year'] },
    date: Date,
    count: mongoose.Schema.Types.Mixed,
    users: mongoose.Schema.Types.Mixed
});
statsModel.statics.addAction = function (type, username = undefined) {
    var date = new Date();
    var periods = [['year', new Date(date.getFullYear(), 0, 1), `${date.getFullYear()}`], ['month', new Date(date.getFullYear(), date.getMonth()), `${date.getMonth() + 1}-${date.getFullYear()}`], [
        'day', new Date(date.getFullYear(), date.getMonth(), date.getDate()), `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`]];
    for (var i = 0; i < periods.length; i++) {
        var increment = {};
        increment[`count.${type}`] = 1;
        if (username) increment[`users.${username}.${type}`] = 1;
        this.updateOne({ date: periods[i][1], period: periods[i][0] }, { date: periods[i][1], period: periods[i][0], $inc: increment }, { upsert: true }).exec(err => {
            if (err) logger.error(err);
        });
    }
}
var stats = mongoose.model('stat', statsModel);
module.exports = stats;
