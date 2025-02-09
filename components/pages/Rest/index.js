/**
 * Manage REST instances
 *
 * REST page
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-08
 */
// Ouroboros modules
import { errors } from '@ouroboros/body';
import { useRights } from '@ouroboros/brain-react';
import { Tree } from '@ouroboros/define';
import { DefineHash, Form } from '@ouroboros/define-mui';
import manage from '@ouroboros/manage';
import RestDef from '@ouroboros/manage/define/rest.json';
import { empty, omap, opop } from '@ouroboros/tools';
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
// Local components
import Instance from './Instance';
import Services from './Services';
// Generate the rest parent
DefineHash.pluginAdd('restServices', Services);
const RestTree = new Tree(RestDef, {
    __name__: 'REST',
    __ui__: {
        __create__: ['name', 'path', 'git', 'python', 'services']
    },
    name: { __type__: "string" },
    path: { __ui__: { __title__: 'Path to the repository' } },
    git: {
        __ui__: { __title__: "Git Options" },
        checkout: { __ui__: { __title__: 'Allow switching branches?' } },
        submodules: { __ui__: { __title__: 'Requires submodules?' } }
    },
    python: {
        __ui__: { __title__: "Python options" },
        which: { __ui__: { __title__: 'Path to python (optional)' } },
        requirements: { __ui__: { __title__: 'Path to requirements.txt (optional)' } }
    },
    services: {
        __ui__: { __type__: 'restServices' }
    }
});
/**
 * Rest
 *
 * Handles REST instance management
 *
 * @name Rest
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Rest({ onError, onSuccess }) {
    // State
    const [create, createSet] = useState(false);
    const [records, recordsSet] = useState({});
    // Hooks
    const rights = useRights('manage_rest');
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
        // Pull off the name
        const sName = opop(rest, 'name');
        // Create a new Promise and return it
        return new Promise((resolve, reject) => {
            // If it already exists
            if (sName in records) {
                return reject([['name', 'Already in use']]);
            }
            // Create the new rest
            manage.create('rest', {
                name: sName,
                record: rest
            }).then((data) => {
                // If we were successful
                if (data) {
                    // Notify the parent
                    onSuccess('create');
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
    // Called when a REST instance has been deleted
    function instanceDeleted(name) {
        // Get latest
        recordsSet(o => {
            if (name in o) {
                const oNew = { ...o };
                delete oNew[name];
                return oNew;
            }
            else {
                return o;
            }
        });
    }
    // Called when a REST instance has been updated
    function instanceUpdated(name, rest) {
        // Get latest
        recordsSet(o => {
            return { ...o, [name]: rest };
        });
    }
    // Render
    return (React.createElement(Box, { id: "manage_rest", className: "flexGrow padding" },
        React.createElement(Box, { className: "flexColumns" },
            React.createElement("h1", { className: "flexGrow" }, "Rest"),
            rights.create &&
                React.createElement(Box, { className: "flexStatic" },
                    React.createElement(Tooltip, { title: "Create new REST", className: "page_action", onClick: () => createSet(b => !b) },
                        React.createElement(IconButton, null,
                            React.createElement("i", { className: 'fa-solid fa-plus' + (create ? ' open' : '') }))))),
        create &&
            React.createElement(Paper, { className: "padding" },
                React.createElement(Form, { gridSizes: { __default__: { xs: 12 } }, onCancel: () => createSet(false), onSubmit: createSubmit, title: "Create Instance", tree: RestTree, type: "create" })),
        !empty(records) ? (React.createElement(Grid, { container: true }, omap(records, (o, k) => React.createElement(Instance, { key: k, name: k, onError: onError, onDeleted: instanceDeleted, onUpdated: instanceUpdated, record: o, rights: rights })))) : (React.createElement(Typography, null, "No REST instances found."))));
}
// Valid props
Rest.propTypes = {
    onError: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};
