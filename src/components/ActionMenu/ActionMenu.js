import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import ExpandMoreIcon from "../UI/Icons/ExpandMoreIcon";

export default function ActionMenu(props) {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event) => {
        event.stopPropagation();
        setAnchorEl(null);
    };

    return (
        <span style={{display: 'inline-block'}}>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                startIcon={<ExpandMoreIcon />}
                disabled={props.disabled}
                sx={{
                    fontWeight: 700,
                    color: 'black',
                    borderWidth: '0',
                    borderRadius: '8px',
                    '&:hover': {
                        borderWidth: '1px',
                        color: 'primary.main'
                    },
                    '&:focus': {
                        borderWidth: '1px',
                        boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
                    },
                }}
            >
                {props.buttonTitle ? props.buttonTitle : "Action"}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClick={handleClose}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {props.children}
            </Menu>
        </span>
    );
}
