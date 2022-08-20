import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';

let theme = createTheme({
    // direction: 'rtl',
    palette: {
        primary: {
            main: '#00baba',
            contrastText: '#fff'
        },
        secondary: {
            main: '#7a90aa',
        },
    },
    typography: {
        fontFamily: 'YekanBakh',
    },
    components: {
        MuiButton: {
            defaultProps:{
                disableRipple: true
            },
            styleOverrides: {
                root: {
                    fontSize: '0.87rem',
                    fontWeight: 500,
                    padding: '0.75rem 1rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    minWidth: '6rem'
                },
                outlined: {
                    borderWidth: '2px',
                    // '&:hover': {
                    //     borderWidth: '2px',
                    // }
                }
            },
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
      <ThemeProvider theme={theme}><App /></ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
