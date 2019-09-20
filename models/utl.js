const shortId = require("shortid");
shortId.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_");

const moment = require("moment-timezone");
const now = (date) => { return moment(date).format("YYYY-MM-DDTHH:mm:ssZ"); }
const nowDate = (date) => { return moment(date).format("YYYY-MM-DD"); }

const convertDurationStringToMillis = (durationString) => {
    const duration = durationString.split(":").map(value => Number(value)).reverse();

    return moment.duration({
        seconds: duration[0] || 0,
        minutes: duration[1] || 0,
        hours: duration[2] || 0
    }).asMilliseconds();
}; // close convertDurationStringToMillis

const convertMillisToDurationString = (millis) => {
    const duration = moment.duration(millis);

    return [
        duration.get("hours"),
        duration.get("minutes"),
        duration.get("seconds")
    ].filter((value, index) => {
        if (index < 1) {
            return (value > 0)
        } else {
            return true
        }
    }).map((value, index) => {
        let strValue = String(value);

        if (
            (index > 0) &&
            (strValue.length === 1)
        ) {
            strValue = `0${strValue}`;
        }

        return strValue;
    }).join(":");
}; // close convertMillisToDurationString

module.exports = {
    now,
    nowDate,
    shortId,
    convertDurationStringToMillis,
    convertMillisToDurationString
};
