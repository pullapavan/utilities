import React, { useContext, useState, useEffect } from 'react'
import { LOGIN_API, REFRESH_TOKEN } from '../data/constants/apiendpoints'
import SignIn from '../pages/signin/Signin';
import { get } from '../services/httpUtiliy'
import { validateJwt } from '../services/utils'
import { client } from './apolloclient'
import { ApolloProvider } from "@apollo/client";

const AppContext = React.createContext()

export function useApp() {
    return useContext(AppContext)
}

export function ContextProvider({ children }) {

    const [currentUser, setcurrentUser] = useState()
    const [agent, setAgent] = useState()
    const [timerInstance, setTimerInstance] = useState()

    function isAuthorised(requiredRoles = []) {
        if (requiredRoles.length === 0) return true

        if (!agent.privileges || agent.privileges.length === 0) return false

        return requiredRoles.some(tabrole => {
            return agent.privileges.includes(tabrole)
        });
    }

    const refreshToken = async () => {
        if (!localStorage.getItem("jwt")) return

        try {
            var response = await get(REFRESH_TOKEN)
            if (response.data) {
                localStorage.setItem("jwt", response.data)
                initTimer(response.data)
            }
        } catch (error) {
            console.error('Failed to get refresh Token')
        }
    }

    const initTimer = (jwt) => {

        if (!jwt) return

        validateJwt(jwt).then((decoded) => {
            const expires_in = (decoded.exp * 1000) - new Date().getTime() // Expires in milliseconds
            const timeout = (expires_in) - (5 * 60 * 1000)  //trigger refresh five min before expiry...
            if (expires_in > 0 && timeout > 0) {

                if (timerInstance)
                    setTimerInstance(clearTimeout(timerInstance))

                setTimerInstance(
                    setTimeout(() => {
                        refreshToken(); // this would reset localStorage before token expiry time
                    }, timeout)
                );
            }
        }).catch(console.error)
    }

    async function login(agentName, password) {


        const promisecallback = async (resolve, reject) => {
            try {

                // var response = await post(LOGIN_API, { name: agentName, password: password })
                const response = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({
                            status: 200,
                            data: {
                                agent: {
                                    name: 'admin'
                                },
                                jwt: "dsdf"
                            }
                        })
                    }, 2000)
                })
                console.log(response)

                if (response.status !== 200) reject(response)

                const { jwt, agent } = response.data
                if (agent && agent.name && jwt) {

                    localStorage.setItem("agent", JSON.stringify(agent))
                    localStorage.setItem("jwt", jwt)
                    setAgent(agent)
                    setcurrentUser(agent.name)
                    initTimer(jwt)

                    return resolve(response)
                }

                throw new Error()

            } catch (error) {
                reject({
                    status: 'FAILED'
                })
            }
        }

        return new Promise(promisecallback)
    }


    function logout() {
        localStorage.removeItem("agent")
        localStorage.removeItem("jwt")
        setAgent(null)
        setcurrentUser(null)
        client.resetStore()
    }

    useEffect(() => {
        const reloadAgentInfo = () => {
            const agentFromStorage = JSON.parse(localStorage.getItem("agent"))
            const jwt = localStorage.getItem("jwt")

            if (!agentFromStorage || !agentFromStorage.name || !jwt) {
                return logout()
            }

            if (agent && agent.name) {
                setAgent(agent)
                setcurrentUser(agent.name)
                localStorage.setItem("agent", JSON.stringify(agent))
            } else {
                setAgent(agentFromStorage)
                setcurrentUser(agentFromStorage.name)
                initTimer(jwt)
            }
        }
        reloadAgentInfo()

        return () => {
            clearTimeout(timerInstance)
        }

    }, [currentUser, agent])

    const value = { currentUser, login, logout, isAuthorised }

    return (
        // <AppContext.Provider value={value}>
        //     <ApolloProvider client={client}>
        //         {currentUser ? children : <SignIn></SignIn>}
        //     </ApolloProvider>
        // </AppContext.Provider>
        <></>
    )
}
