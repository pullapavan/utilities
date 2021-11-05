import React from 'react'
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Container from './../components/common/Container';
import Item from './../components/common/Item';
import Avatar from '@material-ui/core/Avatar';



export default function AdminAgentInfo({ open, handleDrawerOpen, handleDrawerClose }) {


    if (!open) {
        return <IconButton onClick={handleDrawerOpen}>
            <MenuIcon />
        </IconButton>
    }

    return (
        <>
            <Container justify="space-between" alignItems="center">
                <Item>
                    <Avatar alt="PlatformAdmin" src="/assets/images/agent.jpg" />
                </Item>
                <Item>
                    <h2>Welcome</h2>
                </Item>
                <Item>
                    <IconButton onClick={handleDrawerClose} >
                        <ChevronLeftIcon />
                    </IconButton>
                </Item>
            </Container>
        </>
    )
}
