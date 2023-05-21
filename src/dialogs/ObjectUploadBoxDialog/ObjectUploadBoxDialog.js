import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LayoutContext from "../../contexts/LayoutContext";
import {useDropzone} from 'react-dropzone';
import Box from "@mui/material/Box";
import CloudUploadSvg from "../../components/UI/Svg/CloudUploadSvg";

export default function ObjectUploadBoxDialog (props) {

    //const layout = React.useContext(LayoutContext);

    const {open, onClose, prepareUpload, mountedProfile, bucketName} = props;

    const handleSelectFolders = async (e) => {

        if(e.target.files.length){

            const files = [];

            for (let i = 0; i < e.target.files.length; i++) {

                const file = e.target.files.item(i);

                files.push({
                    Path: file.path,
                    Size: file.size,
                    Key: file.webkitRelativePath,
                });
            }

            const data = await window.channel("Objects@selectFilesForUpload", files);

            prepareUpload(data);
            onClose();
        }

    }

    const handleSelectFiles = async (e) => {

        if(e.target.files.length){

            const files = [];

            for (let i = 0; i < e.target.files.length; i++) {

                const file = e.target.files.item(i);

                files.push({
                    Path: file.path,
                    Size: file.size,
                    Key: file.name,
                });
            }

            const data = await window.channel("Objects@selectFilesForUpload", files);

            prepareUpload(data);
            onClose();
        }

    }

    const getFolderFromEvent = async function (event) {

        if(event.type === "drop"){

            const files = [];

            for (let i = 0; i < event.dataTransfer.files.length; i++) {

                const file = event.dataTransfer.files.item(i);

                //if(file.type === "" && file.size === 0){
                    files.push({
                        FolderName: file.name,
                        Path: file.path,
                    });
                //}

            }

            return files;
        }

        return [];

    }

    const onDropFiles = React.useCallback(async (acceptedFiles, rejectedFiles, event) => {

        const data = await window.channel("Objects@selectFilesForUpload", acceptedFiles.map(file => {
            return {
                Path: file.path,
                Size: file.size,
                Key: file.name,
            }
        }));

        prepareUpload(data);
        onClose();

    }, []);

    const onDropFolders = React.useCallback(async (acceptedFolders, rejectedFolders, event) => {

        const data = await window.channel("Objects@selectFilesForUpload", [], acceptedFolders);

        prepareUpload(data);
        onClose();

    }, []);

    const {getRootProps: getRootPropsFiles, isDragActive: isDragActiveFiles} = useDropzone({
        onDrop: onDropFiles,
        useFsAccessApi: false,
        multiple: true,
        noClick: true
    });

    const {getRootProps: getRootPropsFolders, isDragActive: isDragActiveFolders} = useDropzone({
        onDrop: onDropFolders,
        multiple: true,
        getFilesFromEvent: event => getFolderFromEvent(event),
        noClick: true
    });

    const sx = {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'primary.light',
        borderWidth: '.125rem',
        borderStyle: 'dashed',
        borderColor: 'primary.main',
        borderRadius: '1rem',
        padding: '1rem',
        marginTop: '24px',
        color: 'primary.main',
    };

    return (
        <Dialog open={open} fullWidth>
            <DialogTitle>Uploading to {bucketName}</DialogTitle>
            <DialogContent>

                <Box sx={sx} {...getRootPropsFiles()}>
                    <CloudUploadSvg/>
                    <div style={{width: '250px'}}>
                        <Box sx={{fontSize: '24px'}}>Upload files</Box>
                        {
                            isDragActiveFiles ?
                                <Box sx={{fontSize: '16px', color: 'secondary.main'}}>Drop your files here.</Box> :
                                <Box sx={{fontSize: '16px', color: 'secondary.main'}}>Drag your files here.</Box>

                        }
                    </div>
                    <Button component="label" variant="contained">
                        Select Files
                        <input onChange={handleSelectFiles} multiple hidden type="file" />
                    </Button>
                </Box>

                <Box sx={sx} {...getRootPropsFolders()}>
                    <CloudUploadSvg/>
                    <div style={{width: '250px'}}>
                        <Box sx={{fontSize: '24px'}}>Upload folders</Box>
                        {
                            isDragActiveFolders ?
                                <Box sx={{fontSize: '16px', color: 'secondary.main'}}>Drop your folders here.</Box> :
                                <Box sx={{fontSize: '16px', color: 'secondary.main'}}>Drag your folders here.</Box>

                        }
                    </div>
                    <Button component="label" variant="contained">
                        Select a Folder
                        <input webkitdirectory="true" onChange={handleSelectFolders} hidden type="file" />
                    </Button>
                </Box>

            </DialogContent>
            <DialogActions>
                <Button color="secondary" variant="outlined" onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

}