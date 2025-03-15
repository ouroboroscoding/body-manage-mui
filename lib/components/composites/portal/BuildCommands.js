/**
 * Portal Build Commands
 *
 * Displays the list of commands theoretically run for a build on the portal
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-03-07
 */
// Ouroboros modules
import { iso } from '@ouroboros/dates';
// NPM modules
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
/**
 * Build Commands
 *
 * Displays build commands in a pre box
 *
 * @name BuildCommands
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
export default function BuildCommands({ build = { clear: false }, instance, name, style = {} }) {
    // State
    const [commands, commandsSet] = useState('');
    // Props effect
    useEffect(() => {
        // Build commands list
        const lCommands = [`cd ${instance.path}`, 'git fetch'];
        if (build.clear) {
            lCommands.push('git checkout .');
        }
        if (build.checkout) {
            lCommands.push(`git checkout ${build.checkout}`);
        }
        lCommands.push(instance.git.submodules ?
            'git pull --recurse-submodules' :
            'git pull');
        if (instance.node.nvm) {
            lCommands.push(`nvm use ${instance.node.nvm}`);
        }
        lCommands.push(...[
            instance.node.force_install ? 'npm install --force' : 'npm install',
            `npm run ${instance.node.script || 'build'}`
        ]);
        // If we're backing up
        if (instance.backups && build.backup) {
            lCommands.push(`mv ${instance.web_root} ${instance.backups}/${iso(new Date(), true, false, true)}`);
        }
        // Add the nginx parts
        lCommands.push(...[
            `mkdir -p ${instance.web_root}`,
            instance.build ?
                `cp -r ${instance.build}/* ${instance.web_root}/.` :
                `cp -r ${instance.path}/dist/* ${instance.web_root}/.`
        ]);
        // Set the new commands
        commandsSet(lCommands.join(' &&\n'));
    }, [build, instance]);
    // Render
    return React.createElement(Box, { style: style },
        React.createElement("pre", null, commands));
}
// Valid props
BuildCommands.propTypes = {
    build: PropTypes.object,
    instance: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    style: PropTypes.object
};
