import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LayoutContext from "../../contexts/LayoutContext";

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
                    access_key: "مقدار وارد شده نامعتبر است"
                })
            }
            else if(e.code === "ERR_INVALID_URL"){
                setValidationError({
                    endpoint_url: "مقدار وارد شده نامعتبر است"
                })
            }
            else if(e.Code === "SignatureDoesNotMatch"){
                setValidationError({
                    secret_key: "مقدار وارد شده اشتباه است"
                })
            }
            else{
                layout.notify("خطا در ذخیره کردن پروفایل", {
                    severity: "error"
                });
            }


        }

    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{profile.id ? 'ویرایش' : 'افزودن'} پروفایل</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="profile-title"
                    label="عنوان پروفایل"
                    type="text"
                    fullWidth
                    name="title"
                    value={inputField.title}
                    onChange={handleInputs}
                />
                <TextField
                    margin="dense"
                    id="profile-provider"
                    label="پرووایدر"
                    select
                    fullWidth
                    name="provider"
                    value={inputField.provider ? inputField.provider : "arvan"}
                    onChange={handleInputs}
                >
                    <MenuItem value="arvan">ابرآروان</MenuItem>
                    <MenuItem value="other">سایر</MenuItem>
                </TextField>
                {
                    inputField.provider === "other" ?
                        <TextField
                            autoFocus
                            error={!!validationError.endpoint_url}
                            margin="dense"
                            id="profile-endpoint-url"
                            label="Endpoint URL"
                            type="text"
                            fullWidth
                            name="endpoint_url"
                            helperText={validationError.endpoint_url}
                            value={inputField.endpoint_url}
                            onChange={handleInputs}
                        /> :
                        null
                }

                <TextField
                    autoFocus
                    error={!!validationError.access_key}
                    margin="dense"
                    id="profile-access-key"
                    label="Access Key"
                    type="text"
                    fullWidth
                    name="access_key"
                    helperText={validationError.access_key}
                    value={inputField.access_key}
                    onChange={handleInputs}
                />
                <TextField
                    autoFocus
                    error={!!validationError.secret_key}
                    margin="dense"
                    id="profile-secret-key"
                    label="Secret Key"
                    type="text"
                    fullWidth
                    name="secret_key"
                    helperText={validationError.secret_key}
                    value={inputField.secret_key}
                    onChange={handleInputs}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>انصراف</Button>
                <Button
                    variant="contained"
                    disabled={
                        !inputField.secret_key ||
                        !inputField.access_key ||
                        !inputField.title ||
                        (!inputField.endpoint_url && inputField.provider === "other")
                    }
                    onClick={handleSaveProfile}
                >ذخیره</Button>
            </DialogActions>
        </Dialog>
    );

}

export default ProfileDialog;