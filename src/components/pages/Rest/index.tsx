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
import { Tree } from '@ouroboros/define'
import { DefineHash, Form } from '@ouroboros/define-mui';
import manage from '@ouroboros/manage';
import RestDef from '@ouroboros/manage/define/rest.json';
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
import Services from './Services';

// Generate the rest parent
DefineHash.pluginAdd('restServices', Services);
const RestTree = new Tree(RestDef, {
	__name__: 'REST',
	__ui__: {
		__create__: [ 'name', 'path', 'git', 'python', 'services' ],
		__update__: [ 'path', 'git', 'python', 'services' ]
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

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { InstanceStruct } from './Instance';
export type RestProps = {
	onError: (error: responseErrorStruct) => void,
	onSuccess: (type: string) => void
}

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
export default function Rest({ onError, onSuccess }: RestProps) {

	// State
	const [ create, createSet ] = useState<boolean>(false);
	const [ records, recordsSet ] = useState<Record<string, InstanceStruct>>({});

	// Hooks
	const rights = useRights('manage_rest');
	const rbuild = useRights('manage_rest_build');

	// User / archived change effect
	useEffect(() => {

		// If we have read rights
		if(rights.read) {
			manage.read('rest').then(recordsSet);
		} else {
			recordsSet({});
		}

		// If we don't have create rights
		if(!rights.create) {
			createSet(false);
		}

	}, [ rights ]);

	// Called when a create form is submitted
	function createSubmit(rest: any): Promise<boolean> {

		// Pull off the name
		const sName = opop(rest, 'name');

		// Create a new Promise and return it
		return new Promise((resolve, reject) => {

			// If it already exists
			if(sName in records) {
				return reject([ [ 'name', 'Already in use' ] ]);
			}

			// Create the new rest
			manage.create('rest', {
				name: sName,
				record: rest
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
					oRecords[sName] = rest;
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

	// Called when a REST instance has been deleted
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

	// Called when a REST instance has been updated
	function instanceUpdated(name: string, rest: InstanceStruct) {
		recordsSet(o => {
			const oNew = combine(o, { [name]: rest });
			if(rest.services) {
				oNew[name].services = rest.services;
			}
			return oNew;
		});
	}

	// Render
	return (
		<Box id="manage_rest" className="flexGrow padding">
			<Box className="flexColumns">
				<h1 className="flexGrow">Rest</h1>
				{rights.create &&
					<Box className="flexStatic">
						<Tooltip title="Create new REST" className="page_action" onClick={() => createSet(b => !b)}>
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
							git: { checkout: false, submodules: false },
							python: { which: '', requirements: '' },
							sevices: { }
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
				<Typography>No REST instances found.</Typography>
			)}
		</Box>
	);
}

// Valid props
Rest.propTypes = {
	onError: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
}