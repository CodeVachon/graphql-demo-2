const verbose = eval(process.env.VERBOSE) || false;
const pkg = require("./package.json");

module.exports = require("knex")({
    client: "sqlite3",
    connection: {
        filename: `./${pkg.name}-${pkg.version}.db`
    },
    pool: {
        afterCreate: (conn, cb) => {
            conn.run("PRAGMA foreign_keys = ON", cb);
        },
    },
    useNullAsDefault: true
}).on("query", (query) => ((verbose) ? console.debug(query.sql) : null));
