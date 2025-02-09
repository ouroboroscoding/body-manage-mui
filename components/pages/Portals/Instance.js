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
import { ucfirst } from '@ouroboros/tools';
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
    const [remove, removeSet] = useState(false);
    const [update, updateSet] = useState(false);
    // Called when the delete button on a rest was clicked
    function deleteClick() {
        // Delete the existing rest
        manage.delete('rest', { name }).then((data) => {
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
                    // Notify the parent
                    onUpdated(name, portal);
                }
                // Resolve with the Form
                resolve(data);
            }, (error) => {
                if (error.code === errors.DATA_FIELDS) {
                    reject(error.msg);
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
    // Render
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, xs: 12, md: 6, xl: 4 },
            React.createElement(Paper, { className: "padding" },
                React.createElement(Box, { className: "flexColumns" },
                    React.createElement("h2", { className: "flexGrow" }, ucfirst(name)),
                    React.createElement(Box, { className: "flexStatic" },
                        rights.update &&
                            React.createElement(Tooltip, { title: "Updated Portal instance", className: "page_action", onClick: () => updateSet(b => !b) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: 'fa-solid fa-edit' + (update ? ' open' : '') }))),
                        rights.delete &&
                            React.createElement(Tooltip, { title: "Remove Portal instance", className: "page_action", onClick: () => removeSet(b => !b) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: "fa-solid fa-trash-alt" }))))),
                update ? (React.createElement(Form, { gridSizes: { __default__: { xs: 12 } }, onCancel: () => updateSet(false), onSubmit: updateSubmit, tree: tree, type: "update", value: record })) : (React.createElement(Grid, { container: true, spacing: 1 },
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Path")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.path),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Output")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.output),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Git checkout")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.git && record.git.checkout ? 'true' : 'false'),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Git submodules")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.git && record.git.checkout ? 'true' : 'false'),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Node - Force Install")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.node && record.node.force_install ? 'true' : 'false'),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Node - nvm")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, (record.node && record.node.nvm) || ' '))))),
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
        create: PropTypes.bool,
        delete: PropTypes.bool,
        read: PropTypes.bool,
        update: PropTypes.bool
    }).isRequired,
    tree: PropTypes.instanceOf(Tree).isRequired
};
