/**
 * Manage Portals
 *
 * Portals page
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-08
 */
// Ouroboros modules
import { errors } from '@ouroboros/body';
import { useRights } from '@ouroboros/brain-react';
import { Tree } from '@ouroboros/define';
import { Form } from '@ouroboros/define-mui';
import manage from '@ouroboros/manage';
import PortalDef from '@ouroboros/manage/define/rest.json';
import { empty, omap, opop, ucfirst } from '@ouroboros/tools';
// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// Generate the rest parent
const PortalTree = new Tree(PortalDef, { __name__: 'Portals' });
/**
 * Portals
 *
 * Handles Portals management
 *
 * @name Portals
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Portals({ onError, onSuccess }) {
    // State
    const [create, createSet] = useState(false);
    const [records, recordsSet] = useState({});
    // Hooks
    const rights = useRights('manage_portal');
    // User / archived change effect
    useEffect(() => {
        // If we have read rights
        if (rights.read) {
            manage.read('rest').then(recordsSet);
        }
        else {
            recordsSet({});
        }
        // If we don't have create rights
        if (!rights.create) {
            createSet(false);
        }
    }, [rights]);
    // Called when a create form is submitted
    function createSubmit(rest) {
        // Create a new Promise and return it
        return new Promise((resolve, reject) => {
            // Create the new rest
            manage.create('rest', rest).then((data) => {
                // If we were successful
                if (data) {
                    // Notify the parent
                    onSuccess('create');
                    // Pop off the name
                    const sName = opop(rest, 'name');
                    // Close the create form
                    createSet(false);
                    // Clone the records, add the new one, and set the new
                    //	records
                    const oRecords = { ...records };
                    oRecords[sName] = rest;
                    recordsSet(oRecords);
                }
                // Resolve with the form
                resolve(data ? true : false);
            }, (error) => {
                if (error.code === errors.DB_DUPLICATE) {
                    reject([['name', 'Already in use']]);
                }
                else if (error.code === errors.DATA_FIELDS) {
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
    // Called when the delete button on a rest was clicked
    function deleteClick(key) {
        // Delete the existing rest
        manage.delete('rest', { name: key }).then((data) => {
            // If it was successful
            if (data) {
                // Notify the parent
                onSuccess('delete');
                // Remove the entry and store the new records
                recordsSet(o => {
                    if (key in o) {
                        const oNew = { ...o };
                        delete oNew[key];
                        return oNew;
                    }
                    else {
                        return o;
                    }
                });
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
                    onSuccess('update');
                    recordsSet(o => {
                        if (key in o) {
                            const oNew = { ...o };
                            oNew[key] = rest;
                            return oNew;
                        }
                        else {
                            return o;
                        }
                    });
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
    return (React.createElement(Box, { id: "manage_portals", className: "flexGrow padding" },
        React.createElement(Box, { className: "flexColumns" },
            React.createElement("h1", { className: "flexGrow" }, "Portal"),
            rights.create &&
                React.createElement(Box, { className: "flexStatic" },
                    React.createElement(Tooltip, { title: "Create new Portal", className: "page_action", onClick: () => createSet(b => !b) },
                        React.createElement(IconButton, null,
                            React.createElement("i", { className: 'fa-solid fa-plus' + (create ? ' open' : '') }))))),
        create &&
            React.createElement(Paper, { className: "padding" },
                React.createElement(Form, { onCancel: () => createSet(false), onSubmit: createSubmit, tree: PortalTree, type: "create" })),
        !empty(records) ? (React.createElement(Grid, { container: true }, omap(records, (v, k) => React.createElement(Grid, { item: true, key: k, xs: 12, sm: 2, md: 3, lg: 4, xl: 5 },
            React.createElement(Paper, { className: "padding" },
                React.createElement("h2", null, ucfirst(k)),
                React.createElement("pre", null, JSON.stringify(v, null, 4))))))) : (React.createElement(Typography, null, "No REST instances found."))));
}
// Valid props
Portals.propTypes = {
    onError: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};
