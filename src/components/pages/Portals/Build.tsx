/**
 * Build Portal instance
 *
 * Portal Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */

// Ouroboros modules
import { iso } from '@ouroboros/dates';
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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// Types
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
import type { InstanceStruct } from './Instance';
export type BuildProps = {
	name: string,
	onClose: () => void,
	onError: (error: responseErrorStruct) => void,
	record: InstanceStruct,
	rights: idStruct
}
type buildStruct = {
	backup?: boolean,
	checkout?: string,
	clear: boolean
}

// Styles
const preBox = {
	overflow: 'auto',
	padding: '5px 0'
}

/**
 * Build
 *
 * Handles Portal instance management
 *
 * @name Build
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function Build({
	name, onClose, onError, record, rights
}: BuildProps) {

	// State
	const [ build, buildSet ] = useState<buildStruct>({ clear: false });
	const [ building, buildingSet ] = useState<boolean>(false);
	const [ details, detailsSet ] = useState<Record<string, any>>();
	const [ output, outputSet ] = useState<Record<string, string>>();
	const [ tab, tabSet ] = useState<number>(1);

	// Load / record effect
	useEffect(() => {

		// Clear details and output
		buildSet({ clear: false });
		detailsSet(undefined);
		outputSet(undefined);
		tabSet(1);

		// Fetch the details
		manage.read('portal/build', { name }).then(detailsSet, onError);

		// If we have backups
		if(record.backups && record.backups !== '') {
			buildSet(o => { return { ...o, backup: true }});
		}

	}, [ record ]);

	// Called when the checkout branch changes
	function checkoutChanged(
		ev: SelectChangeEvent<any>, c: React.ReactNode
	) {

		// If the new branch is the same as the original
		if(details!.branch === ev.target.value) {
			buildSet(o => (owithout(o, 'checkout') as buildStruct));
		} else {
			buildSet(o => { return { ...o, checkout: ev.target.value } });
		}
	}

	// Called to build the portal instance
	function submit() {

		// Hide build button and clear any existing output
		buildingSet(true);
		outputSet(undefined);

		// Call the build creator request
		manage.create('portal/build', { name, ...build }).then(data => {
			if(data) {
				outputSet(data);
			}
		}, onError).finally(() => buildingSet(false));
	}

	// Build commands list
	const lCommands = [ `cd ${record.path}`, 'git fetch' ];
	if(build.clear) {
		lCommands.push('git checkout .')
	}
	if(build.checkout) {
		lCommands.push(`git checkout ${build.checkout}`);
	}
	lCommands.push(record.git.submodules ?
		'git pull --recurse-submodules' : 'git pull'
	)
	if(record.node.nvm) {
		lCommands.push(`nvm use ${record.node.nvm}`);
	}
	lCommands.push( ...[
		record.node.force_install ? 'npm install --force' : 'npm install',
		`npm run ${record.node.script || name}`
	])
	if(record.backups && build.backup) {
		lCommands.push(
			`mv ${record.web_root} ${record.backups}/${iso(new Date(), true, false, true)}`
		)
	}
	lCommands.push(...[
		`mkdir -p ${record.web_root}`,
		record.build ?
			`cp -r ${record.build}/* ${record.web_root}/.` :
			`cp -r ${record.path}/dist/* ${record.web_root}/.`
	])

	// Render
	return (
		<Dialog
			fullWidth={true}
			maxWidth="sm"
			onClose={onClose}
			open={true}
		>
			<DialogTitle>Build {name}</DialogTitle>
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
					{details === undefined ?
						'Loading...' : <>
						<Typography>Status:</Typography>
						<textarea
							readOnly
							rows={10}
							style={{ marginBottom: '10px', width: '100%' }}
							value={details!.status}
						/>
						<Grid container spacing={1}>
							{record.git.checkout && <>
								<Grid item xs={12} sm={6}>
									Select the branch to pull
								</Grid>
								<Grid item xs={12} sm={6} className="actions">
									<Select
										label=""
										onChange={checkoutChanged}
										native
										size="small"
										value={build.checkout || details!.branch}
										variant="outlined"
									>
										{details!.branches.map((s: string) =>
											<option key={s} value={s}>{s}</option>
										)}
									</Select>
								</Grid>
							</>}
							<Grid item xs={12} sm={6}>
								Clear local changes before pulling?
							</Grid>
							<Grid item xs={12} sm={6} className="actions">
								<Switch
									checked={build.clear}
									onChange={ev => buildSet(o => {
										return { ...o, clear: ev.target.checked }
									})}
									size="small"
								/>
							</Grid>
							{(record.backups && record.backups !== '') && <>
								<Grid item xs={12} sm={6}>
									Backup current files?
								</Grid>
								<Grid item xs={12} sm={6} className="actions">
									<Switch
										checked={build.backup}
										onChange={ev => buildSet(o => {
											return { ...o, backup: ev.target.checked }
										})}
										size="small"
									/>
								</Grid>
							</>}
						</Grid>
						<hr />
						<Typography>Preview</Typography>
						<Box style={preBox}>
							<pre>{lCommands.join(' &&\n')}</pre>
						</Box>
					</>}
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={onClose} variant="contained">Cancel</Button>
					<Button disabled={building} color="primary" onClick={submit} variant="contained">Build</Button>
				</DialogActions>
			</>)}
		</Dialog>
	);
}

// Valid props
Build.propTypes = {
	name: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	onError: PropTypes.func.isRequired,
	record: PropTypes.object.isRequired,
	rights: PropTypes.exact({
		create: PropTypes.bool,
		delete: PropTypes.bool,
		read: PropTypes.bool,
		update: PropTypes.bool
	}).isRequired
}