const { GraphQLDateTime, GraphQLTime } = require("graphql-iso-date");
const { gql, makeExecutableSchema } = require("apollo-server-express");
const extend = require("extend");

const defaultSchema = gql`
    type Query { _empty: Boolean }
    type Mutation { _empty: Boolean }
    scalar DateTime
    scalar Time
`;
const defaultResolvers = () => ({
    Query: {},
    Mutation: {},
    DateTime: GraphQLDateTime,
    Time: GraphQLTime
});

const Album = require("./models/Album");
const Artist = require("./models/Artist");
const Label = require("./models/Label");
const Track = require("./models/Track");

module.exports = makeExecutableSchema({
    typeDefs: [
        defaultSchema,
        Album.getGraphSchema(),
        Artist.getGraphSchema(),
        Label.getGraphSchema(),
        Track.getGraphSchema()
    ],
    resolvers: extend(
        true,
        defaultResolvers(),
        Album.getGraphResolvers(),
        Artist.getGraphResolvers(),
        Label.getGraphResolvers(),
        Track.getGraphResolvers()
    )
});
