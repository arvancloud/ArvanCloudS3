import logo from './logo.svg';
import './App.css';

import React from "react";
import {MemoryRouter, Routes, Route} from "react-router-dom";
import BucketsList from './sections/BucketsList/BucketsList';
import ObjectsList from "./sections/ObjectsList/ObjectsList";
import ProfilesList from "./sections/ProfilesList/ProfilesList";
import LayoutContext  from './contexts/LayoutContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BucketFinderDialog from "./dialogs/BucketFinderDialog/BucketFinderDialog";
import Container from "@mui/material/Container";
import ConfirmDialog from "./dialogs/ConfirmDialog/ConfirmDialog";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

function App(){

    const [snackbar , setSnackbar] = React.useState({
        open: false,
        message: "",
        severity: "success",
    });

    const [bucketFinder , setBucketFinder] = React.useState({
        open: false,
        onSelectBucket: null,
    });

    const [confirmDialog , setConfirmDialog] = React.useState({
        open: false,
        action: {},
    });

    const [mainLoading , setMainLoading] = React.useState({
        open: false,
    });

    const layout = {
        notify: (message, options = {}) => {
            setSnackbar({
                open: true,
                message: message,
                severity: options.severity ? options.severity : "info"
            });
        },
        confirm: (action = {}) => {
            setConfirmDialog({
                open: true,
                action: action
            });
        },
        bucketFinder: {
            show: (onSelect) => {
                setBucketFinder({
                    open: true,
                    onSelectBucket: onSelect
                });
            },
        },
        loading: {
            show: () => {
                setMainLoading({
                    open: true
                })
            },
            hide: () => {
                setMainLoading({
                    open: false
                })
            }
        }

    };

    const closeSnackBar = () => {
        setSnackbar({
            open: false,
            message: snackbar.message,
            severity: snackbar.severity
        });
    };

    return (
        <div className="App">
            <LayoutContext.Provider value={layout}>

                <MemoryRouter initialEntries={["/profiles"]}>
                    <Container maxWidth="lg">
                        <Box sx={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0, 0.03)',
                            borderRadius: '1rem',
                            marginTop: '1rem',
                            minHeight: 'calc(91vh - 1rem)'
                        }}>
                            <Routes>
                                <Route path={"/profiles"} element={<ProfilesList/>}/>
                                <Route path={"/buckets"} element={<BucketsList/>}/>
                                <Route path={"/objects"} element={<ObjectsList/>}/>
                            </Routes>
                        </Box>
                    </Container>
                </MemoryRouter>

                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackBar}>
                    <Alert icon={false} severity={snackbar.severity} sx={{ width: '100%' }} >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                <BucketFinderDialog
                    open={bucketFinder.open}
                    onClose={()=>setBucketFinder({open: false, onSelectBucket: null})}
                    onSelectBucket={bucketFinder.onSelectBucket}
                />

                <ConfirmDialog
                    open={confirmDialog.open}
                    onClose={()=>setConfirmDialog({open: false, action: {}})}
                    action={confirmDialog.action}
                />

                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={mainLoading.open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

            </LayoutContext.Provider>

        </div>
    );
}

export default App;
