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
import { Tree } from '@ouroboros/define'
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

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
export type InstanceStruct = {
	git?: {
		checkout?: boolean,
		submodule?: boolean
	},
	node?: {
		force_install?: string,
		nvm?: string
	},
	output: string,
	path: string
}
export type InstanceProps = {
	name: string,
	onDeleted: onDeletedCallback,
	onError: (error: responseErrorStruct) => void,
	onUpdated: onUpdatedCallback,
	record: InstanceStruct,
	rights: idStruct,
	tree: Tree
}
export type onDeletedCallback = (name: string) => void;
export type onUpdatedCallback = (name: string, rest: InstanceStruct) => void

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
export default function Instance({
	name, onDeleted, onError, onUpdated, record, rights, tree
}: InstanceProps) {

	// State
	const [ remove, removeSet ] = useState<boolean>(false);
	const [ update, updateSet ] = useState<boolean>(false);

	// Called when the delete button on a rest was clicked
	function deleteClick() {

		// Delete the existing rest
		manage.delete('rest', { name }).then((data: boolean) => {

			// If it was successful
			if(data) {

				// Hide the dialog
				removeSet(false)

				// Notify the parent
				onDeleted(name);
			}
		}, (error: responseErrorStruct) => {
			if(onError) {
				onError(error);
			} else {
				throw new Error(JSON.stringify(error));
			}
		});
	}

	// Called when an update form is submitted
	function updateSubmit(portal: any): Promise<boolean> {

		// Create a new Promise and return it
		return new Promise((resolve, reject) => {

			// Update the portal on the server
			manage.update('portal', {
				name,
				record: portal
			}).then((data: boolean) => {

				// If we were successful
				if(data) {

					// Hide the update mode
					updateSet(false);

					// Notify the parent
					onUpdated(name, portal);
				}

				// Resolve with the Form
				resolve(data);

			}, (error: responseErrorStruct) => {
				if(error.code === errors.DATA_FIELDS) {
					reject(error.msg);
				} else {
					if(onError) {
						onError(error);
					} else {
						throw new Error(JSON.stringify(error));
					}
				}
			});
		});
	}

	// Render
	return (<>
		<Grid item xs={12} md={6} xl={4}>
			<Paper className="padding">
				<Box className="flexColumns">
					<h2 className="flexGrow">{ucfirst(name)}</h2>
					<Box className="flexStatic">
						{rights.update &&
							<Tooltip title="Updated Portal instance" className="page_action" onClick={() => updateSet(b => !b)}>
								<IconButton>
									<i className={'fa-solid fa-edit' + (update ? ' open' : '')} />
								</IconButton>
							</Tooltip>
						}
						{rights.delete &&
							<Tooltip title="Remove Portal instance" className="page_action" onClick={() => removeSet(b => !b)}>
								<IconButton>
									<i className="fa-solid fa-trash-alt" />
								</IconButton>
							</Tooltip>
						}
					</Box>
				</Box>
				{update ? (
					<Form
						gridSizes={{ __default__: { xs:12 }}}
						onCancel={() => updateSet(false)}
						onSubmit={updateSubmit}
						tree={tree}
						type="update"
						value={record}
					/>
				) : (
					<Grid container spacing={1}>
						<Grid item xs={12} sm={4}>
							<b>Path</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.path}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Output</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.output}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Git checkout</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.git && record.git.checkout ? 'true' : 'false'}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Git submodules</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.git && record.git.checkout ? 'true' : 'false'}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Node - Force Install</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.node && record.node.force_install ? 'true' : 'false'}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Node - nvm</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{(record.node && record.node.nvm) || ' '}
						</Grid>
					</Grid>
				)}
			</Paper>
		</Grid>
		{remove &&
			<Dialog
				onClose={() => removeSet(false)}
				open={true}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>Please confirm you wish to delete "{name}".</Typography>
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={() => removeSet(false)} variant="contained">Cancel</Button>
					<Button color="primary" onClick={deleteClick} variant="contained">Delete</Button>
				</DialogActions>
			</Dialog>
		}
	</>);
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
}