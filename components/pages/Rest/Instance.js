/**
 * Manage REST instance
 *
 * REST Instance component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-09
 */
// Ouroboros modules
import { errors } from '@ouroboros/body';
import { Tree } from '@ouroboros/define';
import manage from '@ouroboros/manage';
import RestDef from '@ouroboros/manage/define/rest.json';
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
// Generate the rest parent
const RestTree = new Tree(RestDef, { __name__: 'REST' });
/**
 * Instance
 *
 * Handles REST instance management
 *
 * @name Instance
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Instance({ name, onDeleted, onError, onUpdated, record, rights }) {
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
    function updateSubmit(rest, key) {
        // Create a new Promise and return it
        return new Promise((resolve, reject) => {
            // Update the rest on the server
            manage.update('rest', { name: key, ...rest }).then((data) => {
                // If we were successful
                if (data) {
                    // Notify the parent
                    onUpdated(key, rest);
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
                            React.createElement(Tooltip, { title: "Updated REST instance", className: "page_action", onClick: () => updateSet(b => (b ? false : { ...record })) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: 'fa-solid fa-edit' + (update ? ' open' : '') }))),
                        rights.delete &&
                            React.createElement(Tooltip, { title: "Remove REST instance", className: "page_action", onClick: () => removeSet(b => !b) },
                                React.createElement(IconButton, null,
                                    React.createElement("i", { className: "fa-solid fa-trash-alt" }))))),
                React.createElement(Grid, { container: true, spacing: 1 },
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Path")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.path),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Git checkout")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.git && record.git.checkout ? 'true' : 'false'),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Git submodules")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, record.git && record.git.checkout ? 'true' : 'false'),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Python path")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, (record.python && record.python.which) || ' '),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Python requirements")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, (record.python && record.python.requirements) || ' '),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 },
                        React.createElement("b", null, "Services")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 8 }, Object.keys(record.services).join(', '))))),
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
    }).isRequired
};
