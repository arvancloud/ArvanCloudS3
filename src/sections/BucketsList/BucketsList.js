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
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const BucketsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;

    const [pageSize, setPageSize] = React.useState(5);
    const [buckets, setBuckets] = React.useState([]);
    const [bucketCreateDialog, setBucketCreateDialog] = React.useState({open: false});
    const [bucketCopyDialog, setBucketCopyDialog] = React.useState({open: false, source: {}, dest: {}, isSync: false});

    const loadBuckets = async() => {

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
                    Are you sure you want to delete the {params.row.Name} bucket?
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
            }
        });

    };

    const handleBackToProfiles = () => navigate("/profiles", {replace: true});



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
                    <span>{params.api.getRowIndex(params.row.id) + 1}</span>
                )
            },
            width: 50,
        },
        {
            field: 'Name',
            headerName: 'Bucket',
            renderCell: (params) => {

                return (
                    <span onClick={handleShowObjects.bind(this, params.id)}>{params.row.Name}</span>
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
            headerName: 'Creation date',
            width: 150,
            align: 'center',
            headerAlign: 'center',

        },
        {
            field: 'IsPublic',
            type: 'boolean',
            headerName: 'Public read',
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
                    <MenuItem onClick={handleCopyBucket.bind(this, params)}>
                        <ListItemIcon>
                            <FolderCopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy bucket</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleSyncBucket.bind(this, params)}>
                        <ListItemIcon>
                            <CloudSyncIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Sync bucket</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteBucket.bind(this, params)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete bucket</ListItemText>
                    </MenuItem>
                </ActionMenu>
            ),
            headerName: '',
            align: 'center',
            width: 122,
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
                <Button onClick={() => setBucketCreateDialog({open: true})} variant="contained" startIcon={<BucketIcon />}>Add bucket</Button>
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

    return (
        <div style={{}}>

            {ToolBar}

            {buckets !== null &&
                <DataGrid
                    pageSize={pageSize}
                    disableSelectionOnClick={true}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    columns={columns}
                    rows={buckets}
                />
            }
        </div>
    );
}

export default BucketsList;