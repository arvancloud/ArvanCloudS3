import React from 'react';
import { DataGrid as MuiDataGrid, faIR } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';

function DataGrid(props) {

    const theme = useTheme();

    return (
        <MuiDataGrid
            {...props}
            autoHeight={true}
            rowHeight={67}
            disableColumnMenu={true}
            //localeText={faIR.components.MuiDataGrid.defaultProps.localeText}
            rowsPerPageOptions={[25, 15, 10, 5]}
            sortingOrder={['desc', 'asc']}
            sx={{
                border: 0,
                //backgroundColor: '#a90',
                "& .MuiDataGrid-checkboxInput": {
                    color: "#e9edf5",
                    ".MuiSvgIcon-root": {
                        fontSize: '1.3rem!important'
                    },
                    ".Mui-checked": {
                        color: "primary.main"
                    },
                    "&.Mui-disabled": {
                        color: "#ffffff"
                    },
                },
                "& .MuiDataGrid-virtualScroller": {
                    overflow: "hidden"
                },
                "& .MuiDataGrid-columnHeaders": {
                    borderBottom: "unset",
                    ".MuiDataGrid-columnHeader": {
                        outline: "unset"
                    }
                },
                "& .MuiDataGrid-footerContainer": {
                    borderTop: "unset"
                },
                '.MuiDataGrid-virtualScrollerContent': {
                    paddingBottom: (props.pageSize) + 'rem'
                },
                '& .MuiDataGrid-row': {
                    border: '1px solid #e9edf5',
                    width: `calc(100% - ${props.checkboxSelection ? '58px' : '8px'})`,
                    borderRadius: '16px',
                    ml: props.checkboxSelection ? '50px' : '0',
                    mb: '0.9rem',
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

                '& .MuiDataGrid-columnSeparator': {
                    visibility: 'hidden'
                },
                '& .MuiDataGrid-cellCheckbox': {
                    ml: props.checkboxSelection ? '-50px' : '0'
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