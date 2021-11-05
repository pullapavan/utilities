import React from 'react';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import LeftMenu from './LeftMenu'
import useLayoutStyles from '../assets/styles/layoutstyles'
import { Hidden, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Grid from '@material-ui/core/Grid';


function LayoutWrapper(props) {
    const classes = useLayoutStyles();
    const [open, setOpen] = React.useState(false);
    const [state, setState] = React.useState({
        left: false,
    });


    const handleDrawerOpen = React.useCallback(() => {
        setOpen(true);
    });

    const handleDrawerClose = React.useCallback(() => {
        setOpen(false);
    });

    const toggleDrawer = React.useCallback((anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ left: open });
    })

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <LeftMenu
                    open={open}
                    handleDrawerOpen={handleDrawerOpen}
                    handleDrawerClose={handleDrawerClose}>
                </LeftMenu>
            </Drawer>
            <main className={classes.content}>
                {
                    !open &&
                    <Hidden only={['sm', 'lg', 'md', 'xl']}>
                        <Grid container className={classes.mobilemenubar}>
                            <Grid item xs={12}>
                                <div className={classes.mobilemenubar}>
                                    <IconButton onClick={toggleDrawer('left', true)} className={classes.mobilemenuicon}>
                                        <MenuIcon />&nbsp; Platform Admin
                                    </IconButton>
                                    <Drawer anchor={'left'} open={state['left']} onClose={toggleDrawer('left', false)}>
                                        <LeftMenu
                                            open={true}
                                            mobile={true}
                                            handleDrawerClose={toggleDrawer('left', false)}>
                                        </LeftMenu>
                                    </Drawer>
                                </div>
                            </Grid>
                        </Grid>
                    </Hidden>
                }
                {props.children}
            </main>
        </div>
    );
}
export default React.memo(LayoutWrapper)