/**
 * Manage Portal instances
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
import { Tree } from '@ouroboros/define'
import { Form } from '@ouroboros/define-mui';
import manage from '@ouroboros/manage';
import RestDef from '@ouroboros/manage/define/portal.json';
import { combine, empty, omap, opop, pathToTree } from '@ouroboros/tools';

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

// Generate the portal parent
const RestTree = new Tree(RestDef, {
	__name__: 'Portal',
	__ui__: {
		__create__: [ 'name', 'path', 'build', 'web_root', 'backups', 'git', 'node' ],
		__update__: [ 'path', 'build', 'web_root', 'backups', 'git', 'node' ]
	},
	name: { __type__: "string" },
	path: { __ui__: { __title__: 'Path to the repository' } },
	build: { __ui__: { __title__: 'Path to build folder' } },
	web_root: { __ui__: { __title__: 'Path to copy files after build' } },
	backups: { __ui__: { __title__: 'Backups folder' } },
	git: {
		__ui__: { __title__: "Git Options" },
		checkout: { __ui__: { __title__: 'Allow switching branches?' } },
		submodules: { __ui__: { __title__: 'Requires submodules?' } }
	},
	node: {
		__ui__: { __title__: "Node options" },
		force_install: { __ui__: { __title__: '--force on install' } },
		nvm: { __ui__: { __title__: 'nvm alias (optional)' } },
		script: { __ui__: { __title__: 'npm run script' } }
	}
});

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { InstanceStruct } from '../../../types/portal';
export type PortalsProps = {
	onError: (error: responseErrorStruct) => void,
	onSuccess: (type: string) => void
}

/**
 * Portals
 *
 * Handles Portal instance management
 *
 * @name Portals
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Portals({ onError, onSuccess }: PortalsProps) {

	// State
	const [ create, createSet ] = useState<boolean>(false);
	const [ records, recordsSet ] = useState<Record<string, InstanceStruct>>({});

	// Hooks
	const rights = useRights('manage_portal');
	const rbuild = useRights('manage_portal_build');

	// User / archived change effect
	useEffect(() => {

		// If we have read rights
		if(rights.read) {
			manage.read('portals').then(recordsSet);
		} else {
			recordsSet({});
		}

		// If we don't have create rights
		if(!rights.create) {
			createSet(false);
		}

	}, [ rights ]);

	// Called when a create form is submitted
	function createSubmit(portal: any): Promise<boolean> {

		// Pull off the name
		const sName = opop(portal, 'name');

		// Create a new Promise and return it
		return new Promise((resolve, reject) => {

			// If it already exists
			if(sName in records) {
				return reject([ [ 'name', 'Already in use' ] ]);
			}

			// Create the new portal
			manage.create('portal', {
				name: sName,
				record: portal
			}).then((data: string) => {

				// If we were successful
				if(data) {

					// Notify the parent
					onSuccess('create');

					// Close the create form
					createSet(false);

					// Clone the records, add the new one, and set the new
					//	records
					const oRecords = { ...records };
					oRecords[sName] = portal;
					recordsSet(oRecords);
				}

				// Resolve with the form
				resolve(data ? true : false);

			}, (error: responseErrorStruct) => {
				if(error.code === errors.DB_DUPLICATE) {
					reject([ [ 'name', 'Already in use' ] ]);
				} else if(error.code === errors.DATA_FIELDS) {
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

	// Called when a Portal instance has been deleted
	function instanceDeleted(name: string) {

		// Get latest
		recordsSet(o => {
			if(name in o) {
				const oNew = { ...o };
				delete oNew[name];
				return oNew;
			} else {
				return o;
			}
		});
	}

	// Called when a Portal instance has been updated
	function instanceUpdated(name: string, portal: InstanceStruct) {
		recordsSet(o => combine(o, { [name]: portal }));
	}

	// Render
	return (
		<Box id="manage_portal" className="flexGrow padding">
			<Box className="flexColumns">
				<h1 className="flexGrow">Portals</h1>
				{rights.create &&
					<Box className="flexStatic">
						<Tooltip title="Create new Portal" className="page_action" onClick={() => createSet(b => !b)}>
							<IconButton>
								<i className={'fa-solid fa-plus' + (create ? ' open' : '')} />
							</IconButton>
						</Tooltip>
					</Box>
				}
			</Box>
			{create &&
				<Paper className="padding">
					<Form
						gridSizes={{ __default__: { xs:12 }}}
						onCancel={() => createSet(false)}
						onSubmit={createSubmit}
						title="Create Instance"
						tree={RestTree}
						type="create"
						value={{
							path: '',
							output: '',
							git: { checkout: false, submodules: false },
							node: { force_install: false, nvm: '' }
						}}
					/>
				</Paper>
			}
			{!empty(records) ? (
				<Grid container spacing={2}>
					{omap(records, (o, k) =>
						<Instance
							key={k}
							name={k}
							onError={onError}
							onDeleted={instanceDeleted}
							onUpdated={instanceUpdated}
							record={o}
							rights={{
								main: rights,
								build: rbuild
							}}
							tree={RestTree}
						/>
					)}
				</Grid>
			) : (
				<Typography>No Portal instances found.</Typography>
			)}
		</Box>
	);
}

// Valid props
Portals.propTypes = {
	onError: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
}