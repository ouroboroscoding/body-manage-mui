/**
 * Build Portal instance
 *
 * Portal Build component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-10
 */
import PropTypes from 'prop-types';
import React from 'react';
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
import type { InstanceStruct } from '../../../types/portal';
export type BuildProps = {
    name: string;
    onClose: () => void;
    onError: (error: responseErrorStruct) => void;
    record: InstanceStruct;
    rights: idStruct;
};
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
declare function Build({ name, onClose, onError, record, rights }: BuildProps): React.JSX.Element;
declare namespace Build {
    var propTypes: {
        name: PropTypes.Validator<string>;
        onClose: PropTypes.Validator<(...args: any[]) => any>;
        onError: PropTypes.Validator<(...args: any[]) => any>;
        record: PropTypes.Validator<object>;
        rights: PropTypes.Validator<Required<PropTypes.InferProps<{
            create: PropTypes.Requireable<boolean>;
            delete: PropTypes.Requireable<boolean>;
            read: PropTypes.Requireable<boolean>;
            update: PropTypes.Requireable<boolean>;
        }>>>;
    };
}
export default Build;
