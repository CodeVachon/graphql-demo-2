const knex = require("./knex");
const shortId = require("shortid");

const BaseRecordSet = [
    {
        title: "La Difference: A History Unplugged",
        cover: "/images/514rLl6fup.jpg",
        artist: {
            name: "54-40"
        },
        label: {
            name: "eOne Music"
        }
    },
    {
        title: "Gary Clark Jr. Live",
        cover: "/images/816nuZkOdJL.jpg",
        artist: {
            name: "Gary Clark Jr."
        },
        label: {
            name: "Warner Bros"
        }
    }
]; // close Books

const init = () => {
    console.info("Init!");
    return new Promise(resolve => {
        console.info("Init Start!");
        resolve();
    }).then(() => {
        return knex.schema.hasTable("Artists").then((exists) => {
            if (!exists) {
                console.info("Build Artists Schema");
                return knex.schema.createTable("Artists", (table) => {
                    table.string("id", 10).primary();
                    table.string("name", 50).notNull().defaultTo("");
                    table.string("description", 255).defaultTo("");
                    table.string("image", 800);
                    table.dateTime("created").notNull().defaultTo(knex.fn.now());
                    table.dateTime("updated").notNull().defaultTo(knex.fn.now());
                    table.boolean("isDeleted").notNull().defaultTo(false);
                });
            }
        })
    }).then(() => {
        return knex.schema.hasTable("Labels").then((exists) => {
            if (!exists) {
                console.info("Build Label Schema");
                return knex.schema.createTable("Labels", (table) => {
                    table.string("id", 10).primary();
                    table.string("name", 50).notNull().defaultTo("");
                    table.string("description", 255).defaultTo("");
                    table.string("image", 800);
                    table.dateTime("created").notNull().defaultTo(knex.fn.now());
                    table.dateTime("updated").notNull().defaultTo(knex.fn.now());
                    table.boolean("isDeleted").notNull().defaultTo(false);
                });
            }
        })
    }).then(() => {
        return knex.schema.hasTable("Albums").then((exists) => {
            if (!exists) {
                console.info("Build Albums Schema");
                return knex.schema.createTable("Albums", (table) => {
                    table.string("id", 10).primary();
                    table.string("title", 50).notNull().defaultTo("");
                    table.string("description", 255).defaultTo("");
                    table.string("cover", 800);
                    table.dateTime("releaseDate");
                    table.string("artist_id").notNull();
                    table.foreign("artist_id").references("Artists.id");
                    table.string("label_id").notNull();
                    table.foreign("label_id").references("Labels.id");
                    table.dateTime("created").notNull().defaultTo(knex.fn.now());
                    table.dateTime("updated").notNull().defaultTo(knex.fn.now());
                    table.boolean("isDeleted").notNull().defaultTo(false);
                });
            }
        })
    }).then(() => {
        console.info("Init Complete!");
    }).catch(error => {
        console.error(error);
    });
};

module.exports = init;
