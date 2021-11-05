import React from 'react'
import ReactDOM from "react-dom";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from '@material-ui/core';
import { RedButton, RegularButton } from '../components/common/RegularButton';
import Container from './../components/common/Container';
import Item from './../components/common/Item';
import { useTheme } from '@material-ui/core/styles';
import DialogContentText from '@material-ui/core/DialogContentText';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton from '@material-ui/core/IconButton';




export default function CreatePortal({ body, title, hideCloseIcon, onClose, open, type,
    okCallBack, maxWidth, okButtonName, closeButtonName }) {

    if (!open || !body) return null

    var PortalBody = body

    if (type === 'ALERT') {
        PortalBody =
            <Container direction="column" spacing={3}>
                <Item>{body}</Item>
                <Item>
                    <RegularButton fullWidth={false}
                        onClick={okCallBack}>
                        {okButtonName || 'OK'}
                    </RegularButton>
                </Item>
            </Container>
    }

    if (type === 'CONFIRM') {
        PortalBody =
            <Container direction="column" alignItems="stretch" spacing={3}>
                <Item>{body}</Item>
                <Item>
                    <Container justify='flex-end' spacing={3}>
                        <Item>
                            <RegularButton
                                fullWidth={false}
                                onClick={okCallBack}>
                                {okButtonName || 'OK'}
                            </RegularButton>
                        </Item>
                        <Item>
                            <RedButton
                                fullWidth={false}
                                onClick={onClose}>
                                {closeButtonName || 'Cancel'}
                            </RedButton>
                        </Item>
                    </Container>
                </Item>
            </Container>
    }


    return ReactDOM.createPortal(
        <MyModal
            title={title}
            hideCloseIcon={hideCloseIcon}
            onClose={onClose}
            maxWidth={maxWidth}
            open={open}>
            {PortalBody}
        </MyModal>,
        document.querySelector("#modal-root")
    );
}


function MyModal({ title, hideCloseIcon, onClose, maxWidth, open, children }) {

    const theme = useTheme();
    const [modalOPen, setmodalOPen] = React.useState(open)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));


    return <Dialog
        fullScreen={fullScreen}
        fullWidth={Boolean(maxWidth)}
        maxWidth={Boolean(maxWidth)?maxWidth:'md'}
        open={modalOPen}
        onClose={typeof onClose === 'function' ? onClose : () => setmodalOPen(false)}
        aria-labelledby="Platform Admin"
        aria-describedby="Admin"
        disableEscapeKeyDown
        disableBackdropClick
    >
        <DialogTitle id="responsive-dialog-title">
            <Container justify="space-between">
                <Item>
                    {title || 'Platform Admin'}
                </Item>
                <Item>
                    <IconButton onClick={typeof onClose === 'function' ? onClose : () => setmodalOPen(false)} >
                        <HighlightOffIcon />
                    </IconButton>
                </Item>
            </Container>
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                {children}
            </DialogContentText>
        </DialogContent>
    </Dialog>
}