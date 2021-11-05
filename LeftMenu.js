import React, { useState, useEffect } from 'react'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import { leftMenuitems } from '../data/leftmenu/leftmenuitems'
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import { useHistory } from "react-router-dom"
import { RedButton } from '../components/common/RegularButton';
import AdminAgentInfo from './AdminAgentInfo';
import { Divider } from '@material-ui/core';
import clsx from 'clsx'
import useLeftmenuStyles from '../assets/styles/leftmenustyles';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { useAgent } from './../hooks/useAgent';


var keyCount = 0;

function LeftMenu(props) {

    const { logout } = useAgent()
    const classes = useLeftmenuStyles()
    const [activeItem, setActiveItem] = useState('')
    const { isAuthorised } = useAgent()

    return (
        <>
            <div className={classes.agentsection}>
                <AdminAgentInfo  {...props}></AdminAgentInfo>
            </div>
            <Divider />
            <div>
                <List>
                    {
                        leftMenuitems.map((item, index) => (
                            <PrintMenu
                                {...item}
                                isAuthorised={isAuthorised}
                                key={keyCount++}
                                activeItem={activeItem}
                                setActiveItem={setActiveItem}
                            >
                            </PrintMenu>
                        ))
                    }
                    <ListItem button key={keyCount++} onClick={logout}>
                        <ListItemIcon>
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <RedButton fullWidth={true} >Logout</RedButton>
                    </ListItem>
                </List>
            </div>
        </>
    )
}

export default React.memo(LeftMenu)

function PrintMenu(props) {

    if (!props.subMenu) {
        return <SingleItem {...props} />
    }

    return <NestedItem {...props} />
}


const SingleItem = React.memo(({ Icon, name, path, subMenu, privileges, ...props }) => {
    const history = useHistory()
    const classes = useLeftmenuStyles()

    React.useEffect(() => {
        let isCancelled = false;

        if (!isCancelled) {
            const matched = history.location.pathname.includes(path)
            matched && props.setActiveItem(name)
        }

        return () => { isCancelled = true }
    }, [])

    const redirect = (path) => {
        props.setActiveItem(name)
        history.push(path)
    }

    if (!props.isAuthorised(privileges)) {
        return null
    }

    return <ListItem button key={keyCount++} onClick={() => redirect(path)}
        className={clsx({
            [classes.nested]: props.nested === "Y",
            [classes.activeItem]: props.activeItem === name
        })}>
        <ListItemIcon>
            <Icon className={clsx({
                [classes.activeItem]: props.activeItem === name
            })}></Icon>
        </ListItemIcon>
        <ListItemText primary={name} />
    </ListItem>
})

const NestedItem = React.memo(({ Icon, name, path, subMenu, privileges, ...props }) => {

    //TO Auto open Tab on page load it any of its menu items is Active...
    const checkForActiveItem = (subMenu) => {
        if (!subMenu) return false

        return subMenu.some(item => {
            if (props.activeItem === item.name) {
                return true
            }

            if (item.subMenu) {
                return checkForActiveItem(item.subMenu)
            }
        });
    }

    const [isOpen, setIsOpen] = useState(checkForActiveItem(subMenu))
    const classes = useLeftmenuStyles()

    if (!props.isAuthorised(privileges)) {
        return null;
    }

    return <>
        <ListItem key={keyCount++}
            button onClick={() => setIsOpen(!isOpen)}
            className={clsx({
                [classes.nested]: subMenu && !props.maintab
            })}>
            <ListItemIcon>
                <Icon />
            </ListItemIcon>
            <ListItemText primary={name} />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isOpen} timeout='auto' key={keyCount++} unmountOnExit={false}>
            <List component="div" disablePadding className={classes.sublist}>
                {
                    subMenu.map((submenu, index) => {

                        return <PrintMenu
                            key={keyCount++}
                            {...submenu}
                            nested="Y"
                            isAuthorised={props.isAuthorised}
                            activeItem={props.activeItem}
                            setActiveItem={props.setActiveItem}
                        ></PrintMenu>
                    })
                }
            </List>
        </Collapse>
    </>
})
