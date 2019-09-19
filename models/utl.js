const shortId = require("shortid");
shortId.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_");

const moment = require("moment-timezone");
const now = (date) => { return moment(date).format("YYYY-MM-DDTHH:mm:ssZ"); }


module.exports = {
    now,
    shortId
};
