/**
 * Build Portal instance
 *
 * Portal Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */
// Ouroboros modules
import { iso } from '@ouroboros/dates';
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
import Typography from '@mui/material/Typography';
// Styles
const preBox = {
    overflow: 'auto',
    padding: '5px 0'
};
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
    const [build, buildSet] = useState({ clear: false });
    const [building, buildingSet] = useState(false);
    const [details, detailsSet] = useState();
    const [output, outputSet] = useState();
    const [tab, tabSet] = useState(1);
    // Load / record effect
    useEffect(() => {
        // Clear details and output
        buildSet({ clear: false });
        detailsSet(undefined);
        outputSet(undefined);
        tabSet(1);
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
        // Hide build button and clear any existing output
        buildingSet(true);
        outputSet(undefined);
        // Call the build creator request
        manage.create('portal/build', { name, ...build }).then(data => {
            if (data) {
                outputSet(data);
            }
        }, onError).finally(() => buildingSet(false));
    }
    // Build commands list
    const lCommands = [`cd ${record.path}`, 'git fetch'];
    if (build.clear) {
        lCommands.push('git checkout .');
    }
    if (build.checkout) {
        lCommands.push(`git checkout ${build.checkout}`);
    }
    lCommands.push(record.git.submodules ?
        'git pull --recurse-submodules' : 'git pull');
    if (record.node.nvm) {
        lCommands.push(`nvm use ${record.node.nvm}`);
    }
    lCommands.push(...[
        record.node.force_install ? 'npm install --force' : 'npm install',
        `npm run ${record.node.script || name}`
    ]);
    if (record.backups && build.backup) {
        lCommands.push(`mv ${record.web_root} ${record.backups}/${iso(new Date(), true, false, true)}`);
    }
    lCommands.push(...[
        `mkdir -p ${record.web_root}`,
        record.build ?
            `cp -r ${record.build}/* ${record.web_root}/.` :
            `cp -r ${record.path}/dist/* ${record.web_root}/.`
    ]);
    // Render
    return (React.createElement(Dialog, { fullWidth: true, maxWidth: "sm", onClose: onClose, open: true },
        React.createElement(DialogTitle, null,
            "Build ",
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
            React.createElement(DialogContent, null, details === undefined ?
                'Loading...' : React.createElement(React.Fragment, null,
                React.createElement(Typography, null, "Status:"),
                React.createElement("textarea", { readOnly: true, rows: 10, style: { marginBottom: '10px', width: '100%' }, value: details.status }),
                React.createElement(Grid, { container: true, spacing: 1 },
                    record.git.checkout && React.createElement(React.Fragment, null,
                        React.createElement(Grid, { item: true, xs: 12, sm: 6 }, "Select the branch to pull"),
                        React.createElement(Grid, { item: true, xs: 12, sm: 6, className: "actions" },
                            React.createElement(Select, { label: "", onChange: checkoutChanged, native: true, size: "small", value: build.checkout || details.branch, variant: "outlined" }, details.branches.map((s) => React.createElement("option", { key: s, value: s }, s))))),
                    React.createElement(Grid, { item: true, xs: 12, sm: 6 }, "Clear local changes before pulling?"),
                    React.createElement(Grid, { item: true, xs: 12, sm: 6, className: "actions" },
                        React.createElement(Switch, { checked: build.clear, onChange: ev => buildSet(o => {
                                return { ...o, clear: ev.target.checked };
                            }), size: "small" })),
                    (record.backups && record.backups !== '') && React.createElement(React.Fragment, null,
                        React.createElement(Grid, { item: true, xs: 12, sm: 6 }, "Backup current files?"),
                        React.createElement(Grid, { item: true, xs: 12, sm: 6, className: "actions" },
                            React.createElement(Switch, { checked: build.backup, onChange: ev => buildSet(o => {
                                    return { ...o, backup: ev.target.checked };
                                }), size: "small" })))),
                React.createElement("hr", null),
                React.createElement(Typography, null, "Preview"),
                React.createElement(Box, { style: preBox },
                    React.createElement("pre", null, lCommands.join(' &&\n'))))),
            React.createElement(DialogActions, null,
                React.createElement(Button, { color: "secondary", onClick: onClose, variant: "contained" }, "Cancel"),
                React.createElement(Button, { disabled: building, color: "primary", onClick: submit, variant: "contained" }, "Build"))))));
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
