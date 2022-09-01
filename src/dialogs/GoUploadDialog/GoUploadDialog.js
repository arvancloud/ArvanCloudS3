import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LayoutContext from "../../contexts/LayoutContext";
import Stack from "@mui/material/Stack";
import Switch from "../../components/Switch/Switch";
import ProgressBar from "../../components/ProgressBar/ProgressBar";

export default function GoUploadDialog (props) {

    const layout = React.useContext(LayoutContext);

    const {open, onClose, mountedProfile, bucketName, onFinish, objectsData} = props;

    const [progress , setProgress] = React.useState({
        mainProgress: 0,
        mainTotal: objectsData.count ? objectsData.count : 0,
        mainPercent: 0,
        objectKey: objectsData.first ? objectsData.first.Key : null,
        objectPercent: 0
    });

    console.log(progress);

    const [processing, setProcessing] = React.useState(false);
    const [finish, setFinish] = React.useState(false);

    const [isPublic, setIsPublic] = React.useState(false);

    React.useEffect(() => {

        setProcessing(false);
        setFinish(false);
        setIsPublic(false);
        setProgress({
            mainProgress: 0,
            mainTotal: objectsData.count ? objectsData.count : 0,
            mainPercent: 0,
            objectKey: objectsData.first ? objectsData.first.Key : null,
            objectPercent: 0
        });

    }, [open]);

    React.useEffect(() => {

        window.ipcRenderer.on('uploadFiles@progress', (event, data) => {
            setProgress(data);
        });

        window.ipcRenderer.on('uploadFiles@end', (event) => {

            layout.notify("بارگذاری فایل ها با موفقیت انجام شد", {
                severity: "success"
            });

            setProcessing(false);
            setFinish(true);

        });

        window.ipcRenderer.on('uploadFiles@abort', (event) => {

            layout.notify("بارگذاری فایل ها متوقف شد", {
                severity: "warning"
            });

            setProcessing(false);

        });

        window.ipcRenderer.on('uploadFiles@error', (event, e) => {

            console.log(e);

            layout.notify("خطا در بارگذاری فایل ها", {
                severity: "error"
            });

            setProcessing(false);

        });

    }, []);

    const handleChangeAcl = (e) => {

        setIsPublic(e.target.checked);

    }

    const handleUploadObjects = async () => {

        if(finish){
            onFinish();
            onClose();
        }
        else{

            try{

                setProcessing(true);

                await window.channel("Objects@startUploadFiles", mountedProfile, bucketName, isPublic);

            }
            catch (e) {

                console.log(e);

                layout.notify("خطا در بارگذاری فایل ها", {
                    severity: "error"
                });
            }
        }

    }

    const handleCancelOperation = async () => {

        if (processing)
            window.channel("Buckets@cancelOperation");
        else{
            await window.channel("Objects@selectFilesForUpload", []);
            onClose();
        }

    };

    return (
        <Dialog open={open} fullWidth>
            <DialogTitle>بارگذاری فایل در صندوقچه {bucketName}</DialogTitle>
            {
                open &&
                <DialogContent>
                    <Stack spacing={2} style={{fontSize: '14px'}}>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                            <span>تعداد فایل</span>
                            <span>{ objectsData.count }</span>
                        </Stack>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                            <span>دسترسی نمایش عمومی</span>
                            <Switch
                                id="objects-acl"
                                name="ACL"
                                disabled={processing}
                                checked={isPublic}
                                value={isPublic}
                                onChange={handleChangeAcl}
                            />
                        </Stack>

                        <ProgressBar percent={progress.mainPercent}>
                            <span>{progress.mainProgress} از {progress.mainTotal}</span>
                        </ProgressBar>

                        <ProgressBar percent={progress.objectPercent}>
                            <span style={{direction: "ltr"}}>{progress.objectKey}</span>
                        </ProgressBar>

                    </Stack>

                </DialogContent>
            }
            <DialogActions>
                <Button color="secondary" variant="outlined" disabled={finish} onClick={handleCancelOperation}>{processing ? "توقف" : "انصراف"}</Button>
                <Button variant="contained" disabled={processing} onClick={handleUploadObjects}>{finish ? "پایان" : "بارگذاری"}</Button>
            </DialogActions>
        </Dialog>
    );

}