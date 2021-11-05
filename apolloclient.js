import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
    ApolloLink,
} from "@apollo/client";
import { onError } from 'apollo-link-error'

import { playerPolicies } from '../pages/player/gql/typePolicy';
import { agentVar } from './../data/gql/vars';

const cache = new InMemoryCache({
    typePolicies: {
        ...playerPolicies.typeNamePolicies,
        Query: {
            fields: {
                agent: {
                    read() {
                        return agentVar();
                    }
                },
                ...playerPolicies.queryPolicies
            }
        }
    }
});

const httpLink = new HttpLink(
    {
        uri: process.env.REACT_APP_GRAPHQL_SERVER
    }
);

const authLink = new ApolloLink((operation, forward) => {

    const jwt = localStorage.getItem("jwt");

    if (jwt) {
        operation.setContext(({ headers = {} }) => ({
            headers: {
                ...headers,
                authorization: `Bearer ${jwt}`,
            }
        }));
    }

    return forward(operation);
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        for (let err of graphQLErrors) {
            switch (err.extensions.code) {
                case 'UNAUTHENTICATED':
                    localStorage.removeItem("agent")
                    localStorage.removeItem("jwt")
                    return
            }
        }
    }
    if (networkError) {
        console.log(networkError.statusCode)
        if (networkError.statusCode == 401) {
            localStorage.removeItem("agent")
            localStorage.removeItem("jwt")
            document.location.href = "/"
        }
    }
});


export const client = new ApolloClient({
    link: from([authLink, errorLink, httpLink]),
    // link: from([httpLink]),
    cache
});



const loadAgent = async () => {
    var agent = localStorage.getItem("agent")
    var jwt = localStorage.getItem("jwt")
    if (agent && jwt) {
         agentVar(true)
    }
}

loadAgent()





