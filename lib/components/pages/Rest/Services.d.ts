/**
 * REST Services
 *
 * Handles special define-mui component for services hash
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2025-02-09
 */
import { DefineNodeBase, DefineNode } from '@ouroboros/define-mui';
import React from 'react';
import type { DefineNodeBaseProps, DefineNodeBaseState } from '@ouroboros/define-mui';
export type ServicesStruct = {
    [x: string]: {
        supervisor?: string;
    };
};
/**
 * Services
 *
 * Handles REST hash of services
 *
 * @name Services
 * @access public
 * @extends DefineNodeBase
 */
export default class Services extends DefineNodeBase {
    key: React.RefObject<DefineNode>;
    supervisor: React.RefObject<DefineNode>;
    props: DefineNodeBaseProps;
    state: {
        create: {
            key: string;
            supervisor: string;
        };
    } & DefineNodeBaseState;
    /**
     * Constructor
     *
     * Creates a new instance
     *
     * @name Services
     * @access public
     * @param props Properties passed to the component
     * @returns a new instance
     */
    constructor(props: DefineNodeBaseProps);
    /**
     * Add
     */
    add(): void;
    /**
     * Remove
     */
    remove(key: string): void;
    /**
     * Render
     */
    render(): React.JSX.Element;
}
