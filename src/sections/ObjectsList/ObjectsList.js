import React from "react";
import moment from "jalali-moment";
import DataGrid from './../../components/DataGrid/DataGrid';
import Switch from './../../components/Switch/Switch';
import { useLocation, useNavigate } from "react-router-dom";
import LayoutContext  from './../../contexts/LayoutContext';
import MenuItem from '@mui/material/MenuItem';
import ActionMenu from './../../components/ActionMenu/ActionMenu';
import Button from "@mui/material/Button";
import BucketIcon from "../../components/UI/Icons/BucketIcon";
import BackIcon from "../../components/UI/Icons/BackIcon";
import IconButton from "@mui/material/IconButton";
import ObjectUploadBoxDialog from "../../dialogs/ObjectUploadBoxDialog/ObjectUploadBoxDialog";
import BucketCreateDialog from "../../dialogs/BucketCreateDialog/BucketCreateDialog";

const ObjectsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;
    const mountedBucket = location.state.mountedBucket;

    const [pageSize, setPageSize] = React.useState(5);
    const [objects, setObjects] = React.useState([]);
    const [uploadBoxDialog, setUploadBoxDialog] = React.useState({open: false});


    console.log("ObjectsList rendered");

    React.useEffect(() => {

        console.log("ObjectsList mounted");

        (async () => {

            try{
                const rows = await window.channel("Objects@getObjectsPro", mountedProfile, mountedBucket);

                setObjects(rows.map((item) => {
                    item.id = item.Key;
                    return item;
                }));
            }
            catch (e) {

                console.log(e);

                layout.notify("خطا در دریافت فایل ها", {
                    severity: "error"
                });

                setObjects(null);

            }

        })();

        return () => {
            console.log("ObjectsList un-mounted");
        }

    }, []);

    const handleCopyBucket = async (params) => {

        layout.bucketFinder.show(() => {
            alert(70);
        });
        console.log(params);
        layout.notify("کپی");
    };

    const handleSyncBucket = (params) => {
        console.log(params)
        layout.notify("سینک");
    };

    const handleDeleteBucket = (params) => {
        console.log(params)
        layout.notify("حذف");
    };


    const handleBackToBuckets = () => navigate("/buckets", {replace: true, state: {mountedProfile}});

    function getLastModifiedAttribute(params) {

        return moment(params.row.LastModified).locale('fa').format('DD MMMM YYYY - HH:mm');

    }

    function getSizeAttribute(params) {

        let size = params.row.Size;

        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت']
        if (size < 1024) return `${size} بایت`;
        const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)), 10)

        return `${(size / (1024 ** i)).toFixed(2)} ${sizes[i]}`

    }

    const columns = [

        {
            field: 'Key',
            headerName: 'نام فایل',
            // renderCell: (params) => {
            //     console.log(params);
            //     return (
            //         <span onClick={handleShowObjects.bind(this, params.id)}>{params.row.Name}</span>
            //     )
            // },
            width: 300
        },
        {
            field: 'Size',
            headerName: 'سایز',
            valueGetter: getSizeAttribute,
            width: 200
        },
        {
            field: 'LastModified',
            valueGetter: getLastModifiedAttribute,
            headerName: 'آخرین تغییر',
            width: 200
        },
        {
            field: 'Acl',
            headerName: 'نمایش عمومی',
            renderCell: (params) => {
                return (
                    <Switch/>
                )
            },
            width: 300
        },
        {
            field: 'actions',
            renderCell: (params) => (
                <ActionMenu>
                    <MenuItem onClick={handleCopyBucket.bind(this, params)}>دانلود</MenuItem>
                    <MenuItem onClick={handleSyncBucket.bind(this, params)}>تغییر نام</MenuItem>
                    <MenuItem onClick={handleDeleteBucket.bind(this, params)}>حذف</MenuItem>
                </ActionMenu>
            ),
            headerName: '',
            width: 300
        }
    ];

    const ToolBar = (
        <div>
            <h1>{mountedProfile.title} صندوقچه {mountedBucket}</h1>
            <h2>لیست فایل ها</h2>
            <IconButton onClick={handleBackToBuckets}><BackIcon fontSize="small" /></IconButton>
            <Button onClick={() => setUploadBoxDialog({open: true})} variant="contained" startIcon={<BucketIcon />}>آپلود</Button>
            <ObjectUploadBoxDialog
                open={uploadBoxDialog.open}
                onClose={() => setUploadBoxDialog({open: false})}
                mountedProfile={mountedProfile}
                bucketName={mountedBucket}
            />
        </div>
    );

    return (
        <div style={{height: 500, width: '100%'}}>

            {ToolBar}

            {objects !== null &&
            <DataGrid
                checkboxSelection={true}
                headerHeight={100}
                pageSize={pageSize}
                disableSelectionOnClick={true}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                columns={columns}
                rows={objects}
            />
            }
        </div>
    );
}

export default ObjectsList;