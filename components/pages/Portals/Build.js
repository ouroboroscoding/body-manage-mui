/**
 * Build Portal instance
 *
 * Portal Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */
import manage from '@ouroboros/manage';
import { owithout } from '@ouroboros/tools';
// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// Material UI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
/**
 * Build
 *
 * Handles Portal instance management
 *
 * @name Build
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Build({ name, onClose, onError, record, rights }) {
    // State
    const [build, buildSet] = useState({});
    const [details, detailsSet] = useState();
    // Load / record effect
    useEffect(() => {
        // Clear details
        detailsSet(undefined);
        // Fetch the details
        manage.read('portal/build', { name }).then(detailsSet, onError);
        // If we have backups
        if (record.backups && record.backups !== '') {
            buildSet(o => { return { ...o, backup: true }; });
        }
    }, [record]);
    // Called when the checkout branch changes
    function checkoutChanged(ev, c) {
        // If the new branch is the same as the original
        if (details.branch === ev.target.value) {
            buildSet(o => owithout(o, 'checkout'));
        }
        else {
            buildSet(o => { return { ...o, checkout: ev.target.value }; });
        }
    }
    // Called to build the portal instance
    function submit() {
        console.log('build');
    }
    // Render
    return (React.createElement(Dialog, { fullWidth: true, maxWidth: "sm", onClose: onClose, open: true },
        React.createElement(DialogTitle, null,
            "Build ",
            name),
        React.createElement(DialogContent, null, details === undefined ?
            'Loading...' : React.createElement(React.Fragment, null,
            React.createElement(Typography, null, "Status:"),
            React.createElement("textarea", { readOnly: true, rows: 10, style: { marginBottom: '10px', width: '100%' }, value: details.status }),
            React.createElement(Grid, { container: true, spacing: 1 },
                record.git.checkout && React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true, xs: 12, sm: 6 }, "Select the branch to pull"),
                    React.createElement(Grid, { item: true, xs: 12, sm: 6, className: "actions" },
                        React.createElement(Select, { label: "", onChange: checkoutChanged, native: true, size: "small", value: build.checkout || details.branch, variant: "outlined" }, details.branches.map((s) => React.createElement("option", { key: s, value: s }, s))))),
                (record.backups && record.backups !== '') && React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true, xs: 12, sm: 6 }, "Backup current files?"),
                    React.createElement(Grid, { item: true, xs: 12, sm: 6, className: "actions" },
                        React.createElement(Switch, { checked: build.backup, onChange: ev => buildSet(o => {
                                return { ...o, backup: ev.target.checked };
                            }), size: "small" })))))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "secondary", onClick: onClose, variant: "contained" }, "Cancel"),
            React.createElement(Button, { color: "primary", onClick: submit, variant: "contained" }, "Build"))));
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
