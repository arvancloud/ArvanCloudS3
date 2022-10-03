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

    const operationName = isSync ? "Syncing" : "Copying";

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

            layout.notify(`${operationName} bucket done`, {
                severity: "success"
            });

            setProcessing(false);
            setIsFinish(true);

        });

        window.ipcRenderer.on('copyBucket@abort', (event) => {

            layout.notify(`${operationName} bucket stopped`, {
                severity: "warning"
            });

            setProcessing(false);

        });

        window.ipcRenderer.on('copyBucket@error', (event, e) => {

            console.log(e);

            layout.notify(`Error in ${operationName} the bucket `, {
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

                layout.notify(`Error in ${operationName} the bucket `, {
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
            <DialogTitle>{operationName} files of a bucket</DialogTitle>
            {
                open &&
                <DialogContent>
                    <Stack direction="row" spacing={2} justifyContent="space-between" style={{textAlign: "center"}}>
                        <div>
                            <span style={{color: '#7a90aa'}}>Source bucket</span>
                            <h2 style={{color: '#00baba'}}>{source.bucket}</h2>
                            <h5 style={{color: '#bbb'}}>{source.profile.title}</h5>
                        </div>
                        <div>
                            <span style={{color: '#7a90aa'}}>Destination bucket</span>
                            <h2 style={{color: '#00baba'}}>{dest.bucket}</h2>
                            <h5 style={{color: '#bbb'}}>{dest.profile.title}</h5>
                        </div>
                    </Stack>
                    <Stack spacing={2} style={{marginTop: '2rem'}}>
                        <ProgressBar percent={progress.mainPercent}>
                            <span>{progress.mainProgress} from {progress.mainTotal}</span>
                        </ProgressBar>

                        <ProgressBar percent={progress.objectPercent}>
                            <span style={{direction: "ltr"}}>{progress.objectKey}</span>
                        </ProgressBar>
                    </Stack>
                </DialogContent>
            }
            <DialogActions>
                <Button color="secondary" variant="outlined" disabled={isFinish} onClick={handleCancelOperation}>{processing ? "Stop" : "Cancel"}</Button>
                <Button variant="contained"  disabled={processing} onClick={handleCopyBucket}>{isFinish ? "End" : (isSync ? "Sync" : "Copy")}</Button>
            </DialogActions>
        </Dialog>
    );

}