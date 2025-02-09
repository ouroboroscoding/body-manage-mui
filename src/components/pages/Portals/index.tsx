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
import { Tree } from '@ouroboros/define'
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

// Types
import { responseErrorStruct } from '@ouroboros/body';
export type PortalsProps = {
	onError: (error: responseErrorStruct) => void,
	onSuccess: (type: string) => void
}

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
export default function Portals({ onError, onSuccess }: PortalsProps) {

	// State
	const [ create, createSet ] = useState<boolean>(false);
	const [ records, recordsSet ] = useState<Record<string, any>>({});

	// Hooks
	const rights = useRights('manage_portal');

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

		// Create a new Promise and return it
		return new Promise((resolve, reject) => {

			// Create the new rest
			manage.create('rest', rest).then((data: string) => {

				// If we were successful
				if(data) {

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

			}, (error: responseErrorStruct) => {
				if(error.code === errors.DB_DUPLICATE) {
					reject([ [ 'name', 'Already in use' ] ]);
				} else if(error.code === errors.DATA_FIELDS) {
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

	// Called when the delete button on a rest was clicked
	function deleteClick(key: string) {

		// Delete the existing rest
		manage.delete('rest', { name: key }).then((data: boolean) => {

			// If it was successful
			if(data) {

				// Notify the parent
				onSuccess('delete');

				// Remove the entry and store the new records
				recordsSet(o => {
					if(key in o) {
						const oNew = { ...o };
						delete oNew[key];
						return oNew;
					} else {
						return o;
					}
				});
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
	function updateSubmit(rest: any, key: string): Promise<boolean> {

		// Create a new Promise and return it
		return new Promise((resolve, reject) => {

			// Update the rest on the server
			manage.update('rest', { name: key, ...rest }).then((data: boolean) => {

				// If we were successful
				if(data) {

					// Notify the parent
					onSuccess('update');

					recordsSet(o => {
						if(key in o) {
							const oNew = { ...o };
							oNew[key] = rest;
							return oNew;
						} else {
							return o;
						}
					});
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
	return (
		<Box id="manage_portals" className="flexGrow padding">
			<Box className="flexColumns">
				<h1 className="flexGrow">Portal</h1>
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
						onCancel={() => createSet(false)}
						onSubmit={createSubmit}
						tree={PortalTree}
						type="create"
					/>
				</Paper>
			}
			{!empty(records) ? (
				<Grid container>
					{omap(records, (v, k) =>
						<Grid item key={k} xs={12} sm={2} md={3} lg={4} xl={5}>
							<Paper className="padding">
								<h2>{ucfirst(k)}</h2>
								<pre>{JSON.stringify(v, null, 4)}</pre>
							</Paper>
						</Grid>
					)}
				</Grid>
			) : (
				<Typography>No REST instances found.</Typography>
			)}
		</Box>
	);
}

// Valid props
Portals.propTypes = {
	onError: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
}