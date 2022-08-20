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

const BucketsList = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const mountedProfile = location.state.mountedProfile;

    const [pageSize, setPageSize] = React.useState(5);
    const [buckets, setBuckets] = React.useState([]);
    const [bucketCreateDialog, setBucketCreateDialog] = React.useState({open: false});
    const [bucketCopyDialog, setBucketCopyDialog] = React.useState({open: false, source: {}, dest: {}});

    const loadBuckets = async() => {

        try{
            const rows = await window.channel("Buckets@getBuckets", mountedProfile);

            setBuckets(rows.map((item) => {
                item.id = item.Name;
                return item;
            }));
        }
        catch (e) {

            console.log(e);

            layout.notify("خطا در دریافت صندوقچه ها", {
                severity: "error"
            });

            setBuckets(null);

        }

    }

    console.log("BucketLst rendered");

    React.useEffect(() => {

        console.log("BucketList mounted");

        loadBuckets();

        window.ipcRenderer.on('ping', (event, data) => {
            console.log(data);
        });

        return () => {
            console.log("BucketList un-mounted");
        }

    }, []);

    const handleCopyBucket = async (params) => {

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
                }
            })
        });

    };

    const handleSyncBucket = (params) => {
        console.log(params)
        layout.notify("سینک");
    };

    const handleDeleteBucket = (params) => {

        layout.confirm({
            title: "حذف صندوقچه",
            content: (
                <span>
                    آیا از حذف صندوقچه {params.row.Name} مطمئن هستید؟
                </span>
            ),
            onConfirm: async () => {

                try{

                    await window.channel("Buckets@deleteBucket", mountedProfile, params.row.Name);

                    layout.notify("صندوقچه مورد نظر با موفقیت حذف شد", {
                        severity: "success"
                    });

                    loadBuckets()

                }
                catch (e) {

                    console.log(e);

                    if(e.Code === "BucketNotEmpty"){
                        layout.notify("امکان حذف صندوقچه وجود ندارد. لطفا ابتدا تمام فایل های صندوقچه را حذف کنید و سپس اقدام به حذف صندوقچه نمایید.", {
                            severity: "error"
                        });
                    }
                    else{
                        layout.notify("خطا در حذف صندوقچه", {
                            severity: "error"
                        });
                    }
                }
            }
        });
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

        return moment(params.row.CreationDate).locale('fa').format('DD MMMM YYYY - HH:mm');
    }

    const columns = [

        {
            field: 'Name',
            headerName: 'نام صندوقچه',
            renderCell: (params) => {

                return (
                    <span onClick={handleShowObjects.bind(this, params.id)}>{params.row.Name}</span>
                )
            },
            width: 300
        },
        {
            field: 'CreationDate',
            valueGetter: getCreationDateAttribute,
            headerName: 'تاریخ ساخت',
            headerAlign: 'center',
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
            width: 100
        },
        {
            field: 'actions',
            renderCell: (params) => (
                <ActionMenu>
                    <MenuItem onClick={handleCopyBucket.bind(this, params)}>کپی</MenuItem>
                    <MenuItem onClick={handleSyncBucket.bind(this, params)}>سینک</MenuItem>
                    <MenuItem onClick={handleDeleteBucket.bind(this, params)}>حذف</MenuItem>
                </ActionMenu>
            ),
            headerName: '',
            width: 100
        }
    ];

    const ToolBar = (
        <div>
            <h1>{mountedProfile.title}</h1>
            <h2>لیست صندوقچه ها</h2>
            <IconButton onClick={handleBackToProfiles}><BackIcon fontSize="small" /></IconButton>
            <Button onClick={() => setBucketCreateDialog({open: true})} variant="contained" startIcon={<BucketIcon />}>ایجاد صندوقچه</Button>

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
        <div style={{height: 500, width: '100%'}}>

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