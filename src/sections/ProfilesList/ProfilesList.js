import React from "react";
import Box from '@mui/material/Box';
import ProfileDialog from "../../dialogs/ProfileDialog/ProfileDialog";
import { useNavigate } from "react-router-dom";
import LayoutContext from "../../contexts/LayoutContext";
import MenuItem from "@mui/material/MenuItem";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

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

    const loadProfiles = async () => {

        try {
            const rows = await window.channel("Profiles@getProfiles");

            setProfiles(rows);
        } catch (e) {

            console.log(e);

            layout.notify("خطا در دریافت پروفایل ها", {
                severity: "error"
            });

            setProfiles([]);

        }

    }

    console.log("ProfilesList rendered");

    React.useEffect(() => {

        console.log("ProfilesList mounted");

        loadProfiles();

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
        event.stopPropagation();
        setProfileDialog({
            openProfileDialog: true,
            detectedProfile: profile
        });
    }

    const handleDeleteProfile = (profile, event) => {
        event.stopPropagation();
        layout.confirm({
            title: "حذف پروفایل",
            content: (
                <span>
                    آیا از حذف پروفایل {profile.title} مطمئن هستید؟
                </span>
            ),
            onConfirm: async () => {

                try {

                    await window.channel("Profiles@deleteProfile", profile);

                    layout.notify("پروفایل مورد نظر با موفقیت حذف شد", {
                        severity: "success"
                    });

                    loadProfiles();

                }
                catch (e) {

                    console.log(e);

                    layout.notify("خطا در حذف پروفایل", {
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

    const sx = {
        cursor: 'pointer',
        position: 'relative',
        //flex: 1,
        width: 150,
        height: 150,
        display: 'inline-block',
        backgroundColor: 'primary.light',
        borderWidth: '.125rem',
        borderStyle: 'solid',
        borderColor: 'primary.light',
        borderRadius: '1rem',
        color: 'primary.main',
        '&:hover': {
            borderColor: 'primary.main',
            //backgroundColor: 'primary.main',
        },
        '.profile-menu': {
            position: 'absolute',
            left: 0,
            top: 0
        },
        '.profile-title': {
            display: 'inline-block',
            marginTop: '35%',
        }
    };

    return (
        <div style={{
            //minHeight: '50vh',
            width: '100%',
            display: "flex",
            gap: '1rem',
            justifyContent: "flex-start",
            flexWrap: 'wrap',
            alignContent: 'center'
        }}>

            {
                profiles.map((profile) => {
                    return (
                        <Box key={profile.id} sx={sx} onClick={handleShowBuckets.bind(this, profile)}>
                            <ProfileMenu>
                                <MenuItem disableRipple onClick={handleEditProfile.bind(this, profile)}>
                                    <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>ویرایش پروفایل</ListItemText>
                                </MenuItem>
                                <MenuItem disableRipple onClick={handleDeleteProfile.bind(this, profile)}>
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>حذف پروفایل</ListItemText>
                                </MenuItem>
                            </ProfileMenu>
                            <span className="profile-title">{profile.title}</span>
                        </Box>
                    )
                })
            }
            <Box
                sx={{
                    ...sx,
                    borderStyle: 'dashed',
                    borderColor: 'primary.main',
                }}
                onClick={handleNewProfile}
            >
                <span className="profile-title">افزودن پروفایل جدید</span>
            </Box>

            <ProfileDialog
                open={profileDialog.openProfileDialog}
                profile={profileDialog.detectedProfile}
                onClose={handleCloseProfileDialog}
            />

        </div>
    );
}

export default ProfilesList;