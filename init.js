const knex = require("./knex");

const Album = require("./models/Album");
const Artist = require("./models/Artist");
const Label = require("./models/Label");
const Track = require("./models/Track");

const BaseRecordSet = [
    {
        title: "La Difference: A History Unplugged",
        cover: "/images/514rLl6fup.jpg",
        artist: {
            name: "54-40"
        },
        label: {
            name: "eOne Music"
        },
        tracks: [
            {
                title: "Ocean Pearl",
                duration: "3:25"
            },
            {
                title: "She La",
                duration: "3:58"
            },
            {
                title: "Since When",
                duration: "5:00"
            },
            {
                title: "One Day in Your Life",
                duration: "4:01"
            },
            {
                title: "Baby Ran",
                duration: "3:43"
            },
            {
                title: "I Go Blind",
                duration: "2:42"
            },
            {
                title: "One Gun",
                duration: "5:05"
            },
            {
                title: "Crossing a Canyon",
                duration: "3:32"
            },
            {
                title: "Casual Viewin",
                duration: "5:09"
            },
            {
                title: "Lies to Me",
                duration: "3:19"
            }
        ]
    },
    {
        title: "Gary Clark Jr. Live",
        cover: "/images/816nuZkOdJL.jpg",
        artist: {
            name: "Gary Clark Jr."
        },
        label: {
            name: "Warner Bros"
        },
        tracks: [
            {
                title: "Catfish Blues",
                duration: "8:00"
            },
            {
                title: "Next Door Neighbor Blues",
                duration: "4:06"
            },
            {
                title: "Travis Country",
                duration: "3:42"
            },
            {
                title: "When My Train Pulls In",
                duration: "7:10"
            },
            {
                title: "Don't Owe You a Thang",
                duration: "6:12"
            },
            {
                title: "Three O'Clock Blues",
                duration: "6:23"
            },
            {
                title: "Things Are Changin'",
                duration: "6:09"
            },
            {
                title: "Numb",
                duration: "6:13"
            },
            {
                title: "Ain't Messin 'Round",
                duration: "6:36"
            },
            {
                title: "If Trouble Was Money",
                duration: "6:40"
            },
            {
                title: "Third Stone from the Sun / If You Love Me Like You Say",
                duration: "10:27"
            },
            {
                title: "Please Come Home",
                duration: "6:33"
            },
            {
                title: "Blak an Blu",
                duration: "4:03"
            },
            {
                title: "Bright Lights",
                duration: "8:26"
            },
            {
                title: "When the Sun Goes Down",
                duration: "5:44"
            }
        ]
    }
]; // close Books



const init = () => {
    let insertRecords = false;

    console.info("Init!");
    return new Promise(resolve => {
        console.info("Init Start!");
        resolve();
    }).then(() => {
        return knex.schema.hasTable("Artists").then((exists) => {
            if (!exists) {
                console.info("Build Artists Schema");
                insertRecords = true;
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
                insertRecords = true;
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
                insertRecords = true;
                return knex.schema.createTable("Albums", (table) => {
                    table.string("id", 10).primary();
                    table.string("title", 50).notNull().defaultTo("");
                    table.string("description", 255).defaultTo("");
                    table.string("cover", 800);
                    table.dateTime("releaseDate");
                    table.string("artist_id");
                    table.foreign("artist_id").references("Artists.id");
                    table.string("label_id");
                    table.foreign("label_id").references("Labels.id");
                    table.dateTime("created").notNull().defaultTo(knex.fn.now());
                    table.dateTime("updated").notNull().defaultTo(knex.fn.now());
                    table.boolean("isDeleted").notNull().defaultTo(false);
                });
            }
        })
    }).then(() => {
        return knex.schema.hasTable("AlbumTracks").then((exists) => {
            if (!exists) {
                console.info("Build Album Tracks Schema");
                insertRecords = true;
                return knex.schema.createTable("AlbumTracks", (table) => {
                    table.string("id", 10).primary();
                    table.string("title", 50).notNull().defaultTo("");
                    table.integer("trackNo", 2).notNull().defaultTo(0);
                    table.integer("duration", 10).notNull().defaultTo(0);
                    table.string("album_id");
                    table.foreign("album_id").references("Albums.id");
                    table.dateTime("created").notNull().defaultTo(knex.fn.now());
                    table.dateTime("updated").notNull().defaultTo(knex.fn.now());
                    table.boolean("isDeleted").notNull().defaultTo(false);
                });
            }
        })
    }).then(() => {
        if (insertRecords) {
            console.info("Insert Base Data");
            return Promise.all(BaseRecordSet.map(record => {
                const thisRecord = { ...record };

                delete thisRecord.artist;
                delete thisRecord.label;
                delete thisRecord.tracks;

                return Promise.all([
                    new Album(thisRecord),
                    new Artist(record.artist),
                    new Label(record.label)
                ]).then(([
                    thisAlbum,
                    thisArtist,
                    thisLabel
                ]) => {
                    return thisAlbum.addArtist(thisArtist).then(thisAlbum => {
                        return thisAlbum.addLabel(thisLabel);
                    }).then(thisAlbum => {
                        if (record.tracks) {
                            return Promise.all(record.tracks.map((track, index) => {
                                return new Track({
                                    ...track,
                                    trackNo: index + 1
                                }).then(thisTrack => {
                                    return thisAlbum.addTrack(thisTrack.id)
                                }).then(() => {
                                    return thisAlbum;
                                });
                            }));
                        } else {
                            return Promise.resolve();
                        }
                    });
                });
            }));
        } else {
            return Promise.resolve();
        }
    }).then(() => {
        console.info("Init Complete!");
    }).catch(error => {
        console.error(error);
    });
};

module.exports = init;
