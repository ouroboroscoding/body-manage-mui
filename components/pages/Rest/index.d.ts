/**
 * Manage REST instances
 *
 * REST page
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-08
 */
import PropTypes from 'prop-types';
import React from 'react';
import type { responseErrorStruct } from '@ouroboros/body';
export type RestProps = {
    onError: (error: responseErrorStruct) => void;
    onSuccess: (type: string) => void;
};
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
declare function Rest({ onError, onSuccess }: RestProps): React.JSX.Element;
declare namespace Rest {
    var propTypes: {
        onError: PropTypes.Validator<(...args: any[]) => any>;
        onSuccess: PropTypes.Validator<(...args: any[]) => any>;
    };
}
export default Rest;
