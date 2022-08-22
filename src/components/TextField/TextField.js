import React from 'react';
import MuiTextFiled from '@mui/material/TextField';
import { alpha, useTheme } from '@mui/material/styles';

function TextField(props) {

    const theme = useTheme();

    return (
        <MuiTextFiled {...props} sx={{
            marginTop: '40px',
            '.MuiInputLabel-root':{
                top: '-17px',
                fontSize: '20px',
                fontWeight: '200',
            },
            '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f7fa',
                borderRadius: '0.75rem',
                '& fieldset': {
                    top: 0,
                    borderWidth: '1px',
                    borderColor: '#f5f7fa',
                    //overflow: 'hidden',
                    borderRadius: '0.75rem',
                    '& legend': {
                        display: 'none'
                    }
                },
                '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                },
                '&.Mui-focused fieldset': {
                    boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 12px 24px -8px`,
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                },
                '&.Mui-focused': {
                    backgroundColor: 'white',
                },
            }
        }} InputLabelProps={{shrink: true}} />
    );

}

export default TextField;