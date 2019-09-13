import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Container from "./Common/Container";
import Row from "./Common/Row";
import Col from "./Common/Col";

const AppIndex = () => {
    return (
        <BrowserRouter>
            <Container>
                <Row>
                    <Col>
                        <h1 className="my-4"><FontAwesomeIcon icon="compact-disc"/> Record Collection</h1>
                    </Col>
                </Row>
                <Switch>
                    <Route exact path="/" component={ () => (<h1>Index</h1>) } />
                </Switch>
            </Container>
        </BrowserRouter>
    );
};

export default AppIndex;
