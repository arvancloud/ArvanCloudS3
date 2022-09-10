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
    const [objects, setObjects] = React.useState([]);
    const [uploadBoxDialog, setUploadBoxDialog] = React.useState({open: false});
    const [goUploadDialog, setGoUploadDialog] = React.useState({open: false, data: {}});
    const [selectionModel, setSelectionModel] = React.useState([]);

    const queryOptions = React.useMemo(
        () => ({
            page,
            pageSize,
        }),
        [page, pageSize],
    );

    console.log(queryOptions);

    const loadObjects = async() => {

        setLoading(true);

        try{
            const data = await window.channel("Objects@getObjectsPro", mountedProfile, mountedBucket, queryOptions);

            setRowCount(data.count);

            await setObjects(data.objects);
        }
        catch (e) {

            console.log(e);

            layout.notify("خطا در دریافت فایل ها", {
                severity: "error"
            });

            setObjects([]);

        }

        setLoading(false);

    }

    React.useEffect(() => {

        console.log("change query");

        loadObjects()

        return () => {
            console.log("ObjectsList un-mounted");
        }

    }, [queryOptions]);

    const handleDownloadObject = async (params) => {

        layout.loading.show();

        try {
            const data = await window.channel("Objects@downloadObject", mountedProfile, mountedBucket, params.row.Key);

            if(data){
                layout.notify("دانلود فایل با موفقیت انجام شد", {
                    severity: "success"
                });
            }

        }
        catch (e) {
            console.log(e);

            layout.notify("خطا در دانلود فایل", {
                severity: "error"
            });
        }

        layout.loading.hide();

    };

    const handleRenameObject = (params) => {

    };

    const handleDeleteObject = (params) => {

        layout.confirm({
            title: "حذف فایل",
            content: (<>
                <h3>فایل {params.row.Key} حذف شود؟</h3>
                <p>این فایل برای همیشه از صندوقچه {mountedBucket} حذف می شود.</p>
            </>),
            onConfirm: async () => {

                try{

                    await window.channel("Objects@deleteObject", mountedProfile, mountedBucket, params.row.Key);

                    layout.notify("فایل مورد نظر با موفقیت حذف شد", {
                        severity: "success"
                    });

                    loadObjects()

                }
                catch (e) {

                    console.log(e);

                    layout.notify("خطا در حذف فایل", {
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

            layout.notify("سطح دسترسی فایل با موفقیت به روز شد", {
                severity: "success"
            });


        }
        catch (e) {

            console.log(e);

            layout.notify("خطا در تغییر سطح دسترسی فایل", {
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
                layout.notify("دانلود فایل ها با موفقیت انجام شد", {
                    severity: "success"
                });
            }

        }
        catch (e) {
            console.log(e);

            layout.notify("خطا در دانلود فایل ها", {
                severity: "error"
            });
        }

        layout.loading.hide();


    };

    const handleBulkSetPublic = async () => {

        try {

            await window.channel("Objects@setObjectsAcl", mountedProfile, mountedBucket, selectionModel, true);

            loadObjects();
        }
        catch (e) {
            console.log(e);

            layout.notify("خطا در تغییر سطح دسترسی", {
                severity: "error"
            });
        }

    };

    const handleBulkSetPrivate = async () => {

        try {

            await window.channel("Objects@setObjectsAcl", mountedProfile, mountedBucket, selectionModel, false);

            loadObjects();
        }
        catch (e) {
            console.log(e);

            layout.notify("خطا در تغییر سطح دسترسی", {
                severity: "error"
            });
        }
    };

    const handleBulkDeleteObjects = async () => {

        layout.confirm({
            title: "حذف فایل ها",
            content: (<>
                <h3>{selectionModel.length} فایل انتخاب شده حذف شود؟</h3>
                <p>فایل ها برای همیشه از صندوقچه {mountedBucket} حذف می شود.</p>
            </>),
            onConfirm: async () => {

                try{

                    await window.channel("Objects@deleteObjects", mountedProfile, mountedBucket, selectionModel);

                    layout.notify("فایل های مورد نظر با موفقیت حذف شد", {
                        severity: "success"
                    });

                    loadObjects()

                }
                catch (e) {

                    console.log(e);

                    layout.notify("خطا در حذف فایل ها", {
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

        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت']
        if (size < 1024) return `${size} بایت`;
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
            headerName: 'نام فایل',
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
            headerName: 'سایز',
            valueFormatter: getSizeAttribute,
            headerAlign: 'center',
            align: 'center',
            width: 120,
        },
        {
            field: 'LastModified',
            type: 'datetime',
            valueFormatter: getLastModifiedAttribute,
            headerName: 'آخرین تغییر',
            headerAlign: 'center',
            align: 'center',
            width: 150
        },
        {
            field: 'IsPublic',
            sortable: false,
            headerName: 'نمایش عمومی',
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
                        <ListItemText>دانلود</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleRenameObject.bind(this, params)}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>تغییر نام</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteObject.bind(this, params)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>حذف</ListItemText>
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
                    <span style={{fontSize: '16px', fontWeight: '700'}}>صندوقچه {mountedBucket}</span>
                </div>
                <ActionMenu buttonTitle="عملیات گروهی" disabled={!selectionModel.length}>
                    <MenuItem onClick={handleBulkDownloadObjects}>
                        <ListItemIcon>
                            <CloudDownloadOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>دانلود</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkSetPublic}>
                        <ListItemIcon>
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>دسترسی نمایش عمومی</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkSetPrivate}>
                        <ListItemIcon>
                            <PublicOffIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>عدم نمایش عمومی</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleBulkDeleteObjects}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>حذف</ListItemText>
                    </MenuItem>
                </ActionMenu>
                <Button onClick={() => setUploadBoxDialog({open: true})} variant="contained" startIcon={<CloudUploadIcon />}>آپلود</Button>
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
            />

        </div>
    );
}

export default ObjectsList;