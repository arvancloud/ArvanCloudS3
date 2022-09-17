import React from "react";
import moment from "jalali-moment";
import DataGrid from './../../components/DataGrid/DataGrid';
import Switch from './../../components/Switch/Switch';
import { useLocation, useNavigate } from "react-router-dom";
import LayoutContext  from './../../contexts/LayoutContext';
import MenuItem from '@mui/material/MenuItem';
import ActionMenu from './../../components/ActionMenu/ActionMenu';
import Button from "@mui/material/Button";
import CloudUploadIcon from "../../components/UI/Icons/CloudUploadIcon";
import BackIcon from "../../components/UI/Icons/BackIcon";
import IconButton from "@mui/material/IconButton";
import ObjectUploadBoxDialog from "../../dialogs/ObjectUploadBoxDialog/ObjectUploadBoxDialog";
import Stack from "@mui/material/Stack";
import GoUploadDialog from "../../dialogs/GoUploadDialog/GoUploadDialog";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';

const ObjectsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;
    const mountedBucket = location.state.mountedBucket;

    const [rowCount, setRowCount] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(5);
    const [page, setPage] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [objects, setObjects] = React.useState(null);
    const [uploadBoxDialog, setUploadBoxDialog] = React.useState({open: false});
    const [goUploadDialog, setGoUploadDialog] = React.useState({open: false, data: {}});
    const [selectionModel, setSelectionModel] = React.useState([]);
    const [sort, setSort] = React.useState([]);

    const queryOptions = React.useMemo(
        () => ({
            page,
            pageSize,
            sort
        }),
        [page, pageSize, sort],
    );

    const loadObjects = async(clearCache = true) => {

        if(clearCache){
            layout.loading.show();
        }
        else{
            setLoading(true);
        }


        try{
            const data = await window.channel("Objects@getObjectsPro", mountedProfile, mountedBucket, queryOptions, clearCache);

            setRowCount(data.count);

            await setObjects(data.objects);
        }
        catch (e) {

            console.log(e);

            layout.notify("Error in receiving objects", {
                severity: "error"
            });

            setObjects([]);

        }

        layout.loading.hide();
        setLoading(false);

    }

    React.useEffect(() => {

        console.log("ObjectsList mounted");

        loadObjects(true)

        return () => {
            console.log("ObjectsList un-mounted");
        }

    }, []);

    React.useEffect(() => {

        if(objects !== null){
            console.log("change query");

            loadObjects(false);
        }

    }, [queryOptions]);

    const handleSortModelChange = React.useCallback((sortModel) => {

        setSort(sortModel);

    }, []);

    const handleDownloadObject = async (params) => {

        layout.loading.show();

        try {
            const data = await window.channel("Objects@downloadObject", mountedProfile, mountedBucket, params.row.Key);

            if(data){
                layout.notify("The object has been downloaded successfully", {
                    severity: "success"
                });
            }

        }
        catch (e) {
            console.log(e);

            layout.notify("Error in downloading object", {
                severity: "error"
            });
        }

        layout.loading.hide();

    };

    const handleDeleteObject = (params) => {

        layout.confirm({
            title: "Delete object",
            content: (<>
                <h3>Should {params.row.Key} be deleted?</h3>
                <p>This object will be permanently removed from {mountedBucket}.</p>
            </>),
            onConfirm: async () => {

                try{

                    await window.channel("Objects@deleteObject", mountedProfile, mountedBucket, params.row.Key);

                    layout.notify("The object has been deleted successfully", {
                        severity: "success"
                    });

                    loadObjects()

                }
                catch (e) {

                    console.log(e);

                    layout.notify("Error in deleting object", {
                        severity: "error"
                    });
                }
            }
        });
    };

    const handleChangeAcl = async (params, e) => {

        const isPublic = e.target.checked;

        try{

            await window.channel("Objects@setObjectIsPublic", mountedProfile, mountedBucket, params.row.Key, isPublic);

            const index = objects.findIndex((object) => object.id === params.id);

            objects[index].IsPublic = isPublic;
            setObjects(objects);

            layout.notify("The access level of the object has been successfully updated", {
                severity: "success"
            });


        }
        catch (e) {

            console.log(e);

            layout.notify("Error in changing the access level", {
                severity: "error"
            });
        }

    };

    const handleBackToBuckets = () => navigate("/buckets", {replace: true, state: {mountedProfile}});


    const handleBulkDownloadObjects = async () => {

        layout.loading.show();

        try {
            const data = await window.channel("Objects@downloadObjects", mountedProfile, mountedBucket, selectionModel);

            if(data){
                layout.notify("The objects have been downloaded successfully", {
                    severity: "success"
                });
            }

        }
        catch (e) {
            console.log(e);

            layout.notify("Error in downloading objects", {
                severity: "error"
            });
        }

        layout.loading.hide();


    };

    const handleBulkSetPublic = async () => {

        try {
            await window.channel("Objects@setObjectsAcl", mountedProfile, mountedBucket, selectionModel, true);
            loadObjects(false);
        }
        catch (e) {
            console.log(e);

            layout.notify("Error in changing the access level", {
                severity: "error"
            });
        }

    };

    const handleBulkSetPrivate = async () => {

        try {

            await window.channel("Objects@setObjectsAcl", mountedProfile, mountedBucket, selectionModel, false);

            loadObjects(false);
        }
        catch (e) {
            console.log(e);

            layout.notify("Error in changing the access level", {
                severity: "error"
            });
        }
    };

    const handleBulkDeleteObjects = async () => {

        layout.confirm({
            title: "Delete objects",
            content: (<>
                <h3>Are you sure you want to delete the {selectionModel.length} files?</h3>
                <p>These objects will be permanently removed from {mountedBucket}.</p>
            </>),
            onConfirm: async () => {

                try{

                    await window.channel("Objects@deleteObjects", mountedProfile, mountedBucket, selectionModel);

                    layout.notify("The objects have been deleted successfully", {
                        severity: "success"
                    });

                    loadObjects()

                }
                catch (e) {

                    console.log(e);

                    layout.notify("Error in deleting objects", {
                        severity: "error"
                    });
                }
            }
        });

    };


    function getLastModifiedAttribute(params) {

        return moment(params.value).locale('fa').format('DD MMMM YYYY - HH:mm');

    }

    function getSizeAttribute(params) {

        let size = params.value;

        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        if (size < 1024) return `${size} B`;
        const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)), 10)

        return `${(size / (1024 ** i)).toFixed(2)} ${sizes[i]}`

    }

    const columns = [
        {
            field: 'RowIndex',
            sortable: false,
            headerName: '',
            renderCell: (params) => {

                return (
                    <span>{page * pageSize + params.api.getRowIndex(params.row.id) + 1}</span>
                )
            },
            width: 50,
        },
        {
            field: 'Key',
            headerName: 'Object name',
            // renderCell: (params) => {
            //     console.log(params);
            //     return (
            //         <span onClick={handleShowObjects.bind(this, params.id)}>{params.row.Name}</span>
            //     )
            // },

            minWidth: 200,
            flex: 0.8,
        },
        {
            field: 'Size',
            type: 'number',
            headerName: 'Size',
            valueFormatter: getSizeAttribute,
            headerAlign: 'center',
            align: 'center',
            width: 120,
        },
        {
            field: 'LastModified',
            type: 'datetime',
            valueFormatter: getLastModifiedAttribute,
            headerName: 'Last modified',
            headerAlign: 'center',
            align: 'center',
            width: 150
        },
        {
            field: 'IsPublic',
            sortable: false,
            headerName: 'Public read',
            type: 'boolean',
            renderCell: (params) => {
                return (
                    <Switch checked={params.row.IsPublic} onChange={handleChangeAcl.bind(this, params)} />
                )
            },
            width: 150
        },
        {
            field: 'actions',
            sortable: false,
            renderCell: (params) => (
                <ActionMenu>
                    <MenuItem onClick={handleDownloadObject.bind(this, params)}>
                        <ListItemIcon>
                            <CloudDownloadOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Download object</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteObject.bind(this, params)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete object</ListItemText>
                    </MenuItem>
                </ActionMenu>
            ),
            headerName: '',
            align: 'center',
            width: 122
        }
    ];

    const ToolBar = (
        <div>
            <h3 style={{marginTop: '0'}}>{mountedProfile.title}</h3>
            <Stack direction="row" justifyContent="space-between" sx={{marginBottom: '1rem'}}>
                <div>
                    <IconButton onClick={handleBackToBuckets}><BackIcon fontSize="small" /></IconButton>
                    <span style={{fontSize: '16px', fontWeight: '700'}}>Bucket {mountedBucket}</span>
                </div>
                <ActionMenu buttonTitle="Batch operation" disabled={!selectionModel.length}>
                    <MenuItem onClick={handleBulkDownloadObjects}>
                        <ListItemIcon>
                            <CloudDownloadOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Download objects</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkSetPublic}>
                        <ListItemIcon>
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Access public read</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkSetPrivate}>
                        <ListItemIcon>
                            <PublicOffIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Remove public read access</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkDeleteObjects}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete objects</ListItemText>
                    </MenuItem>
                </ActionMenu>
                <Button onClick={() => setUploadBoxDialog({open: true})} variant="contained" startIcon={<CloudUploadIcon />}>Upload</Button>
            </Stack>

            <ObjectUploadBoxDialog
                open={uploadBoxDialog.open}
                onClose={() => setUploadBoxDialog({open: false})}
                mountedProfile={mountedProfile}
                bucketName={mountedBucket}
                prepareUpload={(data) => {setGoUploadDialog({open: true, data})}}
            />

            <GoUploadDialog
                open={goUploadDialog.open}
                onClose={() => setGoUploadDialog({open: false, data: {}})}
                onFinish={loadObjects}
                mountedProfile={mountedProfile}
                bucketName={mountedBucket}
                objectsData={goUploadDialog.data}
            />
        </div>
    );

    return (
        <div style={{width: '100%'}}>

            {ToolBar}

            {objects &&

            <DataGrid
                checkboxSelection={true}
                pageSize={pageSize}
                disableSelectionOnClick={true}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                columns={columns}
                rows={objects}
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                selectionModel={selectionModel}
                checkboxSelectionVisibleOnly={true}
                page={page}
                paginationMode="server"
                onPageChange={(newPage) => setPage(newPage)}
                loading={loading}
                rowCount={rowCount}
                sortingMode="server"
                onSortModelChange={handleSortModelChange}
            />

            }


        </div>
    );
}

export default ObjectsList;