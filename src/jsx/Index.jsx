import React from "react";
import ReactDOM from "react-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCompactDisc } from "@fortawesome/free-solid-svg-icons";

library.add(faCompactDisc);

import AppIndex from "./App/Index";

const applicationNode = document.getElementById("Application");

if (applicationNode) {
    ReactDOM.render((<AppIndex />), applicationNode);
}
