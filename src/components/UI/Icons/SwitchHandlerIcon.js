import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export default function SwitchHandlerIcon(props) {

    return (
        <SvgIcon {...props} viewBox="0 -3 16 16">
            <g transform="translate(-.134 .254)" fill="#e7ecf4">
                <rect width="3" height="3" rx="1.5" transform="translate(.134 5.746)"></rect>
                <rect width="3" height="3" rx="1.5" transform="translate(.134 -.254)"></rect>
                <rect width="3" height="3" rx="1.5" transform="translate(6.134 5.746)"></rect>
                <rect width="3" height="3" rx="1.5" transform="translate(6.134 -.254)"></rect>
                <rect width="3" height="3" rx="1.5" transform="translate(12.134 5.746)"></rect>
                <rect width="3" height="3" rx="1.5" transform="translate(12.134 -.254)"></rect>
            </g>
        </SvgIcon>
    );

}