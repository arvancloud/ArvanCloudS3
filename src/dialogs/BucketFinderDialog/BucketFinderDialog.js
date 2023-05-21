import React from 'react';
import Dialog from "../../components/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import BucketIcon from "../../components/UI/Icons/BucketIcon";
import ExpandMoreIcon from "../../components/UI/Icons/ExpandMoreIcon";
import CloudIcon from '@mui/icons-material/Cloud';

function BucketFinderDialog(props) {

    const {open, onClose, onSelectBucket} = props;

    const [profiles, setProfiles] = React.useState([]);

    const [selectedProfile , setSelectedProfile] = React.useState(null);

    const [expanded, setExpanded] = React.useState(null);

    const loadProfiles = async() => {

        try{
            setProfiles(await window.channel("Profiles@getProfiles"));
        }
        catch (e) {

            console.log(e);

            setProfiles([]);

        }

    }

    React.useEffect(() => {

        console.log("Bucket Finder Dialog mounted");

        loadProfiles();

        return () => {
            console.log("Bucket Finder Dialog un-mounted");
        }

    }, []);

    React.useEffect(() => {

        loadProfiles();
        setExpanded(null);

    }, [open]);

    const handleSelectBucket = async (bucket) => {

        onSelectBucket(bucket, selectedProfile);
        onClose();

    }

    const handleSelectProfile = (profile) => async (event, isExpanded) => {

        try{
            const buckets = await window.channel("Buckets@getBucketsWithAcl", profile);

            setSelectedProfile({...profile, buckets: buckets});
        }
        catch (e) {

            console.log(e);

            setSelectedProfile({...profile, buckets: []});

        }

        setExpanded(isExpanded ? `profile-${profile.id}` : null);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Pick a Bucket</DialogTitle>
            <DialogContent>
                {profiles.map((profile) => {
                    return (
                        <Accordion key={`profile-${profile.id}`} expanded={expanded === `profile-${profile.id}`} onChange={handleSelectProfile(profile)}>
                            <AccordionSummary
                                 expandIcon={<ExpandMoreIcon />}
                                 sx={{
                                     color: 'secondary.main'
                                 }}
                            >
                                <CloudIcon style={{marginRight: '1rem'}} /> {profile.title}
                            </AccordionSummary>
                            <AccordionDetails sx={{
                                color: 'primary.main'
                            }}>
                                {
                                    expanded === `profile-${profile.id}` &&
                                    <List>
                                        {selectedProfile.buckets.map(bucket =>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={handleSelectBucket.bind(this, bucket.Name)}>
                                                    <ListItemIcon sx={{ color: 'primary.main'}} >
                                                        <BucketIcon style={{fontSize: '1.3rem'}} />
                                                    </ListItemIcon>
                                                    <ListItemText primary={bucket.Name} />
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                    </List>
                                }
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="secondary" onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

}

export default BucketFinderDialog;