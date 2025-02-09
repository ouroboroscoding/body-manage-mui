/**
 * Manage Portal instances
 *
 * Portals page
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-08
 */
import PropTypes from 'prop-types';
import React from 'react';
import type { responseErrorStruct } from '@ouroboros/body';
export type PortalsProps = {
    onError: (error: responseErrorStruct) => void;
    onSuccess: (type: string) => void;
};
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
declare function Portals({ onError, onSuccess }: PortalsProps): React.JSX.Element;
declare namespace Portals {
    var propTypes: {
        onError: PropTypes.Validator<(...args: any[]) => any>;
        onSuccess: PropTypes.Validator<(...args: any[]) => any>;
    };
}
export default Portals;
