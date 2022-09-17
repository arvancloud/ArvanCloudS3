import React from "react";
import ProfileDialog from "../../dialogs/ProfileDialog/ProfileDialog";
import { useNavigate } from "react-router-dom";
import LayoutContext from "../../contexts/LayoutContext";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DataGrid from "../../components/DataGrid/DataGrid";
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import Stack from "@mui/material/Stack";
import CloudIcon from '@mui/icons-material/Cloud';
import Button from "@mui/material/Button";

const ProfilesList = () => {

    const profile = {
        id: null,
        title: "",
        endpoint_url: "",
        provider: "arvan",
        access_key: "",
        secret_key: "",
    };

    const navigate = useNavigate();
    const layout = React.useContext(LayoutContext);

    const [profileDialog, setProfileDialog] = React.useState({
        detectedProfile: profile,
        openProfileDialog: false
    });

    const [profiles, setProfiles] = React.useState([]);

    const [pageSize, setPageSize] = React.useState(5);


    const loadProfiles = async () => {

        try {
            const rows = await window.channel("Profiles@getProfiles");

            setProfiles(rows);

            return rows;
        }
        catch (e) {

            console.log(e);

            layout.notify("Error in receiving profiles", {
                severity: "error"
            });

            setProfiles([]);

            return [];

        }

    }

    console.log("ProfilesList rendered");

    React.useEffect(() => {

        console.log("ProfilesList mounted");

        loadProfiles().then((data) => {

            if(data.length === 0){
                handleNewProfile();
            }
        });

        return () => {
            console.log("ProfilesList un-mounted");
        }

    }, []);

    const handleNewProfile = () => {
        setProfileDialog({
            openProfileDialog: true,
            detectedProfile: profile
        });
    };

    const handleEditProfile = (profile, event) => {

        setProfileDialog({
            openProfileDialog: true,
            detectedProfile: profile
        });
    }

    const handleDeleteProfile = (profile, event) => {

        layout.confirm({
            title: "Delete profile",
            content: (
                <span>
                    Are you sure you want to delete {profile.title}'s profile?
                </span>
            ),
            onConfirm: async () => {

                try {

                    await window.channel("Profiles@deleteProfile", profile);

                    layout.notify("Profile deleted successfully", {
                        severity: "success"
                    });

                    loadProfiles();

                }
                catch (e) {

                    console.log(e);

                    layout.notify("Error in deleting the profile", {
                        severity: "error"
                    });
                }
            }
        });

    };

    const handleCloseProfileDialog = () => {

        setProfileDialog({
            openProfileDialog: false,
            detectedProfile: profile
        });

        loadProfiles();
    };

    const handleShowBuckets = (profile) => {
        navigate("/buckets", {
            replace: true,
            state: {
                mountedProfile: profile
            }
        });
    };


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
            field: 'title',
            headerName: 'Title',
            renderCell: (params) => {

                return (
                    <span onClick={handleShowBuckets.bind(this, params.row)}>{params.row.title}</span>
                )
            },
            width: 200
        },
        {
            field: 'endpoint_url',
            headerName: 'Endpoint',
            minWidth: 200,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'actions',
            sortable: false,
            renderCell: (params) => (
                <ActionMenu>
                    <MenuItem disableRipple onClick={handleEditProfile.bind(this, params.row)}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit profile</ListItemText>
                    </MenuItem>
                    <MenuItem disableRipple onClick={handleDeleteProfile.bind(this, params.row)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete profile</ListItemText>
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
            <h3 style={{marginTop: '0'}}>Arvan S3</h3>
            <Stack direction="row" justifyContent="space-between" sx={{marginBottom: '1rem'}}>
                <div>
                    <span style={{fontSize: '16px', fontWeight: '700'}}>Profiles</span>
                </div>
                <Button onClick={handleNewProfile} variant="contained" startIcon={<CloudIcon />}>Add profile</Button>
            </Stack>

            <ProfileDialog
                open={profileDialog.openProfileDialog}
                profile={profileDialog.detectedProfile}
                onClose={handleCloseProfileDialog}
            />

        </div>
    );


    return (
        <div style={{}}>

            {ToolBar}

            {profiles !== null &&
            <DataGrid
                pageSize={pageSize}
                disableSelectionOnClick={true}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                columns={columns}
                rows={profiles}
            />
            }
        </div>
    );
}

export default ProfilesList;