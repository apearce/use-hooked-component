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

        function updateSetter(setter: Setter): UpdatedSetter {
            return (...args: unknown[]): void | Promise<unknown> => {
                let result;

                if (isFunction(args[0])) {
                    result = setter((args[0])(getCurrent()));
                } else {
                    result = setter !== defaultSetter ?
                        setter(...args) :
                        setter(args[0]);

                    if (isFunction(result)) {
                        result = (result)(getCurrent());
                    }
                }

                if (isUndefined(result)) {
                    setState(result);
                } else if (isObject(result)) {
                    const { [asyncProp]: isAsync, ...rest } = result;

                    if (isAsync) {
                        const { promise, reject, resolve } = Object.hasOwn(Promise, "withResolvers") ?
                            Promise.withResolvers() : getPromiseWithResolvers();

                        setState({ ...rest, [asyncProp]: { reject, resolve } });

                        return promise;
                    }

                    setState(rest);
                } else {
                    throw new TypeError(`Expected Object but got ${getType(result)} instead.`);
                }
            }
        }

        if (Array.isArray(setters)) {
            updatedSetters = setters.map(updateSetter);
        } else if (isObject(setters)) {
            updatedSetters = [Object.entries(setters).reduce((acc, [name, setter]) => {
                acc[name] = updateSetter(setter);

                return acc;
            }, {} as UpdatedSetterObject)];
        } else if (isFunction(setters)) {
            updatedSetters = [updateSetter(setters)];
        } else {
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
