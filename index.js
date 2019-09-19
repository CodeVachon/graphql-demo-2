const express = require("express");
const app = express();
const PORT = require("./package.json").nodemonConfig.env.PORT;
const ApolloServer = require("apollo-server-express").ApolloServer;

const init = require("./init");

init().then(() => {
    app.set("json spaces", 4);
    app.set("view engine", "pug");
    app.use(express.static(__dirname + "/public"));

    new ApolloServer({
        schema: require("./graphQL"),
        playground: true,
        introspection: true,
        tracing: true
    }).applyMiddleware({ app: app });;

    app.use("/", require("./routes/index")());

    app.listen(PORT, () => {
        console.info("http://localhost:" + PORT);
    });
});
