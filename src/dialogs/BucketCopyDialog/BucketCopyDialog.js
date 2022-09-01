import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LayoutContext from "../../contexts/LayoutContext";
import Stack from "@mui/material/Stack";
import ProgressBar from "../../components/ProgressBar/ProgressBar";

export default function BucketCopyDialog (props) {

    const layout = React.useContext(LayoutContext);

    const {open, onClose, source, dest, isSync} = props;

    const operationName = isSync ? "سینک" : "کپی";

    const [progress , setProgress] = React.useState({
        mainProgress: 0,
        mainTotal: "∞",
        mainPercent: 0,
        objectKey: null,
        objectPercent: 0
    });

    const [processing, setProcessing] = React.useState(false);

    const [isFinish, setIsFinish] = React.useState(false);

    React.useEffect(() => {

        setProcessing(false);
        setIsFinish(false);
        setProgress({
            mainProgress: 0,
            mainTotal: "∞",
            mainPercent: 0,
            objectKey: null,
            objectPercent: 0
        });

        window.ipcRenderer.on('copyBucket@progress', (event, data) => {
            setProgress(data);
        });

        window.ipcRenderer.on('copyBucket@end', (event) => {

            layout.notify(`${operationName} صندوقچه با موفقیت انجام شد`, {
                severity: "success"
            });

            setProcessing(false);
            setIsFinish(true);

        });

        window.ipcRenderer.on('copyBucket@abort', (event) => {

            layout.notify(`${operationName} صندوقچه متوقف شد`, {
                severity: "warning"
            });

            setProcessing(false);

        });

        window.ipcRenderer.on('copyBucket@error', (event, e) => {

            console.log(e);

            layout.notify(`خطا در ${operationName} صندوقچه `, {
                severity: "error"
            });

            setProcessing(false);

        });

    }, [open]);

    const handleCopyBucket = async () => {

        if(isFinish){
            onClose();
        }
        else{

            try{

                setProcessing(true);

                await window.channel(isSync ? "Buckets@syncBucket" : "Buckets@copyBucket" , source.profile, source.bucket, dest.profile, dest.bucket);

            }
            catch (e) {

                console.log(e);

                layout.notify(`خطا در ${operationName} صندوقچه `, {
                    severity: "error"
                });
            }

        }
    }

    const handleCancelOperation = async () => {

        if (processing)
            window.channel("Buckets@cancelOperation");
        else
            onClose();
    };

    return (
        <Dialog open={open} fullWidth>
            <DialogTitle>{operationName} کردن فایل های یک صندوقچه</DialogTitle>
            {
                open &&
                <DialogContent>
                    <Stack direction="row" spacing={2}>
                        <div>
                            <h3>صندوقچه مبدا</h3>
                            <h4>{source.bucket}</h4>
                            <h4>{source.profile.title}</h4>
                        </div>
                        <div>
                            <h3>صندوقچه مقصد</h3>
                            <h4>{dest.bucket}</h4>
                            <h4>{dest.profile.title}</h4>
                        </div>
                    </Stack>
                    <Stack spacing={2}>
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
                <Button color="secondary" variant="outlined" disabled={isFinish} onClick={handleCancelOperation}>{processing ? "توقف" : "انصراف"}</Button>
                <Button variant="contained"  disabled={processing} onClick={handleCopyBucket}>{isFinish ? "پایان" : (isSync ? "سینک شود" : "کپی شود")}</Button>
            </DialogActions>
        </Dialog>
    );

}