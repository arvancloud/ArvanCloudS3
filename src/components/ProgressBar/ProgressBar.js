import React from 'react';
import MuiLinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

function ProgressBar(props) {

    return (
        <div style={{
            position: 'relative'
        }}>
            <Stack style={{position: 'absolute', right: '1rem', top: 0, left: '1rem', bottom: 0, zIndex: 3}} direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <span>{props.children}</span>
                <span style={{color: 'primary.main'}}>{props.percent.toFixed(1)}%</span>
            </Stack>

            <MuiLinearProgress
                variant="determinate"
                value={props.percent}
                sx={{
                    height: '50px',
                    borderRadius: '1rem',
                    backgroundColor: 'white',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'primary.light',
                    '& .MuiLinearProgress-bar1Determinate': {
                        backgroundColor: 'primary.light'
                    }
                }}
            />
        </div>
    );

}

export default ProgressBar;