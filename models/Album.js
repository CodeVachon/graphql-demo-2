const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");
const { gql } = require("apollo-server-express");

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

    artist() {
        const Artist = require("./Artist");

        if (this.artist_id) {
            return new Artist(this.artist_id);
        } else {
            return Promise.resolve(null);
        }
    } // close artist

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

    label() {
        const Label = require("./Label");

        if (this.label_id) {
            return new Label(this.label_id);
        } else {
            return Promise.resolve(null);
        }
    } // close label

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
            fields: "*",
            orderBy: "title",
            orderDir: "asc",
            where: {},
        }, options);

        return knex("Albums")
            .distinct("*")
            .modify(albumModifyQuery, extend(false, {
                "Albums.isDeleted": false
            }, settings.where))
            .orderBy(settings.orderBy, settings.orderDir)
            .then(recordSet => {
                if (settings.fields === "*") {
                    return Promise.all(recordSet.map(record => new Album(record.id)));
                } else {
                    return recordSet.map(record => {
                        const newRecord = {};

                        if (!Array.isArray(settings.fields)) {
                            settings.fields = settings.fields.split(",").map(value => String(value).trim());
                        }

                        settings.fields.forEach(field => {
                            newRecord[field] = record[field];
                        });

                        return newRecord;
                    });
                }
            });
    } // close getList

    static count(options) {
        const settings = extend(false, {
            where: {},
        }, options);

        return knex("Albums").count("id as count").modify(albumModifyQuery, extend(false, {
            "Albums.isDeleted": false
        }, settings.where)).then(recordSet => recordSet[0].count);
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

    static getGraphResolvers() {
        return {
            Query: {
                album: (root, args) => new Album(args.id),
                getAlbums: (root, args) => this.getList(args),
                countAlbums: (root, args) => this.count(args)
            }
        };
    } // close getGraphResolvers

    static getGraphSchema() {
        return gql`
            type Album {
                id: ID!
                title: String
                description: String
                cover: String
                releaseDate: DateTime
                artist_id: ID
                artist: Artist
                label_id: ID
                label: Label
                created: DateTime
                updated: DateTime
            }

            extend type Query {
                album(id: ID!): Album
                getAlbums: [Album]
                countAlbums: Int
            }
        `;
    } // close getGraphSchema
} // close Album

module.exports = Album;
