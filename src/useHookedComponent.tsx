import * as React from "react";
import { useState } from "react";
import {
    getPromiseWithResolvers,
    getType,
    isFunction,
    isObject,
    isUndefined
} from "./utils";
import {
    CurrentProps,
    DefaultSetter,
    Obj,
    Options,
    RetVal,
    Setter,
    Setters,
    UpdatedSetter,
    UpdatedSetterObject
} from "./types";

function useHookedComponent(
    Component: React.ElementType,
    setters?: Setters,
    options: Options = {}
): RetVal {
    const [returnValues] = useState(() => {
        const {
            asyncProp = "__async",
            displayName = "HookedComponent",
            initial,
            props: optionsProps,
            omitSetters,
            settersProp = "__setters"
        } = options;
        const defaultSetter: DefaultSetter = (v) => v;
        let componentSetters: Obj;
        let currentProps: Obj = {};
        let setState: React.Dispatch<React.SetStateAction<Obj | undefined>> = () => {};
        let state: Obj | undefined;
        let updatedSetters: UpdatedSetter[] | UpdatedSetterObject[];

        function getCurrent(): CurrentProps {
            return {
                hookProps: { ...state },
                props: { ...currentProps }
            };
        }

        // Takes the author defined setter and wraps it
        // in what is actually called by the user
        function updateSetter(setter: Setter): UpdatedSetter {
            // This is what is called when the user actually
            // calls the setter. args are the parameters
            return (...args: unknown[]) => {
                let result;

                if (isFunction(args[0])) {
                    // The updated setter was called with a function
                    // parameter. Call that function with the
                    // current "props" and the call the setter
                    // with the result.
                    result = setter((args[0])(getCurrent()));
                } else {
                    // If the setter is author defined, call it
                    // with args. If no setter was defined it
                    // will be === defaultSetter which only 
                    // accepts a single arg (an object).
                    result = setter !== defaultSetter ?
                        setter(...args) :
                        setter(args[0]);

                    // Calling the author defined setter returned
                    // a funtion. Call that with the current "props".
                    if (isFunction(result)) {
                        result = (result)(getCurrent());
                    }
                }

                // Do something with the result of calling the author defined setter.
                if (isUndefined(result)) {
                    setState(result);
                } else if (isObject(result)) {
                    const { [asyncProp]: isAsync, ...rest } = result;

                    if (isAsync) {
                        // Support for Promise.withResolvers is a
                        // little lacking so polyfill for now.
                        const { promise, reject, resolve } = Object.hasOwn(Promise, "withResolvers") ?
                            Promise.withResolvers() : getPromiseWithResolvers();

                        // This one is async, pass reject and resolve
                        // to the componet to be acted upon.
                        setState({ ...rest, [asyncProp]: { reject, resolve } });

                        // Return a promise.
                        return promise;
                    }

                    setState(rest);
                } else {
                    throw new TypeError(`Expected Object but got ${getType(result)} instead.`);
                }
            }
        }

        if (Array.isArray(setters)) { // An array of setters
            updatedSetters = setters.map(updateSetter);
        } else if (isObject(setters)) { // An object of setters
            updatedSetters = [Object.entries(setters).reduce((acc, [name, setter]) => {
                acc[name] = updateSetter(setter);

                return acc;
            }, {} as UpdatedSetterObject)];
        } else if (isFunction(setters)) { // A single setter
            updatedSetters = [updateSetter(setters)];
        } else { // No setter, use default
            updatedSetters = [updateSetter(defaultSetter as Setter)];
        }

        if (!omitSetters) {
            componentSetters = {
                [settersProp]: isObject(updatedSetters[0]) ?
                    updatedSetters[0] :
                    updatedSetters
            };
        }

        const HookedComponent = (props?: Obj) => {
            [state, setState] = useState(initial);

            currentProps = { ...optionsProps, ...props };

            return (<Component {...currentProps} {...state} { ...componentSetters } />);
        };

        HookedComponent.displayName = displayName;

        return [HookedComponent, ...updatedSetters, getCurrent];
    });

    return returnValues as RetVal;
}

export default useHookedComponent;
