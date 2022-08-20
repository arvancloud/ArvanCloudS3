import React from 'react';
import { DataGrid as MuiDataGrid, faIR } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';

function DataGrid(props) {

    const theme = useTheme();

    return (
        <MuiDataGrid
            {...props}
            disableColumnMenu={true}
            localeText={faIR.components.MuiDataGrid.defaultProps.localeText}
            rowsPerPageOptions={[25, 15, 10, 5]}
            sx={{
                border: 0,
                backgroundColor: 'white',
                '& .MuiDataGrid-row': {
                    borderColor: 'yellow',
                    borderStyle: 'solid',
                    border: '1px solid #000',
                    borderRadius: '16px',
                    ml: '50px',
                    mb: '8px',
                    '&:hover': {
                        backgroundColor: 'unset'
                    }
                },
                '& .MuiDataGrid-row.Mui-selected': {
                    borderColor: 'primary.main',
                    boxShadow: `0 4px 9px ${alpha(theme.palette.primary.main, 0.2)}`,
                    backgroundColor: 'unset',
                    '&:hover': {
                        backgroundColor: 'unset'
                    }
                },

                '& > .MuiDataGrid-columnSeparator': {
                    visibility: 'hidden'
                },
                '& .MuiDataGrid-cellCheckbox': {
                    ml: '-50px'
                },
                '& .MuiDataGrid-cell': {
                    borderBottom: 'unset',
                    '&:focus': {
                        outline: 'unset'
                    },
                    '&:focus-within': {
                        outline: 'unset'
                    }
                }
            }}
        />
    );
}

export default DataGrid;