const shortId = require("shortid");
shortId.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_");

const moment = require("moment");
const now = (date) => { return moment(date).format("YYYY-MM-DD HH:mm:ss"); }


module.exports = {
    now,
    shortId
};
