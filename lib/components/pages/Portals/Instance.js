/**
 * Manage Portal instance
 *
 * Portal Instance component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-09
 */
// Ouroboros modules
import { errors } from '@ouroboros/body';
import { Tree } from '@ouroboros/define';
import { Form } from '@ouroboros/define-mui';
import manage from '@ouroboros/manage';
import { combine, pathToTree, ucfirst } from '@ouroboros/tools';
// NPM modules
import PropTypes from 'prop-types';
import React, { useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// Composites
import BuildCommands from '../../composites/portal/BuildCommands';
// Local components
import Backups from './Backups';
import Build from './Build';
// Styles
const preBox = {
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '5px 0'
};
/**
 * Instance
 *
 * Handles Portal instance management
 *
 * @name Instance
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Instance({ name, onDeleted, onError, onUpdated, record, rights, tree }) {
    // State
    const [backups, backupsSet] = useState(false);
    const [build, buildSet] = useState(false);
    const [remove, removeSet] = useState(false);
    const [update, updateSet] = useState(false);
    const [updates, updatesSet] = useState();
    // Called when the delete button on a rest was clicked
    function deleteClick() {
        // Delete the existing rest
        manage.delete('portal', { name }).then((data) => {
            // If it was successful
            if (data) {
                // Hide the dialog
                removeSet(false);
                // Notify the parent
                onDeleted(name);
            }
        }, (error) => {
            if (onError) {
                onError(error);
            }
            else {
                throw new Error(JSON.stringify(error));
            }
        });
    }
    // Called when an update form is submitted
    function updateSubmit(portal) {
        // Create a new Promise and return it
        return new Promise((resolve, reject) => {
            // Update the portal on the server
            manage.update('portal', {
                name,
                record: portal
            }).then((data) => {
                // If we were successful
                if (data) {
                    // Hide the update mode
                    updateSet(false);
                    updatesSet(undefined);
                    // Notify the parent
                    onUpdated(name, portal);
                }
                // Resolve with the Form
                resolve(data);
            }, (error) => {
                if (error.code === errors.DATA_FIELDS) {
                    reject(pathToTree(error.msg).record);
                }
                else {
                    if (onError) {
                        onError(error);
                    }
                    else {
                        throw new Error(JSON.stringify(error));
                    }
                }
            });
        });
    }
    // Called when data is being updated (but not yet saved)
    function updateChange(value) {
        updatesSet(o => combine(o || record, value));
    }
    // Render
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, xs: 12, md: 6, xl: 4 },
            React.createElement(Paper, { className: "padding" },
                React.createElement(Box, { className: "flexColumns" },
                    React.createElement("h2", { className: "flexGrow" }, ucfirst(name)),
                    React.createElement(Box, { className: "flexStatic" },
                        rights.main.update &&
                            React.createElement(Tooltip, { title: "Updated Portal instance", className: "page_action", onClick: () => updateSet(b => {
                                    if (b) {
                                        updatesSet(undefined);
                                    }
                                    return !b;
                                }) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: 'fa-solid fa-edit' + (update ? ' open' : '') }))),
                        rights.main.delete &&
                            React.createElement(Tooltip, { title: "Remove Portal instance", className: "page_action", onClick: () => removeSet(b => !b) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: "fa-solid fa-trash-alt" }))))),
                update &&
                    React.createElement(Form, { gridSizes: { __default__: { xs: 12 } }, onCancel: () => {
                            updateSet(false);
                            updatesSet(undefined);
                        }, onChange: updateChange, onSubmit: updateSubmit, tree: tree, type: "update", value: record }),
                React.createElement(BuildCommands, { instance: updates || record, name: name, style: preBox }),
                update === false && rights.build.read &&
                    React.createElement(Box, { className: "actions" },
                        record.backups &&
                            React.createElement(Button, { color: "primary", onClick: () => backupsSet(true), variant: "contained" }, "Backups"),
                        React.createElement(Button, { color: "primary", onClick: () => buildSet(true), variant: "contained" }, "Build")))),
        backups &&
            React.createElement(Backups, { name: name, onClose: () => backupsSet(false), onError: onError, rights: rights.build }),
        build &&
            React.createElement(Build, { name: name, onClose: () => buildSet(false), onError: onError, record: record, rights: rights.build }),
        remove &&
            React.createElement(Dialog, { onClose: () => removeSet(false), open: true },
                React.createElement(DialogTitle, null, "Confirm Delete"),
                React.createElement(DialogContent, null,
                    React.createElement(Typography, null,
                        "Please confirm you wish to delete \"",
                        name,
                        "\".")),
                React.createElement(DialogActions, null,
                    React.createElement(Button, { color: "secondary", onClick: () => removeSet(false), variant: "contained" }, "Cancel"),
                    React.createElement(Button, { color: "primary", onClick: deleteClick, variant: "contained" }, "Delete")))));
}
// Valid props
Instance.propTypes = {
    name: PropTypes.string.isRequired,
    onDeleted: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onUpdated: PropTypes.func.isRequired,
    record: PropTypes.object.isRequired,
    rights: PropTypes.exact({
        main: PropTypes.exact({
            create: PropTypes.bool,
            delete: PropTypes.bool,
            read: PropTypes.bool,
            update: PropTypes.bool
        }).isRequired,
        build: PropTypes.exact({
            create: PropTypes.bool,
            delete: PropTypes.bool,
            read: PropTypes.bool,
            update: PropTypes.bool
        }).isRequired
    }).isRequired,
    tree: PropTypes.instanceOf(Tree).isRequired
};
