/**
 * REST Services
 *
 * Handles special define-mui component for services hash
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-09
 */
// Ouroboros modules
import { Node } from '@ouroboros/define';
import { DefineNodeBase, DefineNode } from '@ouroboros/define-mui';
import RestDef from '@ouroboros/manage/define/rest.json';
import { omap, owithout } from '@ouroboros/tools';
// NPM modules
import React from 'react';
// Material UI
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// Create the name and supervisor nodes
const KeyNode = new Node(RestDef.services.__hash__);
const SupervisorNode = new Node(RestDef.services.supervisor);
/**
 * Services
 *
 * Handles REST hash of services
 *
 * @name Services
 * @access public
 * @extends DefineNodeBase
 */
export default class Services extends DefineNodeBase {
    /**
     * Constructor
     *
     * Creates a new instance
     *
     * @name Services
     * @access public
     * @param props Properties passed to the component
     * @returns a new instance
     */
    constructor(props) {
        // Call parent
        super(props);
        // Init refs
        this.key = React.createRef();
        this.supervisor = React.createRef();
        // Bind methids
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
    }
    /**
     * Add
     */
    add() {
        console.log(this.key);
        console.log(this.supervisor);
        // Get the values
        const sKey = (this.key.current.value || '').trim();
        const sSupervisor = (this.supervisor.current.value || '').trim();
        // If the value is empty
        if (sKey === '') {
            return;
        }
        // Set the value based on whether we have a
        const oValue = (sSupervisor === '') ? {} : { supervisor: sSupervisor };
        // Set the new value and reset the create
        this.setState({
            value: {
                ...this.state.value,
                [sKey]: oValue
            }
        });
        // Clear the nodes
        this.key.current.reset();
        this.supervisor.current.reset();
    }
    /**
     * Remove
     */
    remove(key) {
        // Set the new value by removing the key from the value
        this.setState({
            value: owithout(this.state.value, key)
        });
    }
    /**
     * Render
     */
    render() {
        return (React.createElement(Grid, { container: true, spacing: 1 },
            omap(this.state.value, (o, k) => React.createElement(React.Fragment, { key: k },
                React.createElement(Grid, { item: true, xs: 4 }, k),
                React.createElement(Grid, { item: true, xs: 7 }, o.supervisor || ''),
                React.createElement(Grid, { item: true, xs: 1 },
                    React.createElement(Tooltip, { title: "Remove Service", onClick: () => this.remove(k) },
                        React.createElement(IconButton, null,
                            React.createElement("i", { className: "fa-solid fa-trash-alt" })))))),
            React.createElement(Grid, { item: true, xs: 12, md: 5 },
                React.createElement(DefineNode, { name: "key", node: KeyNode, ref: this.key, type: "create" })),
            React.createElement(Grid, { item: true, xs: 11, md: 6 },
                React.createElement(DefineNode, { name: "supervisor", node: SupervisorNode, ref: this.supervisor, type: "create" })),
            React.createElement(Grid, { item: true, xs: 1 },
                React.createElement(Tooltip, { title: "Add Service", className: "page_action", onClick: this.add },
                    React.createElement(IconButton, null,
                        React.createElement("i", { className: "fa-solid fa-add" }))))));
    }
}
