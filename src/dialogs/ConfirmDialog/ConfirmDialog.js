import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

function ConfirmDialog(props) {

    const {open, onClose, action} = props;

    const {content, title, onConfirm} = action;

    const handleConfirm = async () => {
        onClose();
        onConfirm();
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{action.title}</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button color={"secondary"} variant="outlined" onClick={onClose}>Cancel</Button>
                <Button color={"error"} variant="contained" onClick={handleConfirm}>{title}</Button>
            </DialogActions>
        </Dialog>
    );

}

export default ConfirmDialog;