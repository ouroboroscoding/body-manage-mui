/**
 * Restore from backup
 *
 * Portal Backups component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-11
 */
import PropTypes from 'prop-types';
import React from 'react';
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
export type BackupsProps = {
    name: string;
    onClose: () => void;
    onError: (error: responseErrorStruct) => void;
    rights: idStruct;
};
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
declare function Backups({ name, onClose, onError, rights }: BackupsProps): React.JSX.Element;
declare namespace Backups {
    var propTypes: {
        name: PropTypes.Validator<string>;
        onClose: PropTypes.Validator<(...args: any[]) => any>;
        onError: PropTypes.Validator<(...args: any[]) => any>;
        rights: PropTypes.Validator<Required<PropTypes.InferProps<{
            create: PropTypes.Requireable<boolean>;
            delete: PropTypes.Requireable<boolean>;
            read: PropTypes.Requireable<boolean>;
            update: PropTypes.Requireable<boolean>;
        }>>>;
    };
}
export default Backups;
