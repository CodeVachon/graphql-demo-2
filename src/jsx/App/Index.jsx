import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from 'apollo-boost';

import Container from "./Common/Container";
import Row from "./Common/Row";
import Col from "./Common/Col";

import { defaultImage } from "@christophervachon/image-generator";

const RecordList = () => {
    const { loading, error, data } = useQuery(gql`
        {
            getAlbums {
                id
                title
                cover
                releaseDate
                artist {
                    name
                }
                label {
                    name
                }
                trackCount
                duration
            }
        }
    `);

    const defaultImageOptions = {
        fillColor: ["#eee", "#ddd", "#aaa"]
    };

    return (
        <Row>
            <Col>
                {
                    (loading)?(
                        <p>Loading...</p>
                    ):(
                        <>
                            {
                                data.getAlbums.map(album => (
                                    <div key={ `albumId-${album.id}` } className="media mb-3">
                                        <img src={ album.cover || defaultImage(album.title, defaultImageOptions) } className="mr-3 img-fluid w-25" alt={ album.title } />
                                        <div className="media-body">
                                            <h3 className="mt-0">{ album.title }</h3>
                                            <dl className="row my-0">
                                                <dt className="col-3">Artist</dt>
                                                <dd className="col-9">{ ((album.artist) ? album.artist.name : "Undefined") }</dd>
                                            </dl>
                                            <dl className="row my-0">
                                                <dt className="col-3">Label</dt>
                                                <dd className="col-9">{ ((album.label) ? album.label.name : "Undefined") }</dd>
                                            </dl>
                                            <dl className="row my-0">
                                                <dt className="col-3">Duration</dt>
                                                <dd className="col-9">{ album.duration }</dd>
                                            </dl>
                                            <dl className="row my-0">
                                                <dt className="col-3">Track Count</dt>
                                                <dd className="col-9">{ album.trackCount }</dd>
                                            </dl>
                                        </div>
                                    </div>
                                ))
                            }
                        </>
                    )
                }
            </Col>
        </Row>
    );
} // close RecordList

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
                    <Route exact path="/" component={ RecordList } />
                </Switch>
            </Container>
        </BrowserRouter>
    );
};

export default AppIndex;
