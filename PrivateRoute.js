import React from 'react'
import { Route } from "react-router-dom"
import { useAgent } from '../../hooks/useAgent';
import { agentVar } from './../../data/gql/vars';


export default function PrivateRoute({ component: Component, requiredRoles = [], ...rest }) {
    const { isAuthorised, isLoggedIn } = useAgent()

    agentVar(isLoggedIn())

    if (!isAuthorised(requiredRoles)) {
        return <Route {...rest}
            render={() => {
                return <div>Unauthorised Access</div>
            }}
        >
        </Route>
    }

    return (
        <Route
            {...rest}
            render={props => {
                return <Component {...props} />
            }}
        >
        </Route>
    )
}
