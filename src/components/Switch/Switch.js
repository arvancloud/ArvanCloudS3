import React from 'react';
import MuiSwitch from '@mui/material/Switch';
import SwitchHandlerIcon from "../UI/Icons/SwitchHandlerIcon";
import CircularProgress from "@mui/material/CircularProgress";

function Switch(props) {

    const {onChange} = props;

    const [loading , setLoading] = React.useState(false);

    const handleChange = async (e) => {

        setLoading(true)

        await onChange(e);

        setLoading(false);
    };

    return (
        <MuiSwitch
            {...props}
            disableRipple
            checkedIcon={loading ? <CircularProgress size="15px" color="primary" /> : <SwitchHandlerIcon fontSize="1rem" />}
            icon={loading ? <CircularProgress size="15px" color="primary" /> : <SwitchHandlerIcon fontSize="1rem" />}
            sx={{
                padding: 0,
                height: '22px',
                '& .MuiSwitch-switchBase': {
                    borderRadius: '9px',
                    margin: '2px',
                    height: '18px',
                    backgroundColor: 'white',
                    width: '34px',
                    padding: 0,
                    ':hover': {
                        backgroundColor: 'white',
                    },
                    '.Mui-checked:hover': {
                        backgroundColor: 'white',
                    }
                },
                '& .MuiSwitch-track': {
                    borderRadius: '10px',
                }
            }}
            onChange={handleChange}
        />
    );

}

export default Switch;