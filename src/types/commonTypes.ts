/**
 * @module - Collection of common and generic types
 */

/**
 * Generic object that represents a map
 * that for every property will have 'T'
 * value.
 */
export interface IObjectMap<T> {
    [key: string]: T;
}

/**
 * Generic function that that has zero
 * parameters
 */
export type GenericFunction0 = () => void;

/**
 * Generic function that has one
 * parameter
 */
export type GenericFunction1<P1> = (data: P1) => void;

/**
 * Generic function that takes two
 * parameters
 */
export type GenericFunction2<P1, P2> = (p1: P1, p2: P2) => void;
