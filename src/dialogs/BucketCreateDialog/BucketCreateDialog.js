import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "../../components/TextField/TextField";
import Switch from "../../components/Switch/Switch";
import LayoutContext from "../../contexts/LayoutContext";
import Stack from "@mui/material/Stack";

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
                    Name: "Invalid bucket name"
                })
            }
            else if(err.Code === "ExistBucket"){
                setValidationError({
                    Name: "Bucket with this name already exists"
                })
            }
            else{
                layout.notify("Error in creating the bucket", {
                    severity: "error"
                });
            }

        }

    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Create a Bucket</DialogTitle>
            <DialogContent>
                <Stack spacing={2} style={{fontSize: '14px'}}>
                    <TextField
                        error={!!validationError.Name}
                        autoFocus
                        fullWidth
                        id="bucket-name"
                        label="Name"
                        type="text"
                        placeholder="Name should be unique"
                        name="Name"
                        helperText={validationError.Name}
                        value={inputField.Name}
                        onChange={inputsHandler}
                        size="small"
                    />
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                        <span>Public Access</span>
                        <Switch
                            id="bucket-acl"
                            name="ACL"
                            checked={inputField.ACL}
                            value={inputField.ACL}
                            onChange={inputsHandler}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant="outlined" onClick={onClose}>Cancel</Button>
                <Button variant="contained"  onClick={handleCreateBucket}>Create</Button>
            </DialogActions>
        </Dialog>
    );

}