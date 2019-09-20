
const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");
const { gql } = require("apollo-server-express");

const artistModifyWhere = (queryBuilder, options) => {
    queryBuilder.where(options);

    return queryBuilder;
}; // close artistModifyWhere

class Artist {
    constructor(data) {
        if (shortId.isValid(String(data))) {
            return knex("Artists").first("*").where({
                id: data,
                isDeleted: false
            }).then((record) => {
                if (record) {
                    for (let [key, value] of Object.entries(record)) {
                        this[key] = value;
                    }
                }

                return this;
            });
        } else {
            return Artist.create(data);
        }
    } // close constructor

    albums() {
        const Album = require("./Album");

        return Album.getList({ where: {
            artist_id: this.id
        }});
    } // close albums

    albumCount() {
        const Album = require("./Album");

        return Album.count({
            where: {
                artist_id: this.id
            }
        });
    } // close albumCount

    labels() {
        const Album = require("./Album");
        const Label = require("./Label");

        return Album.getList({
            fields: "label_id",
            where: {
                artist_id: this.id
            }
        }).then(recordSet => Promise.all(recordSet.map(record => new Label(record.label_id))));
    } // close labels

    edit(data) {
        const dataset = extend(false, {
            updated: now()
        }, data);

        return knex("Artists").update(dataset).where({
            id: this.id
        }).then(() => new Artist(this.id));
    } // close edit

    delete() {
        return this.edit({
            isDeleted: true
        });
    } // close delete

    static getList(options) {
        const settings = extend(false, {
            orderBy: "name",
            orderDir: "asc"
        }, options);

        return knex("Artists").select("Artists.id").modify(artistModifyWhere, {
            isDeleted: false
        }).orderBy(settings.orderBy, settings.orderDir).then(recordSet => Promise.all(recordSet.map(record => new Artist(record.id))));
    } // close getList

    static count(options) {
        const settings = extend(false, {
        }, options);

        return knex("Artists").count("id as count").modify(artistModifyWhere, {
            isDeleted: false
        }).then(recordSet => recordSet[0].count);
    } // close getList

    static create(data) {
        const dataset = extend(false, {
            id: shortId.generate(),
            created: now(),
            updated: now()
        }, data);

        return knex("Artists").insert(dataset).then(() => new Artist(dataset.id));
    } // close create

    static getGraphResolvers() {
        return {
            Query: {
                artist: (root, args) => new Artist(args.id),
                getArtists: (root, args) => this.getList(args),
                countArtists: (root, args) => this.count(args)
            },
            Mutation: {
                createArtist: (root, args) => new Artist(args),
                editArtist: (root, args) => new Artist(args.id).then(thisArtist => thisArtist.edit(args)),
                removeArtist: (root, args) => new Artist(args.id).then(thisArtist => thisArtist.delete()),
            }
        };
    } // close getGraphResolvers

    static getGraphSchema() {
        return gql`
            type Artist {
                id: ID!
                name: String
                description: String
                image: String
                albums: [Album]
                albumCount: Int
                labels: [Label]
                created: DateTime
                updated: DateTime
            }

            extend type Query {
                artist(id: ID!): Artist
                getArtists: [Artist]
                countArtists: Int
            }

            extend type Mutation {
                createArtist(
                    name: String!
                    description: String
                    image: String
                ): Artist
                editArtist(
                    id: ID!
                    name: String
                    description: String
                    image: String
                ): Artist
                removeArtist(id: ID!): Boolean
            }
        `;
    } // close getGraphSchema
} // close Artist

module.exports = Artist;
