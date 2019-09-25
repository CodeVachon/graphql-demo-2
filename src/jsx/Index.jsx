import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCompactDisc } from "@fortawesome/free-solid-svg-icons";

library.add(faCompactDisc);

import AppIndex from "./App/Index";

const client = new ApolloClient({ uri: '/graphql' });
const applicationNode = document.getElementById("Application");

if (applicationNode) {
    ReactDOM.render((
        <ApolloProvider client={ client }>
            <AppIndex />
        </ApolloProvider>
    ), applicationNode);
}
