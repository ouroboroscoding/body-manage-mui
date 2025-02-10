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
import { isObject, omap, owithout } from '@ouroboros/tools';

// NPM modules
import React from 'react';

// Material UI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Types
import type { DefineNodeBaseProps } from '@ouroboros/define-mui';
import { DefineNodeBaseState } from '@ouroboros/define-mui/build/DefineNode/Base';
export type ServicesStruct = {
	[x: string]: {
		supervisor?: string
	}
}

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

	// Define refs
	declare key: React.RefObject<DefineNode>
	declare supervisor: React.RefObject<DefineNode>

	// Prop type
	declare props: DefineNodeBaseProps;

	// State
	declare state: {
		create: {
			key: string,
			supervisor: string
		}
	} & DefineNodeBaseState;

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
	constructor(props: DefineNodeBaseProps) {

		// Call parent
		super(props);

		// Init refs
		this.key = React.createRef<DefineNode>();
		this.supervisor = React.createRef<DefineNode>();

		// Bind methids
		this.add = this.add.bind(this);
		this.remove = this.remove.bind(this);
	}

	/**
	 * Add
	 */
	add() {

		// Get the values
		const sKey = (this.key!.current!.value || '').trim();
		const sSupervisor = (this.supervisor!.current!.value || '').trim();

		// If the value is empty
		if(sKey === '') {
			return;
		}

		// Set the value based on whether we have a
		const oValue = (sSupervisor === '') ? { } : { supervisor: sSupervisor };

		// Set the new value and reset the create
		this.setState({
			error: false,
			value: {
				...this.state.value,
				[sKey]: oValue
			}
		});

		// Clear the nodes
		this.key!.current!.reset();
		this.supervisor!.current!.reset();
	}

	/**
	 * Remove
	 */
	remove(key: string) {

		// Set the new state without the key
		this.setState({
			error: false,
			value: owithout(this.state.value, key)
		});
	}

	/**
	 * Render
	 */
	render() {
		return (<Grid container spacing={1}>
			{omap(this.state.value, (o, k) => {
				return o === null ? null :
				<React.Fragment key={k}>
					<Grid item xs={4}>
						{k}
						{(this.state.error !== false &&
							k in (this.state.error as Record<string, any>) &&
							typeof (this.state.error as Record<string, any>)[k] === 'string') &&
							<Box className="error">
								{(this.state.error as Record<string, any>)[k]}
							</Box>
						}
					</Grid>
					<Grid item xs={7}>
						{o.supervisor || ''}
						{(this.state.error !== false &&
							k in (this.state.error as Record<string, any>) &&
							isObject((this.state.error as Record<string, any>)[k]) &&
							'supervisor' in (this.state.error as Record<string, any>)[k]) &&
							<Box className="error">
								{(this.state.error as Record<string, any>)[k].supervisor}
							</Box>
						}
					</Grid>
					<Grid item xs={1}>
						<Tooltip title="Remove Service" onClick={() => this.remove(k)}>
							<IconButton>
								<i className="fa-solid fa-trash-alt" />
							</IconButton>
						</Tooltip>
					</Grid>
				</React.Fragment>
			})}
			<Grid item xs={12} md={5}>
				<DefineNode
					name="key"
					node={KeyNode}
					ref={this.key}
					type="create"
				/>
			</Grid>
			<Grid item xs={11} md={6}>
				<DefineNode
					name="supervisor"
					node={SupervisorNode}
					ref={this.supervisor}
					type="create"
				/>
			</Grid>
			<Grid item xs={1}>
				<Tooltip title="Add Service" className="page_action" onClick={this.add}>
					<IconButton>
						<i className="fa-solid fa-add" />
					</IconButton>
				</Tooltip>
			</Grid>
		</Grid>);
	}
}