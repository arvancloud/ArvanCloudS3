import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';


import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

function RTL(props) {
    return <CacheProvider value={cacheRtl}>{props.children}</CacheProvider>;
}


let theme = createTheme({
    direction: 'ltr',
    palette: {
        primary: {
            main: '#00baba',
            light: '#e6f8f8',
            dark: '#00a7a7',
            contrastText: '#fff'
        },
        secondary: {
            main: '#7a90aa',
        },
    },
    typography: {
        //fontFamily: 'YekanBakh',
    },
    components: {
        MuiButton: {
            defaultProps:{
                disableRipple: true
            },
            styleOverrides: {
                root: ({ownerState, theme}) => ({
                    fontSize: '0.87rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '0.75rem 1rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    minWidth: '6rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: `0 0 0 3px ${alpha(`${theme.palette[ownerState.color].main}`, 0.3)}`,

                    },
                    '&:active': ownerState.variant === 'contained' ? {
                        backgroundColor: theme.palette[ownerState.color].dark,
                        boxShadow: `0 0 0 3px ${alpha(`${theme.palette[ownerState.color].main}`, 0.3)}`,
                    } : {}
                }),
                outlined: {
                    borderWidth: '2px',
                    '&:hover': {
                        borderWidth: '2px'
                    }
                }
            },
        },
        MuiDialog: {
            styleOverrides: {
                container:{
                    backgroundColor: 'rgba(37,51,67,0.6)'
                },
                root: {

                },
                paper: {
                    borderRadius: '1rem',
                    boxShadow: 'none'
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: '700'
                }
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    gap: '0.5rem',
                    justifyContent: 'center',
                    paddingBottom: '1.5rem'
                }
            }
        }
    }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
          <App />
      </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
