import { client } from '../globals/apolloclient';
import { useHistory } from 'react-router-dom';
import { initiateBackgroundTokenRefresh } from '../services/utils';
import { useReactiveVar } from '@apollo/client';
import { agentVar } from './../data/gql/vars';
import { isJwtValid } from './../services/utils';

export const useAgent = () => {

    const history = useHistory()
    const loggedInFlag = useReactiveVar(agentVar);

    const isLoggedIn = () => {
        const unParsedAgent = localStorage.getItem("agent")
        if (!unParsedAgent) {
            agentVar(false)
            return
        }
        return true
    }

    const getAgent = () => {
        const unParsedAgent = localStorage.getItem("agent")
        if (!unParsedAgent)
            return

        return JSON.parse(unParsedAgent)
    }

    const isAuthorised = (requiredPrivileges = []) => {

        return true

        if (requiredPrivileges.length === 0) return true

        const agent = getAgent()

        if (!agent || !agent.privileges || agent.privileges.length === 0) return false

        return requiredPrivileges.some(tabrole => {
            return agent.privileges.includes(tabrole)
        });
    }

    const saveInStorage = (data, jwt) => {
        if (jwt) localStorage.setItem("jwt", jwt)
        if (data) localStorage.setItem("agent", JSON.stringify(data))
        if (jwt) initiateBackgroundTokenRefresh(jwt)
        agentVar(true)
    }

    const clearStorage = () => {
        localStorage.removeItem("jwt")
        localStorage.removeItem("agent")
        agentVar(false)
        client.resetStore()
    }

    const logout = () => {
        clearStorage()
        // document.location.href = "/"
    }

    const onAppReload = () => {
        const jwt = localStorage.getItem("jwt")
        if (jwt && !isJwtValid(jwt)) {
            logout()
            return
        }
        initiateBackgroundTokenRefresh(jwt)
    }

    const updateAgent = (agent) => {
        if (!agent)
            return

        localStorage.setItem("agent", JSON.stringify(agent))
    }

    return {
        isAuthorised, logout, saveInStorage,
        isLoggedIn, getAgent,
        onAppReload, clearStorage, updateAgent,
        loggedInFlag
    }
}