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
import TextField from "../../components/TextField/TextField";
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

const ObjectsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;
    const mountedBucket = location.state.mountedBucket;
    const directoryMode = location.state.directoryMode;

    const [rowCount, setRowCount] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(25);
    const [page, setPage] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [objects, setObjects] = React.useState(null);
    const [uploadBoxDialog, setUploadBoxDialog] = React.useState({open: false});
    const [goUploadDialog, setGoUploadDialog] = React.useState({open: false, data: {}});
    const [selectionModel, setSelectionModel] = React.useState([]);
    const [sort, setSort] = React.useState([]);
    const [searchKey, setSearchKey] = React.useState("");
    const [prefix, setPrefix] = React.useState("");

    const queryOptions = React.useMemo(
        () => ({
            page,
            pageSize,
            sort,
            searchKey
        }),
        [page, pageSize, sort, searchKey],
    );

    const loadObjects = async(clearCache = true) => {

        if(clearCache){
            layout.loading.show();
        }
        else{
            setLoading(true);
        }


        try{
            const data = await window.channel("Objects@getObjectsPro", mountedProfile, mountedBucket, queryOptions, {directoryMode, prefix}, clearCache);

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

            loadObjects(false);
        }

    }, [queryOptions]);

    React.useEffect(() => {

        if(objects !== null){

            loadObjects(true);
        }

    }, [prefix]);

    const handleSortModelChange = React.useCallback((sortModel) => {

        setSort(sortModel);

    }, []);

    const handleShowFolder = async (key) => {

        setPrefix(key);

    };

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
            title: "Delete Object",
            content: (<>
                <h3>Should {params.row.Key} be deleted?</h3>
                <p>This object will be permanently removed from {mountedBucket}.</p>
            </>),
            onConfirm: async () => {

                try{

                    await window.channel("Objects@deleteObject", mountedProfile, mountedBucket, params.row.Key);

                    layout.notify("Object Deleted Successfully", {
                        severity: "success"
                    });

                    loadObjects()

                }
                catch (e) {

                    console.log(e);

                    layout.notify("Could not Delete the Object", {
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
                <h3>Are you sure you want to delete {selectionModel.length} files?</h3>
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

        if(params.value === undefined) return '';

        return moment(params.value).locale('en').format('DD MMMM YYYY - HH:mm');

    }

    function getSizeAttribute(params) {

        if(params.value === undefined) return '';

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
                    <span className="row-index">{page * pageSize + params.api.getRowIndex(params.row.id) + 1}</span>
                )
            },
            width: 50,
        },
        {
            field: 'Key',
            // headerName: directoryMode ? 'Path' : 'Object name',
            headerName: 'Name',
            renderCell: (params) => {
                if(params.row.IsFolder){
                    return (
                        <span
                            className="mouse-pointer"
                            onClick={handleShowFolder.bind(this, params.row.Key)}
                        >
                            <FolderIcon
                                color="primary"
                                fontSize="small"
                                sx={{
                                    position: 'relative',
                                    top: '4px',
                                    left: '-3px'
                                }}
                            /> {params.row.Key.substr(prefix.length)}
                        </span>
                    )
                }
                else{
                    return (
                        <span>{params.row.Key.substr(prefix.length)}</span>
                    )
                }

            },
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
            width: 90,
        },
        {
            field: 'LastModified',
            type: 'datetime',
            valueFormatter: getLastModifiedAttribute,
            headerName: 'Last Modified',
            headerAlign: 'center',
            align: 'center',
            width: 200
        },
        {
            field: 'IsPublic',
            sortable: false,
            headerName: 'Public Access',
            type: 'boolean',
            renderCell: (params) => {

                if(params.row.IsFolder) return "";

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
                <>{
                    !params.row.IsFolder &&
                    <ActionMenu>
                        <MenuItem onClick={handleDownloadObject.bind(this, params)}>
                            <ListItemIcon>
                                <CloudDownloadOutlinedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Download</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDeleteObject.bind(this, params)}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    </ActionMenu>
                }</>
            ),
            headerName: 'Actions',
            align: 'center',
            headerAlign: 'center',
            width: 140
        }
    ];

    const ToolBar = (
        <div>
            <h3 style={{marginTop: '0'}}>{mountedProfile.title}</h3>
            <Stack direction="row" justifyContent="space-between" sx={{marginBottom: '1rem'}}>
                <div>
                    <IconButton onClick={handleBackToBuckets}><BackIcon fontSize="small" /></IconButton>
                    <span style={{fontSize: '16px', fontWeight: '700'}}>{mountedBucket}</span>
                </div>

                <div style={{
                    marginTop: '-40px',
                    marginLeft: '-120px'
                }}>
                    <TextField
                        size="small"
                        id="search-key"
                        placeholder="Search..."
                        type="text"
                        name="search_key"
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                    />
                </div>
                <Stack direction="row" justifyContent="space-between" sx={{gap: '1rem'}}>
                    <ActionMenu  buttonTitle="Batch Operations" disabled={!selectionModel.length}>
                        <MenuItem onClick={handleBulkDownloadObjects}>
                            <ListItemIcon>
                                <CloudDownloadOutlinedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Download</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleBulkSetPublic}>
                            <ListItemIcon>
                                <PublicIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Enable Public Access</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleBulkSetPrivate}>
                            <ListItemIcon>
                                <PublicOffIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Disable Public Access</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleBulkDeleteObjects}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    </ActionMenu>
                    <Button onClick={() => setUploadBoxDialog({open: true})} variant="contained" startIcon={<CloudUploadIcon />}>Upload</Button>
                </Stack>

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
                prefix={prefix}
            />
        </div>
    );

    const FoldersBreadCrumb = () => {

        let path = "";

        return (
            <Breadcrumbs aria-label="breadcrumb" color="primary" style={{marginLeft: '20px'}}>
                <HomeIcon
                    className="mouse-pointer"
                    color="inherit"
                    fontSize="small"
                    onClick={handleShowFolder.bind(this, "")}
                    sx={{
                        position: 'relative',
                        top: '3px',
                    }}
                />
                {prefix.split("/").map((folder) => {

                    path += folder + "/";

                    return (<Link underline="none" className="mouse-pointer" onClick={handleShowFolder.bind(this, path)} color="inherit">{folder}</Link>);
                })}
            </Breadcrumbs>
        );
    };

    return (
        <div style={{width: '100%'}}>

            {ToolBar}

            {directoryMode && <FoldersBreadCrumb />}

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
                isRowSelectable={(params) => !params.row.IsFolder}
            />

            }


        </div>
    );
}

export default ObjectsList;