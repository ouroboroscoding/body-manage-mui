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
import { pathToTree, ucfirst } from '@ouroboros/tools';

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

// Local components
import Backups from './Backups';
import Build from './Build';

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
export type InstanceStruct = {
	backups?: string,
	build?: string,
	git: {
		checkout: boolean,
		submodules: boolean
	},
	node: {
		force_install: string,
		nvm?: string,
		script?: string
	},
	path: string,
	web_root: string
}
export type InstanceProps = {
	name: string,
	onDeleted: onDeletedCallback,
	onError: (error: responseErrorStruct) => void,
	onUpdated: onUpdatedCallback,
	record: InstanceStruct,
	rights: {
		main: idStruct
		build: idStruct
	},
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
	const [ backups, backupsSet ] = useState<boolean>(false);
	const [ build, buildSet ] = useState<boolean>(false);
	const [ remove, removeSet ] = useState<boolean>(false);
	const [ update, updateSet ] = useState<boolean>(false);

	// Called when the delete button on a rest was clicked
	function deleteClick() {

		// Delete the existing rest
		manage.delete('portal', { name }).then((data: boolean) => {

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
					reject(pathToTree(error.msg).record);
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

	// Generate run / build commands
	const aGit = [];
	if(record.git.checkout) {
		aGit.push('git checkout [branch]')
	}
	aGit.push(record.git.submodules ?
		'git pull --recurse-submodules' : 'git pull'
	)
	const aNode = [];
	if(record.node.nvm) {
		aNode.push(`nvm use ${record.node.nvm}`);
	}
	aNode.push(record.node.force_install ?
		'npm install --force' : 'npm install'
	)
	aNode.push(`npm run ${record.node.script || 'build'}`)

	// Render
	return (<>
		<Grid item xs={12} md={6} xl={4}>
			<Paper className="padding">
				<Box className="flexColumns">
					<h2 className="flexGrow">{ucfirst(name)}</h2>
					<Box className="flexStatic">
						{rights.main.update &&
							<Tooltip title="Updated Portal instance" className="page_action" onClick={() => updateSet(b => !b)}>
								<IconButton>
									<i className={'fa-solid fa-edit' + (update ? ' open' : '')} />
								</IconButton>
							</Tooltip>
						}
						{rights.main.delete &&
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
				) : (<>
					<Grid container spacing={1}>
						<Grid item xs={12} sm={4}>
							<b>Path</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.path}
						</Grid>
						{record.build && <>
							<Grid item xs={12} sm={4}>
								<b>Build path</b>
							</Grid>
							<Grid item xs={12} sm={8}>
								{record.build}
							</Grid>
						</>}
						<Grid item xs={12} sm={4}>
							<b>Web root</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{record.web_root}
						</Grid>
						{record.backups && <>
							<Grid item xs={12} sm={4}>
								<b>Backups path</b>
							</Grid>
							<Grid item xs={12} sm={8}>
								{record.backups}
							</Grid>
						</>}
						<Grid item xs={12} sm={4}>
							<b>Git</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{aGit.join(' && ')}
						</Grid>
						<Grid item xs={12} sm={4}>
							<b>Node</b>
						</Grid>
						<Grid item xs={12} sm={8}>
							{aNode.join(' && ')}
						</Grid>
					</Grid>
					{rights.build.read &&
						<Box className="actions">
							{record.backups &&
								<Button
									color="primary"
									onClick={() => backupsSet(true)}
									variant="contained"
								>Backups</Button>
							}
							<Button
								color="primary"
								onClick={() => buildSet(true)}
								variant="contained"
							>Build</Button>
						</Box>
					}
				</>)}
			</Paper>
		</Grid>
		{backups &&
			<Backups
				name={name}
				onClose={() => backupsSet(false)}
				onError={onError}
				rights={rights.build}
			/>
		}
		{build &&
			<Build
				name={name}
				onClose={() => buildSet(false)}
				onError={onError}
				record={record}
				rights={rights.build}
			/>
		}
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
}