
const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");
const { gql } = require("apollo-server-express");

const labelModifyWhere = (queryBuilder, options) => {
    queryBuilder.where(options);

    return queryBuilder;
}; // close labelModifyWhere

class Label {
    constructor(data) {
        if (shortId.isValid(String(data))) {
            return knex("Labels").first("*").where({
                id: data,
                isDeleted: false
            }).then((record) => {
                for (let [key, value] of Object.entries(record)) {
                    this[key] = value;
                }

                return this;
            });
        } else {
            return Label.create(data);
        }
    } // close constructor

    albums() {
        const Album = require("./Album");

        return Album.getList({
            where: {
                label_id: this.id
            }
        });
    } // close albums

    albumCount() {
        const Album = require("./Album");

        return Album.count({
            where: {
                label_id: this.id
            }
        });
    } // close albumCount

    artists() {
        const Album = require("./Album");
        const Artist = require("./Artist");

        return Album.getList({
            fields: "artist_id",
            where: {
                label_id: this.id
            }
        }).then(recordSet => Promise.all(recordSet.map(record => new Artist(record.artist_id))))
    } // close artists

    edit(data) {
        const dataset = extend(false, {
            updated: now()
        }, data);

        return knex("Labels").update(dataset).where({
            id: this.id
        }).then(() => new Label(this.id));
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

        return knex("Labels").select("Labels.id").modify(labelModifyWhere, {
            isDeleted: false
        }).orderBy(settings.orderBy, settings.orderDir).then(recordSet => Promise.all(recordSet.map(record => new Label(record.id))));
    } // close getList

    static count(options) {
        const settings = extend(false, {
        }, options);

        return knex("Labels").count("id as count").modify(labelModifyWhere, {
            isDeleted: false
        }).then(recordSet => recordSet[0].count);
    } // close getList

    static create(data) {
        const dataset = extend(false, {
            id: shortId.generate(),
            created: now(),
            updated: now()
        }, data);

        return knex("Labels").insert(dataset).then(() => new Label(dataset.id));
    } // close create


    static getGraphResolvers() {
        return {
            Query: {
                label: (root, args) => new Label(args.id),
                getLabels: (root, args) => this.getList(args),
                countLabels: (root, args) => this.count(args)
            }
        };
    } // close getGraphResolvers

    static getGraphSchema() {
        return gql`
            type Label {
                id: ID!
                name: String
                description: String
                image: String
                albums: [Album]
                albumCount: Int
                artists: [Artist]
                created: DateTime
                updated: DateTime
            }

            extend type Query {
                label(id: ID!): Label
                getLabels: [Label]
                countLabels: Int
            }
        `;
    } // close getGraphSchema
} // close Label

module.exports = Label;
