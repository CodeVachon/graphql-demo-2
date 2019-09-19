
const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");

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
                for (let [key, value] of Object.entries(record)) {
                    this[key] = value;
                }

                return this;
            });
        } else {
            return Artist.create(data);
        }
    } // close constructor

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
} // close Artist

module.exports = Artist;
