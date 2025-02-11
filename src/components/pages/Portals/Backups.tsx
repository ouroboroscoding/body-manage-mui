/**
 * Restore from backup
 *
 * Portal Backups component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-11
 */

// Ouroboros modules
import manage from '@ouroboros/manage';
import { owithout } from '@ouroboros/tools';

// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
export type BackupsProps = {
	name: string,
	onClose: () => void,
	onError: (error: responseErrorStruct) => void,
	rights: idStruct
}
type restoreStruct = {
	backup: string,
	backup_current?: boolean
}

// Styles
const preBox = {
	maxHeight: '80vh',
	overflow: 'auto',
	padding: '5px 0'
}

/**
 * Backups
 *
 * Handles Portal backup management
 *
 * @name Backups
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Backups({
	name, onClose, onError, rights
}: BackupsProps) {

	// State
	const [ backups, backupsSet ] = useState<string[]>();
	const [ restore, restoreSet ] = useState<restoreStruct>({ backup: '' });
	const [ restoring, restoringSet ] = useState<boolean>(false);
	const [ output, outputSet ] = useState<Record<string, string>>();
	const [ tab, tabSet ] = useState<number>(1);

	// Load / record effect
	useEffect(() => {

		// Clear details and output
		restoreSet({ backup: '' });
		backupsSet(undefined);
		restoringSet(false);
		outputSet(undefined);
		tabSet(1);

		// Fetch the details
		manage.read('portal/backups', { name }).then(backupsSet, onError);

	}, [ name ]);

	// Called to build the portal instance
	function submit() {

		// Hide restore button and clear any existing output
		restoringSet(true);
		outputSet(undefined);

		// Call the build creator request
		manage.create('portal/restore', { name, ...restore }).then(data => {
			if(data) {
				outputSet(data);
			}
		}, onError).finally(() => restoringSet(false));
	}

	// Render
	return (
		<Dialog
			fullWidth={true}
			maxWidth="sm"
			onClose={onClose}
			open={true}
		>
			<DialogTitle>Restore Backup for {name}</DialogTitle>
			{output ? (<>
				<DialogContent>
					<Tabs onChange={(ev, num) => tabSet(num)} value={tab}>
						<Tab label="Commands" />
						<Tab label="Output" />
					</Tabs>
					<Box style={preBox}>
						<pre>
							{(tab === 0 &&
								output.commands.split(' && ').join(' &&\n')
							) || (tab === 1 &&
								output.output
							)}
						</pre>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={onClose} variant="contained">Close</Button>
				</DialogActions>
			</>) : (<>
				<DialogContent>
					{backups === undefined ?
						'Loading...' :
						<Grid container spacing={2}>
							<Grid item xs={12} sm={8}>
								Select the backup to restore
							</Grid>
							<Grid item xs={12} sm={4}>
								<Select
									native
									onChange={ev => restoreSet(o => {
										return { ...o, backup: ev.target.value }
									})}
									value={restore.backup}
								>
									<option value="">Select backup...</option>
									{backups.map(s =>
										<option key={s} value={s}>{s}</option>
									)}
								</Select>
							</Grid>
							<Grid item xs={12} sm={8}>
								Backup the current code before restoring?
							</Grid>
							<Grid item xs={12} sm={4} className="actions">
								<Switch
									checked={restore.backup_current || false}
									onChange={(ev, checked) => restoreSet(o => {
										return checked ?
											{ ...o, backup_current: true } :
											(owithout(o, 'backup_current') as restoreStruct)
									})
								} />
							</Grid>
						</Grid>
					}
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={onClose} variant="contained">Cancel</Button>
					{rights.create &&
						<Button disabled={restoring || restore.backup === ''} color="primary" onClick={submit} variant="contained">Restore</Button>
					}
				</DialogActions>
			</>)}
		</Dialog>
	);
}

// Valid props
Backups.propTypes = {
	name: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	onError: PropTypes.func.isRequired,
	rights: PropTypes.exact({
		create: PropTypes.bool,
		delete: PropTypes.bool,
		read: PropTypes.bool,
		update: PropTypes.bool
	}).isRequired
}