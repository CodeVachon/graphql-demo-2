const knex = require("./knex");

const BaseRecordSet = [
]; // close Books

const init = () => {
    console.info("Init!");
    return new Promise(resolve => {
        console.info("Init Start!");
        resolve();
    }).then(() => {
        console.info("Init Complete!");
    }).catch(error => {
        console.error(error);
    });
};

module.exports = init;
