import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "../../components/TextField/TextField";
import Switch from "../../components/Switch/Switch";
import LayoutContext from "../../contexts/LayoutContext";

export default function BucketCreateDialog (props) {

    const layout = React.useContext(LayoutContext);

    const {open, onClose, afterCreate, mountedProfile} = props;

    const [inputField , setInputField] = React.useState({
        Name: "",
        ACL: true
    });

    const [validationError , setValidationError] = React.useState({
        Name: ""
    });

    const inputsHandler = (e) => {
        if(e.target.name === "ACL"){
            setInputField( {...inputField, ACL: e.target.checked} )
        }
        else{

            setValidationError({
                Name: ""
            })

            setInputField( {...inputField, [e.target.name]: e.target.value} )
        }

    };

    const handleCreateBucket = async () => {

        let ACL = inputField.ACL ? 'public-read' : 'private';

        try{

            await window.channel("Buckets@createBucket", mountedProfile, inputField.Name, ACL);

            setInputField({
                Name: "",
                ACL: true
            });
            onClose();
            afterCreate();
        }
        catch (err) {

            console.log(err);

            if(err.Code === "InvalidBucketName"){
                setValidationError({
                    Name: "نام صندوقچه نا معتبر است"
                })
            }
            else if(err.Code === "ExistBucket"){
                setValidationError({
                    Name: "صندوقچه ای با این نام وجود دارد"
                })
            }
            else{
                layout.notify("خطا در ایجاد صندوقچه", {
                    severity: "error"
                });
            }

        }

    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>ایجاد صندوقچه جدید</DialogTitle>
            <DialogContent>
                <TextField
                    error={!!validationError.Name}
                    autoFocus
                    fullWidth
                    id="bucket-name"
                    label="نام صندوقچه"
                    type="text"
                    placeholder="این نام باید در کل سیستم یکتا باشد"
                    name="Name"
                    helperText={validationError.Name}
                    value={inputField.Name}
                    onChange={inputsHandler}
                    size="small"
                />

                <span>دسترسی نمایش عمومی</span>
                <Switch
                    id="bucket-acl"
                    name="ACL"
                    checked={inputField.ACL}
                    value={inputField.ACL}
                    onChange={inputsHandler}
                />
            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant="outlined" onClick={onClose}>انصراف</Button>
                <Button variant="contained"  onClick={handleCreateBucket}>ایجاد</Button>
            </DialogActions>
        </Dialog>
    );

}