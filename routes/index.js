const express = require("express");
const pkg = require("./../package.json");

module.exports = () => {
    const router = express.Router({
        caseSensitive: true
    });

    router.route("*")
        .get((request, response) => {
            response.render("index", {
                styles: `/css/${pkg.name}.css`,
                script: `/js/${pkg.name}.js`
            });
        })
        ;

    return router;
};
