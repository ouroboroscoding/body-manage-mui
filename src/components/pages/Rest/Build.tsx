/**
 * Build REST instance
 *
 * REST Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */

// Ouroboros modules
import { errors } from '@ouroboros/body';
import manage from '@ouroboros/manage';
import { pathToTree } from '@ouroboros/tools';

// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// Material UI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
	checkout?: string
}

/**
 * Build
 *
 * Handles REST instance management
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
	const [ build, buildSet ] = useState<buildStruct>({});
	const [ details, detailsSet ] = useState(false);

	// Load / record effect
	useEffect(() => {

		// Fetch the details
		manage.read('rest/build', { name }).then(detailsSet, onError);

	}, [ record ]);

	// Called to build the rest instance
	function submit() {
		console.log('build');
	}

	// Render
	return (
		<Dialog
			onClose={onClose}
			open={true}
		>
			<DialogTitle>Build {name}</DialogTitle>
			<DialogContent>
				<pre>{JSON.stringify(details, null, 4)}</pre>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={onClose} variant="contained">Cancel</Button>
				<Button color="primary" onClick={submit} variant="contained">Delete</Button>
			</DialogActions>
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