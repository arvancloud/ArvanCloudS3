import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LayoutContext from "../../contexts/LayoutContext";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";

export default function BucketCopyDialog (props) {

    const layout = React.useContext(LayoutContext);

    const {open, onClose, source, dest} = props;

    const [progress , setProgress] = React.useState({
        mainProgress: 0,
        mainTotal: null,
        mainPercent: 0,
        objectKey: null,
        objectPercent: 0
    });

    const [processing, setProcessing] = React.useState(false);

    React.useEffect(() => {

        window.ipcRenderer.on('copyBucket@progress', (event, data) => {
            setProgress(data);
        });

        window.ipcRenderer.on('copyBucket@end', (event) => {

            layout.notify("کپی صندوقچه با موفقیت انجام شد", {
                severity: "success"
            });

            setProcessing(false);

        });

        window.ipcRenderer.on('copyBucket@abort', (event) => {

            layout.notify("کپی صندوقچه متوقف شد", {
                severity: "warning"
            });

            setProcessing(false);

        });

        window.ipcRenderer.on('copyBucket@error', (event, e) => {

            console.log(e);

            layout.notify("خطا در کپی صندوقچه", {
                severity: "error"
            });

            setProcessing(false);

        });

    }, []);

    const handleCopyBucket = async () => {

        try{

            setProcessing(true);

            await window.channel("Buckets@copyBucket", source.profile, source.bucket, dest.profile, dest.bucket);

        }
        catch (e) {

            console.log(e);

            layout.notify("خطا در کپی صندوقچه", {
                severity: "error"
            });
        }

    }

    const handleCancelOperation = async () => {

        if (processing)
            window.channel("Buckets@cancelOperation");
        else
            onClose();
    };

    return (
        <Dialog open={open}>
            <DialogTitle>کپی کردن فایل های یک صندوقچه</DialogTitle>
            {
                open &&
                <DialogContent>
                    <Stack direction="row" spacing={2}>
                        <div>
                            <h3>باکت مبدا</h3>
                            <h4>{source.bucket}</h4>
                            <h4>{source.profile.title}</h4>
                        </div>
                        <div>
                            <h3>باکت مقصد</h3>
                            <h4>{dest.bucket}</h4>
                            <h4>{dest.profile.title}</h4>
                        </div>
                    </Stack>
                    <Stack spacing={2}>
                        <div>
                            <h6>{progress.mainProgress} / {progress.mainTotal}</h6>
                            <h5>{progress.mainPercent}%</h5>
                            <LinearProgress variant="determinate" value={progress.mainPercent} />
                        </div>
                        <div>
                            <h6>{progress.objectKey}</h6>
                            <h5>{progress.objectPercent}%</h5>
                            <LinearProgress variant="determinate" value={progress.objectPercent} />
                        </div>
                    </Stack>
                </DialogContent>
            }
            <DialogActions>
                <Button variant="outlined" onClick={handleCancelOperation}>{processing ? "توقف" : "انصراف"}</Button>
                <Button variant="contained" disabled={processing} onClick={handleCopyBucket}>کپی شود</Button>
            </DialogActions>
        </Dialog>
    );

}