
const knex = require("./../knex");
const extend = require("extend");
const { now, shortId } = require("./utl");

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
} // close Label

module.exports = Label;
