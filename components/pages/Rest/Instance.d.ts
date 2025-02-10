/**
 * Manage REST instance
 *
 * REST Instance component
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-09
 */
import { Tree } from '@ouroboros/define';
import PropTypes from 'prop-types';
import React from 'react';
import type { responseErrorStruct } from '@ouroboros/body';
import type { idStruct } from '@ouroboros/brain-react';
import type { ServicesStruct } from './Services';
export type InstanceStruct = {
    path: string;
    git: {
        checkout: boolean;
        submodule: boolean;
    };
    python: {
        which?: string;
        requirements?: string;
    };
    services: ServicesStruct;
};
export type InstanceProps = {
    name: string;
    onDeleted: onDeletedCallback;
    onError: (error: responseErrorStruct) => void;
    onUpdated: onUpdatedCallback;
    record: InstanceStruct;
    rights: {
        main: idStruct;
        build: idStruct;
    };
    tree: Tree;
};
export type onDeletedCallback = (name: string) => void;
export type onUpdatedCallback = (name: string, rest: InstanceStruct) => void;
/**
 * Instance
 *
 * Handles REST instance management
 *
 * @name Instance
 * @access public
 * @param Object props Properties passed to the component
 * @returns React.Component
 */
declare function Instance({ name, onDeleted, onError, onUpdated, record, rights, tree }: InstanceProps): React.JSX.Element;
declare namespace Instance {
    var propTypes: {
        name: PropTypes.Validator<string>;
        onDeleted: PropTypes.Validator<(...args: any[]) => any>;
        onError: PropTypes.Validator<(...args: any[]) => any>;
        onUpdated: PropTypes.Validator<(...args: any[]) => any>;
        record: PropTypes.Validator<object>;
        rights: PropTypes.Validator<Required<PropTypes.InferProps<{
            main: PropTypes.Validator<Required<PropTypes.InferProps<{
                create: PropTypes.Requireable<boolean>;
                delete: PropTypes.Requireable<boolean>;
                read: PropTypes.Requireable<boolean>;
                update: PropTypes.Requireable<boolean>;
            }>>>;
            build: PropTypes.Validator<Required<PropTypes.InferProps<{
                create: PropTypes.Requireable<boolean>;
                delete: PropTypes.Requireable<boolean>;
                read: PropTypes.Requireable<boolean>;
                update: PropTypes.Requireable<boolean>;
            }>>>;
        }>>>;
        tree: PropTypes.Validator<Tree>;
    };
}
export default Instance;
