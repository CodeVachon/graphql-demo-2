const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");

const albumModifyQuery = (queryBuilder, options) => {
    queryBuilder.where(options);

    return queryBuilder;
}; // close albumModifyQuery

class Album {
    constructor(data) {
        if (shortId.isValid(String(data))) {
            return knex("Albums").first("*").where({
                id: data,
                isDeleted: false
            }).then((record) => {
                for (let [key, value] of Object.entries(record)) {
                    this[key] = value;
                }

                return this;
            });
        } else {
            return Album.create(data);
        }
    } // close constructor

    addArtist(data) {
        if (shortId.isValid(String(data))) {
            return this.edit({
                artist_id: data
            });
        } else {
            return this.edit({
                artist_id: data.id
            });
        }
    } // close addArtist

    removeArticle() {
        return this.edit({
            artist_id: null
        });
    } // close removeArticle

    addLabel(data) {
        if (shortId.isValid(String(data))) {
            return this.edit({
                label_id: data
            });
        } else {
            return this.edit({
                label_id: data.id
            });
        }
    } // close addLabel

    removeLabel() {
        return this.edit({
            label_id: null
        });
    } // close removeLabel

    edit(data) {
        const dataset = extend(false, {
            updated: now()
        }, data);

        if (data.releaseDate) {
            data.releaseDate = now(data.releaseDate);
        }

        return knex("Albums").update(dataset).where({
            id: this.id
        }).then(() => new Album(this.id));
    } // close edit

    delete() {
        return this.edit({
            isDeleted: true
        });
    } // close delete

    static getList(options) {
        const settings = extend(false, {
            orderBy: "title",
            orderDir: "asc"
        }, options);

        return knex("Albums").select([
            "Albums.id",
            "Artists.name as artist",
            "Labels.name as label"
        ])
        .leftJoin("Artists", "Albums.artist_id", "Artists.id")
        .leftJoin("Labels", "Albums.label_id", "Labels.id")
        .modify(albumModifyQuery, {
            isDeleted: false
        }).orderBy(settings.orderBy, settings.orderDir).then(recordSet => Promise.all(recordSet.map(record => new Album(record.id))));
    } // close getList

    static count(options) {
        const settings = extend(false, {
        }, options);

        return knex("Albums").count("id as count").modify(albumModifyQuery, {
            isDeleted: false
        }).then(recordSet => recordSet[0].count);
    } // close getList

    static create(data) {
        const dataset = extend(false, {
            id: shortId.generate(),
            created: now(),
            updated: now()
        }, data);

        if (data.releaseDate) {
            data.releaseDate = now(data.releaseDate);
        }

        return knex("Albums").insert(dataset).then(() => new Album(dataset.id));
    } // close create
} // close Album

module.exports = Album;
