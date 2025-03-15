/**
 * Portal Build Commands
 *
 * Displays the list of commands theoretically run for a build on the portal
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-03-07
 */
import PropTypes from 'prop-types';
import React from 'react';
import type { BuildStruct, InstanceStruct } from '../../../types/portal';
type BuildCommandProps = {
    build?: BuildStruct;
    instance: InstanceStruct;
    name: string;
    style: Record<string, any>;
};
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
declare function BuildCommands({ build, instance, name, style }: BuildCommandProps): React.JSX.Element;
declare namespace BuildCommands {
    var propTypes: {
        build: PropTypes.Requireable<object>;
        instance: PropTypes.Validator<object>;
        name: PropTypes.Validator<string>;
        style: PropTypes.Requireable<object>;
    };
}
export default BuildCommands;
