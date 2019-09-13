import React from "react";

const Card = ({ title, children }) => {
    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="my-0">{ title }</h5>
            </div>
            { children }
        </div>
    );
}; // close Card

export default Card;
