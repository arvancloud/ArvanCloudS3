import React from "react";
import DataGrid from './../../components/DataGrid/DataGrid';
import Switch from './../../components/Switch/Switch';
import { useLocation, useNavigate } from "react-router-dom";
import LayoutContext  from './../../contexts/LayoutContext';
import MenuItem from '@mui/material/MenuItem';
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import Button from "@mui/material/Button";
import BucketIcon from "../../components/UI/Icons/BucketIcon";
import BackIcon from "../../components/UI/Icons/BackIcon";
import IconButton from "@mui/material/IconButton";
import BucketCreateDialog from "../../dialogs/BucketCreateDialog/BucketCreateDialog";
import moment from "jalali-moment";
import BucketCopyDialog from "../../dialogs/BucketCopyDialog/BucketCopyDialog";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import FolderIcon from '@mui/icons-material/Folder';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SaveIcon from '@mui/icons-material/Save';

const BucketsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;

    const [pageSize, setPageSize] = React.useState(25);
    const [buckets, setBuckets] = React.useState([]);
    const [bucketCreateDialog, setBucketCreateDialog] = React.useState({open: false});
    const [bucketCopyDialog, setBucketCopyDialog] = React.useState({open: false, source: {}, dest: {}, isSync: false});
    const [loading, setLoading] = React.useState(false);

    const loadBuckets = async() => {

        setLoading(true);

        try{
            const rows = await window.channel("Buckets@getBucketsWithAcl", mountedProfile);

            setBuckets(rows.map((item) => {
                item.id = item.Name;
                return item;
            }));
        }
        catch (e) {

            console.log(e);

            layout.notify("Error in receiving buckets", {
                severity: "error"
            });

            setBuckets(null);

        }

        setLoading(false);

    }

    console.log("BucketLst rendered");

    React.useEffect(() => {

        console.log("BucketList mounted");

        loadBuckets();


        return () => {
            console.log("BucketList un-mounted");
        }

    }, []);

    const handleCopyBucket = (params) => {

        layout.bucketFinder.show((bucket, profile) => {

            setBucketCopyDialog({
                open: true,
                source: {
                    bucket: params.row.Name,
                    profile: mountedProfile
                },
                dest: {
                    bucket: bucket,
                    profile: profile
                },
                isSync: false
            })
        });

    };

    const handleSyncBucket = (params) => {

        layout.bucketFinder.show((bucket, profile) => {

            setBucketCopyDialog({
                open: true,
                source: {
                    bucket: params.row.Name,
                    profile: mountedProfile
                },
                dest: {
                    bucket: bucket,
                    profile: profile
                },
                isSync: true
            })
        });

    };

    const handleDeleteBucket = (params) => {

        layout.confirm({
            title: "Delete bucket",
            content: (
                <span>
                    Are you sure you want to delete {params.row.Name}?
                </span>
            ),
            onConfirm: async () => {

                try{

                    await window.channel("Buckets@deleteBucket", mountedProfile, params.row.Name);

                    layout.notify("Bucket deleted successfully", {
                        severity: "success"
                    });

                    loadBuckets()

                }
                catch (e) {

                    console.log(e);

                    if(e.Code === "BucketNotEmpty"){
                        layout.notify("It is not possible to delete the bucket. Please delete all the objects in the bucket first and then proceed to delete the bucket.", {
                            severity: "error"
                        });
                    }
                    else{
                        layout.notify("Error in deleting the bucket", {
                            severity: "error"
                        });
                    }
                }
            }
        });
    };

    const handleEmptyBucket = (params) => {

        layout.confirm({
            title: "Empty bucket",
            content: (
                <span>
                    Are you sure you want to empty {params.row.Name}?
                </span>
            ),
            onConfirm: async () => {

                setLoading(true);

                try{

                    await window.channel("Buckets@emptyBucket", mountedProfile, params.row.Name);

                    layout.notify("Bucket emptied successfully", {
                        severity: "success"
                    });

                }
                catch (e) {

                    console.log(e);

                    layout.notify("Error in emptying the bucket", {
                        severity: "error"
                    });

                }

                setLoading(false);
            }
        });
    };

    const handleChangeAcl = async (params, e) => {

        const isPublic = e.target.checked;

        try{

            await window.channel("Buckets@setBucketIsPublic", mountedProfile, params.row.Name, isPublic);

            const index = buckets.findIndex((bucket) => bucket.id === params.id);

            buckets[index].IsPublic = isPublic;
            setBuckets(buckets);

            // const updatedBucket = { ...buckets[index], IsPublic: isPublic };
            //
            // setBuckets([...buckets.map((row) => (row.id === updatedBucket.id ? updatedBucket : row))]);

            layout.notify("The access level of the bucket has been successfully updated", {
                severity: "success"
            });


        }
        catch (e) {

            console.log(e);

            layout.notify("Error in changing the access level of the bucket", {
                severity: "error"
            });
        }

    };

    const handleShowObjects = (bucket) => {

        navigate("/objects", {
            replace: true,
            state: {
                mountedProfile: mountedProfile,
                mountedBucket: bucket,
                directoryMode: false,
            }
        });

    };

    const handleShowDirectories = (bucket) => {

        navigate("/objects", {
            replace: true,
            state: {
                mountedProfile: mountedProfile,
                mountedBucket: bucket,
                directoryMode: true,
            }
        });

    };

    const handleBackToProfiles = () => navigate("/profiles", {replace: true});

    const handleMountBucketAsDrive = async (params) => {

        try{

            await window.channel("Buckets@mountBucket", mountedProfile, params.row.Name);

            layout.notify(params.row.Name + " mounted as drive successfully", {
                severity: "success"
            });

        }
        catch (e) {

            console.log(e);

            layout.notify("Error in bucket mount", {
                severity: "error"
            });
        }

    };

    const handleUnMountBucket = async (params) => {

        try{

            await window.channel("Buckets@unMountBucket");

            layout.notify(params.row.Name + " unmounted successfully", {
                severity: "success"
            });

        }
        catch (e) {

            console.log(e);

            layout.notify("Error in bucket unmount", {
                severity: "error"
            });
        }

    };

    function getCreationDateAttribute(params) {

        return moment(params.value).locale('en').format('DD MMMM YYYY - HH:mm');
    }

    const columns = [
        {
            field: 'RowIndex',
            sortable: false,
            headerName: '',
            renderCell: (params) => {

                return (
                    <span className="row-index" onClick={handleShowObjects.bind(this, params.id)}>{params.api.getRowIndex(params.row.id) + 1}</span>
                )
            },
            width: 50,
        },
        {
            field: 'Name',
            headerName: 'Name',
            renderCell: (params) => {

                return (
                    <span onClick={handleShowDirectories.bind(this, params.id)}>{params.row.Name}</span>
                )
            },
            //maxWidth: 400,
            minWidth: 200,
            flex: 0.8,
        },
        {
            field: 'CreationDate',
            type: 'datetime',
            valueFormatter: getCreationDateAttribute,
            headerName: 'Created at',
            width: 220,
            align: 'center',
            headerAlign: 'center',

        },
        {
            field: 'IsPublic',
            type: 'boolean',
            headerName: 'Public Access',
            renderCell: (params) => {
                return (
                    <Switch checked={params.row.IsPublic} onChange={handleChangeAcl.bind(this, params)} />
                )
            },
            width: 150,
        },
        {
            field: 'actions',
            sortable: false,
            renderCell: (params) => (
                <ActionMenu>
{/*                    <MenuItem onClick={handleShowObjects.bind(this, params.id)}>
                        <ListItemIcon>
                            <FolderIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Show objects</ListItemText>
                    </MenuItem>*/}
                    <MenuItem onClick={handleMountBucketAsDrive.bind(this, params)}>
                        <ListItemIcon>
                            <SaveIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Mount as a Local Drive</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleUnMountBucket.bind(this, params)}>
                        <ListItemIcon>
                            <SaveIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Unmount</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCopyBucket.bind(this, params)}>
                        <ListItemIcon>
                            <FolderCopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleSyncBucket.bind(this, params)}>
                        <ListItemIcon>
                            <CloudSyncIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Sync</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleEmptyBucket.bind(this, params)}>
                        <ListItemIcon>
                            <DeleteOutlineIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Empty the Bucket</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteBucket.bind(this, params)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </ActionMenu>
            ),
            headerName: 'Actions',
            align: 'center',
            headerAlign: 'center',
            width: 150,
        }
    ];

    const ToolBar = (
        <div>
            <h3 style={{marginTop: '0'}}>{mountedProfile.title}</h3>
            <Stack direction="row" justifyContent="space-between" sx={{marginBottom: '1rem'}}>
                <div>
                    <IconButton onClick={handleBackToProfiles}><BackIcon fontSize="small" /></IconButton>
                    <span style={{fontSize: '16px', fontWeight: '700'}}>Buckets</span>
                </div>
                <Button onClick={() => setBucketCreateDialog({open: true})} variant="contained" startIcon={<BucketIcon />}>Create Bucket</Button>
            </Stack>


            <BucketCreateDialog
                open={bucketCreateDialog.open}
                onClose={() => setBucketCreateDialog({open: false})}
                afterCreate={() => loadBuckets()}
                mountedProfile={mountedProfile}
            />

            <BucketCopyDialog
                {...bucketCopyDialog}
                onClose={() => setBucketCopyDialog({open: false, source: {}, dest: {}})}
            />
        </div>
    );

    const showObjectsFn = (params) => handleShowObjects.bind(this, params.id)();

    return (
        <div style={{}}>

            {ToolBar}

            {buckets !== null &&
                <DataGrid
                    pageSize={pageSize}
                    disableSelectionOnClick={true}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    columns={columns}
                    loading={loading}
                    rows={buckets}
                    onRowClick={showObjectsFn}
                    getRowClassName={() => "mouse-pointer"}
                />
            }
        </div>
    );
}

export default BucketsList;