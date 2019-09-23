const knex = require("./../knex");
const extend = require("extend");
const { now, nowDate, shortId, convertMillisToDurationString } = require("./utl");
const { gql, UserInputError } = require("apollo-server-express");

const albumModifyQuery = (queryBuilder, options) => {
    queryBuilder.where(options);

    return queryBuilder;
}; // close albumModifyQuery

 const checkForAlbumValidationErrors = (dataset) => {
    if (dataset.hasOwnProperty("title")) {
         if (dataset.title.length < 5) {
             throw new UserInputError(`Title Too Short. Expected Min Length of 5, got ${dataset.title.length}`, {
                 invalidArgs: "title"
             });
         }
         if (dataset.title.length > 255) {
             throw new UserInputError(`Title Too Long. Expected Max Length of 255, got ${dataset.title.length}`, {
                 invalidArgs: "title"
             });
         }
     }
} // close checkForAlbumValidationErrors

class Album {
    constructor(data) {
        if (shortId.isValid(String(data))) {
            return knex("Albums").first("*").where({
                id: data,
                isDeleted: false
            }).then((record) => {
                if (record) {
                    for (let [key, value] of Object.entries(record)) {
                        this[key] = value;
                    }

                    if (this.releaseDate) {
                        this.releaseDate = nowDate(this.releaseDate);
                    }
                } else {
                    throw new UserInputError("Album Not Found");
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

    removeArtist() {
        return this.edit({
            artist_id: null
        });
    } // close removeArtist

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

    tracks() {
        const Track = require("./Track");

        return knex("AlbumTracks").select("id").where({
            album_id: this.id,
            isDeleted: 0
        }).orderBy("trackNo").then(recordSet => Promise.all(recordSet.map(record => new Track(record.id))))
    } // close tracks

    addTrack(trackData) {
        const Track = require("./Track");

        new Track(trackData).then(thisTrack => thisTrack.edit({
            album_id: this.id
        })).then(() => this);
    } // close addTrack

    trackCount() {
        return knex("AlbumTracks").count("id as count").where({
            album_id: this.id,
            isDeleted: 0
        }).then(recordSet => recordSet[0].count);
    } // close trackCount

    duration() {
        return knex("AlbumTracks").sum("duration as totalms").where({
            album_id: this.id,
            isDeleted: 0
        }).then(recordSet => convertMillisToDurationString(recordSet[0].totalms));
    }

    edit(data) {
        const dataset = extend(false, {
            updated: now()
        }, data.album);

        checkForAlbumValidationErrors(data.album);

        if (data.releaseDate) {
            data.releaseDate = nowDate(data.releaseDate);
        }

        return knex("Albums").update(dataset).where({
            id: this.id
        }).then(() => new Album(this.id));
    } // close edit

    delete() {
        return this.edit({
            isDeleted: true
        }).then(() => Promise.resolve(true));
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
            title: "",
            created: now(),
            updated: now()
        }, data.album);

        checkForAlbumValidationErrors(data.album);

        if (data.releaseDate) {
            data.releaseDate = nowDate(data.releaseDate);
        }

        return knex("Albums").insert(dataset).then(() => new Album(dataset.id));
    } // close create

    static getGraphResolvers() {
        return {
            Query: {
                album: (root, args) => new Album(args.id),
                getAlbums: (root, args) => this.getList(args),
                countAlbums: (root, args) => this.count(args)
            },
            Mutation: {
                createAlbum: (root, args) => new Album(args),
                editAlbum: (root, args) => new Album(args.id).then(record => record.edit(args)),
                removeAlbum: (root, args) => new Album(args.id).then(record => record.delete()),
                addArtistToAlbum: (root, args) => new Album(args.album_id).then(record => record.addArtist(args.artist_id)),
                removeArtistFromAlbum: (root, args) => new Album(args.album_id).then(record => record.removeArtist()),
                addLabelToAlbum: (root, args) => new Album(args.album_id).then(record => record.addLabel(args.label_id)),
                removeLabelFromAlbum: (root, args) => new Album(args.album_id).then(record => record.removeLabel()),
            }
        };
    } // close getGraphResolvers

    static getGraphSchema() {
        return gql`
            type Album {
                id: ID!
                title: String
                description: String
                "The Album Cover Image"
                cover: String
                "Release Date of the Album"
                releaseDate: Date
                artist_id: ID
                artist: Artist
                label_id: ID
                label: Label
                tracks: [Track]
                trackCount: Int
                duration: String
                created: DateTime
                updated: DateTime
            }

            extend type Query {
                album(id: ID!): Album
                getAlbums: [Album]
                countAlbums: Int
            }

            input AlbumInput {
                title: String
                description: String
                cover: String
                releaseDate: Date
                artist_id: ID
                label_id: ID
            }

            extend type Mutation {
                createAlbum(
                    album: AlbumInput!
                ): Album
                editAlbum(
                    id: ID!
                    album: AlbumInput!
                ): Album
                removeAlbum(id: ID!): Boolean
                addArtistToAlbum(
                    artist_id: ID!
                    album_id: ID!
                ): Album
                removeArtistFromAlbum(
                    album_id: ID!
                ): Album
                addLabelToAlbum(
                    label_id: ID!
                    album_id: ID!
                ): Album
                removeLabelFromAlbum(
                    album_id: ID!
                ): Album
            }
        `;
    } // close getGraphSchema
} // close Album

module.exports = Album;
