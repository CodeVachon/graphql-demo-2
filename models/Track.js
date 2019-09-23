
const knex = require("./../knex");
const extend = require("extend");
const { now, shortId, convertDurationStringToMillis, convertMillisToDurationString } = require("./utl");
const { gql } = require("apollo-server-express");

const trackModifyWhere = (queryBuilder, options) => {
    queryBuilder.where(options);

    return queryBuilder;
}; // close trackModifyWhere

class Track {
    constructor(data) {
        if (shortId.isValid(String(data))) {
            return knex("AlbumTracks").first("*").where({
                id: data,
                isDeleted: false
            }).then((record) => {
                if (record) {
                    for (let [key, value] of Object.entries(record)) {
                        this[key] = value;
                    }

                    this.duration = convertMillisToDurationString(this.duration);
                } else {
                    throw new UserInputError("Track Not Found");
                }

                return this;
            });
        } else {
            return Track.create(data);
        }
    } // close constructor

    edit(data) {
        const dataset = extend(false, {
            updated: now()
        }, data.track);

        if (dataset.duration) {
            dataset.duration = convertDurationStringToMillis(dataset.duration);
        }

        return knex("AlbumTracks").update(dataset).where({
            id: this.id
        }).then(() => new Track(this.id));
    } // close edit

    delete() {
        return this.edit({
            isDeleted: true
        }).then(() => Promise.resolve(true));
    } // close delete

    static getList(options) {
        const settings = extend(false, {
            orderBy: "trackNo",
            orderDir: "asc",
            where: {}
        }, options);

        return knex("AlbumTracks").select("Tracks.id").modify(trackModifyWhere, extend(false, {
            isDeleted: false
        }, settings.where)).orderBy(settings.orderBy, settings.orderDir).then(recordSet => Promise.all(recordSet.map(record => new Track(record.id))));
    } // close getList

    static count(options) {
        const settings = extend(false, {
            where: {}
        }, options);

        return knex("AlbumTracks").count("id as count").modify(trackModifyWhere, extend(false, {
            isDeleted: false
        }, settings.where)).then(recordSet => recordSet[0].count);
    } // close getList

    static create(data) {
        const dataset = extend(false, {
            id: shortId.generate(),
            duration: "0",
            created: now(),
            updated: now()
        }, data.track);

        dataset.duration = convertDurationStringToMillis(dataset.duration);

        return knex("AlbumTracks").insert(dataset).then(() => new Track(dataset.id));
    } // close create


    static getGraphResolvers() {
        return {
            Query: {
                track: (root, args) => new Track(args.id),
                getTracks: (root, args) => this.getList(args),
                countTracks: (root, args) => this.count(args)
            },
            Mutation: {
                addTrack: (root, args) => new Track(args),
                editTrack: (root, args) => new Track(args.id).then(thisTrack => thisTrack.edit(args)),
                removeTrack: (root, args) => new Track(args.id).then(thisTrack => thisTrack.delete()),
            }
        };
    } // close getGraphResolvers

    static getGraphSchema() {
        return gql`
            type Track {
                id: ID!
                title: String
                trackNo: Int
                duration: String
                created: DateTime
                updated: DateTime
            }

            extend type Query {
                track(id: ID!): Track
                getTracks: [Track]
                countTracks: Int
            }

            input TrackInput {
                title: String
                duration: String
                trackNo: Int
                album_id: ID
            }

            extend type Mutation {
                addTrack(
                    track: TrackInput!
                ): Track
                editTrack(
                    id: ID!
                    track: TrackInput!
                ): Track
                removeTrack(id: ID!): Boolean
            }
        `;
    } // close getGraphSchema
} // close Track

module.exports = Track;
