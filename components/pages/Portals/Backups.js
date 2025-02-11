/**
 * Restore from backup
 *
 * Portal Backups component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-11
 */
// Ouroboros modules
import manage from '@ouroboros/manage';
import { owithout } from '@ouroboros/tools';
// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
// Styles
const preBox = {
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '5px 0'
};
/**
 * Backups
 *
 * Handles Portal backup management
 *
 * @name Backups
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Backups({ name, onClose, onError, rights }) {
    // State
    const [backups, backupsSet] = useState();
    const [restore, restoreSet] = useState({ backup: '' });
    const [restoring, restoringSet] = useState(false);
    const [output, outputSet] = useState();
    const [tab, tabSet] = useState(1);
    // Load / record effect
    useEffect(() => {
        // Clear details and output
        restoreSet({ backup: '' });
        backupsSet(undefined);
        restoringSet(false);
        outputSet(undefined);
        tabSet(1);
        // Fetch the details
        manage.read('portal/backups', { name }).then(backupsSet, onError);
    }, [name]);
    // Called to build the portal instance
    function submit() {
        // Hide restore button and clear any existing output
        restoringSet(true);
        outputSet(undefined);
        // Call the build creator request
        manage.create('portal/restore', { name, ...restore }).then(data => {
            if (data) {
                outputSet(data);
            }
        }, onError).finally(() => restoringSet(false));
    }
    // Render
    return (React.createElement(Dialog, { fullWidth: true, maxWidth: "sm", onClose: onClose, open: true },
        React.createElement(DialogTitle, null,
            "Restore Backup for ",
            name),
        output ? (React.createElement(React.Fragment, null,
            React.createElement(DialogContent, null,
                React.createElement(Tabs, { onChange: (ev, num) => tabSet(num), value: tab },
                    React.createElement(Tab, { label: "Commands" }),
                    React.createElement(Tab, { label: "Output" })),
                React.createElement(Box, { style: preBox },
                    React.createElement("pre", null, (tab === 0 &&
                        output.commands.split(' && ').join(' &&\n')) || (tab === 1 &&
                        output.output)))),
            React.createElement(DialogActions, null,
                React.createElement(Button, { color: "secondary", onClick: onClose, variant: "contained" }, "Close")))) : (React.createElement(React.Fragment, null,
            React.createElement(DialogContent, null, backups === undefined ?
                'Loading...' :
                React.createElement(Grid, { container: true, spacing: 2 },
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, "Select the backup to restore"),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement(Select, { native: true, onChange: ev => restoreSet(o => {
                                return { ...o, backup: ev.target.value };
                            }), value: restore.backup },
                            React.createElement("option", { value: "" }, "Select backup..."),
                            backups.map(s => React.createElement("option", { key: s, value: s }, s)))),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, "Backup the current code before restoring?"),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4, className: "actions" },
                        React.createElement(Switch, { checked: restore.backup_current || false, onChange: (ev, checked) => restoreSet(o => {
                                return checked ?
                                    { ...o, backup_current: true } :
                                    owithout(o, 'backup_current');
                            }) })))),
            React.createElement(DialogActions, null,
                React.createElement(Button, { color: "secondary", onClick: onClose, variant: "contained" }, "Cancel"),
                rights.create &&
                    React.createElement(Button, { disabled: restoring || restore.backup === '', color: "primary", onClick: submit, variant: "contained" }, "Restore"))))));
}
// Valid props
Backups.propTypes = {
    name: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    rights: PropTypes.exact({
        create: PropTypes.bool,
        delete: PropTypes.bool,
        read: PropTypes.bool,
        update: PropTypes.bool
    }).isRequired
};
