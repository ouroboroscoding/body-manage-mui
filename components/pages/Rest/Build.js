/**
 * Build REST instance
 *
 * REST Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */
import manage from '@ouroboros/manage';
// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// Material UI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
/**
 * Build
 *
 * Handles REST instance management
 *
 * @name Build
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Build({ name, onClose, onError, record, rights }) {
    // State
    const [build, buildSet] = useState({});
    const [details, detailsSet] = useState(false);
    // Load / record effect
    useEffect(() => {
        // Fetch the details
        manage.read('rest/build', { name }).then(detailsSet, onError);
    }, [record]);
    // Called to build the rest instance
    function submit() {
        console.log('build');
    }
    // Render
    return (React.createElement(Dialog, { onClose: onClose, open: true },
        React.createElement(DialogTitle, null,
            "Build ",
            name),
        React.createElement(DialogContent, null,
            React.createElement("pre", null, JSON.stringify(details, null, 4))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "secondary", onClick: onClose, variant: "contained" }, "Cancel"),
            React.createElement(Button, { color: "primary", onClick: submit, variant: "contained" }, "Delete"))));
}
// Valid props
Build.propTypes = {
    name: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    record: PropTypes.object.isRequired,
    rights: PropTypes.exact({
        create: PropTypes.bool,
        delete: PropTypes.bool,
        read: PropTypes.bool,
        update: PropTypes.bool
    }).isRequired
};
