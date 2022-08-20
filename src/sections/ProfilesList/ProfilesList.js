import React from "react";
import Box from '@mui/material/Box';
import ProfileDialog from "../../dialogs/ProfileDialog/ProfileDialog";
import { useNavigate } from "react-router-dom";
import LayoutContext from "../../contexts/LayoutContext";
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import MenuItem from "@mui/material/MenuItem";

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

    const [profileDialog , setProfileDialog] = React.useState({
        detectedProfile: profile,
        openProfileDialog: false
    });

    const [profiles, setProfiles] = React.useState([]);

    const loadProfiles = async() => {

        try{
            const rows = await window.channel("Profiles@getProfiles");

            setProfiles(rows);
        }
        catch (e) {

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

                try{

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
        width: 150,
        height: 150,
        display: 'inline-block',
        //backgroundColor: 'primary.dark',
        backgroundColor: '#e6f8f8',
        borderRadius: '1rem',
        '&:hover': {
            //backgroundColor: 'primary.main',
            opacity: [0.9, 0.8, 0.7],
        },
    };

    return (
        <div style={{height: 500, width: '100%'}}>

            {
                profiles.map((profile) => {
                    return (
                        <Box key={profile.id} sx={sx} onClick={handleShowBuckets.bind(this, profile)}>
                            <ActionMenu>
                                <MenuItem onClick={handleEditProfile.bind(this, profile)}>edit</MenuItem>
                                <MenuItem onClick={handleDeleteProfile.bind(this, profile)}>delete</MenuItem>
                            </ActionMenu>
                            <span >{profile.title}</span>
                        </Box>
                    )
                })
            }
            <Box
                sx={{
                    ...sx,
                    border: '.125rem dashed #00baba'
                }}
                onClick={handleNewProfile}
            >
                <span>افزودن پروفایل جدید</span>
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