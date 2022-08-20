import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LayoutContext from "../../contexts/LayoutContext";
import {useDropzone} from 'react-dropzone';

export default function ObjectUploadBoxDialog (props) {

    const layout = React.useContext(LayoutContext);

    const {open, onClose, afterUpload, mountedProfile, bucketName} = props;

    const handleSelectFiles = async (e) => {

        console.log("length");
        console.log(e);
        console.log(e.target.files.length);

        // const sss = window.channel("Windows@dialog");
        // console.log(sss);

    }

    const onDrop = React.useCallback(async (acceptedFiles) => {
        // Do something with the files
        console.log(acceptedFiles);

        let data = await window.channel("Objects@uploadFiles", mountedProfile, bucketName, acceptedFiles.map(file => {
            return {
                path: file.path,
                size: file.size
            }
        }));
        console.log(data);
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <Dialog open={open}>
            <DialogTitle>آپلود فایل در صندوقچه {bucketName}</DialogTitle>
            <DialogContent>
                <Button variant="contained" component="label">
                    Upload
                    <input onChange={handleSelectFiles} hidden multiple type="file" />
                </Button>
                <Button variant="contained" component="label">
                    Upload Folder
                    <input webkitdirectory="true" onChange={handleSelectFiles} hidden type="file" />
                </Button>
                <div style={{border: "1px solid #a0a"}} {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag 'n' drop some files here, or click to select files</p>
                    }
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>انصراف</Button>
            </DialogActions>
        </Dialog>
    );

}