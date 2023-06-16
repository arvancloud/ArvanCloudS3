import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import LayoutContext from "../../contexts/LayoutContext";
import TextField from "../../components/TextField/TextField";
import { Alert, Link } from '@mui/material';

function ProfileDialog(props) {

    const {profile, open, onClose} = props;

    const layout = React.useContext(LayoutContext);

    const [inputField , setInputField] = React.useState({...profile});
    const [validationError , setValidationError] = React.useState({
        endpoint_url: "",
        access_key: "",
        secret_key: ""
    });

    React.useEffect(() => {
        setInputField(profile);
        setValidationError({
            endpoint_url: "",
            access_key: "",
            secret_key: ""
        });
    }, [profile]);

    const handleInputs = (e) => {

        setInputField( {...inputField, [e.target.name]: e.target.value} );

    };

    const handleSaveProfile = async () => {

        try {
            await window.channel("Profiles@saveProfile", inputField);
            onClose();
        }
        catch (e) {

            console.log(e);

            if(e.Code === "InvalidAccessKeyId"){
                setValidationError({
                    access_key: "The value is invalid"
                })
            }
            else if(e.code === "ERR_INVALID_URL"){
                setValidationError({
                    endpoint_url: "The value is invalid"
                })
            }
            else if(e.Code === "SignatureDoesNotMatch"){
                setValidationError({
                    secret_key: "The value is incorrect"
                })
            }
            else{
                layout.notify("Error in save profile", {
                    severity: "error"
                });
            }


        }

    }

    return (
        <Dialog open={open} onClose={onClose}>
            {/* <DialogTitle>{profile.id ? 'Edit' : 'Add'} profile</DialogTitle> */}
            <DialogTitle>Setup</DialogTitle>
            <Alert severity="info">
                If you're not sure about your credentials please visit <Link href="https://panel.arvancloud.ir/storage/access-management" target="_blank" underline="hover">Access Management</Link>.
            </Alert>
            <DialogContent>
                <TextField
                    autoFocus
                    size="small"
                    id="profile-title"
                    label="Name"
                    type="text"
                    fullWidth
                    name="title"
                    value={inputField.title}
                    onChange={handleInputs}
                />
                <TextField
                    size="small"
                    id="profile-provider"
                    label="Account Type"
                    select
                    fullWidth
                    name="provider"
                    value={inputField.provider ? inputField.provider : "arvan"}
                    onChange={handleInputs}
                >
                    <MenuItem value="arvan">Arvan Cloud</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </TextField>
                {
                    inputField.provider === "other" ?
                        <TextField
                            error={!!validationError.endpoint_url}
                            size="small"
                            id="profile-endpoint-url"
                            label="Endpoint URL"
                            type="text"
                            fullWidth
                            name="endpoint_url"
                            helperText={validationError.endpoint_url}
                            value={inputField.endpoint_url}
                            onChange={handleInputs}
                        /> :
                        <TextField
                            size="small"
                            id="profile-endpoint-url"
                            label="Region"
                            select
                            fullWidth
                            name="endpoint_url"
                            value={inputField.endpoint_url}
                            onChange={handleInputs}
                        >
                            <MenuItem value="https://s3.ir-thr-at1.arvanstorage.ir">Simin (s3.ir-thr-at1.arvanstorage.ir)</MenuItem>
                            <MenuItem value="https://s3.ir-tbz-sh1.arvanstorage.ir">Shariar (s3.ir-tbz-sh1.arvanstorage.ir)</MenuItem>
                        </TextField>
                }

                <TextField
                    size="small"
                    error={!!validationError.access_key}
                    id="profile-access-key"
                    label="Access Key ID"
                    type="text"
                    fullWidth
                    name="access_key"
                    helperText={validationError.access_key}
                    value={inputField.access_key}
                    onChange={handleInputs}
                />
                <TextField
                    error={!!validationError.secret_key}
                    size="small"
                    id="profile-secret-key"
                    label="Secret Access Key"
                    type="text"
                    fullWidth
                    name="secret_key"
                    helperText={validationError.secret_key}
                    value={inputField.secret_key}
                    onChange={handleInputs}
                />
            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant="outlined" onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={
                        !inputField.secret_key ||
                        !inputField.access_key ||
                        !inputField.title ||
                        (!inputField.endpoint_url && inputField.provider === "other")
                    }
                    onClick={handleSaveProfile}
                >Add</Button>
            </DialogActions>
        </Dialog>
    );

}

export default ProfileDialog;