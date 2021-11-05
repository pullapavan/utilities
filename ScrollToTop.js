import IconButton from "@material-ui/core/IconButton";
import React, { useEffect, useState } from "react";
import  ExpandLess  from '@material-ui/icons/ExpandLess';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    scrollbutton: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        background:'#444'
    }
}));


function ScrollToTop({ height = 200 }) {
    const [isVisible, setIsVisible] = useState(false);
    const classes = useStyles()

    const scroll = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > height) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <>
            {
                isVisible && <IconButton className={classes.scrollbutton} onClick={scroll} size='small' color="primary">
                    <ExpandLess></ExpandLess>
                </IconButton>
            }
        </>

    );
}

export default ScrollToTop