import React from "react";
import { Link, withRouter } from "react-router-dom";


const Breadcrumb = withRouter(({ location }) => {
    const atRoot = (location.pathname === "/");

    return (
        <ul className="breadcrumb">
            <li className={ "breadcrumb-item" + ((atRoot)?(" active"):(""))}>
                <Link to="/">Home</Link>
            </li>
            {
                (!atRoot)?(
                    (new RegExp("/(tag|author|genra)/").test(location.pathname))?(
                        <li className={ "breadcrumb-item" + ((!atRoot)?(" active"):(""))}>
                            Filtered Book List
                        </li>
                    ):(
                        <li className={ "breadcrumb-item" + ((!atRoot)?(" active"):(""))}>
                            Book Details
                        </li>
                    )
                ):(null)
            }
        </ul>
    );
}); // close Breadcrumb

export default Breadcrumb;
