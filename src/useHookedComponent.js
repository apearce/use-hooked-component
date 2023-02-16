import * as React from "react";
import { useState } from "react";

function getType(o) {
    const type = ({}).toString.call(o);

    return type.slice(type.indexOf(" ") + 1, -1);
}

function isFunction(f) {
    return getType(f) === "Function";
}

function isObject(o) {
    return getType(o) === "Object";
}

function isUndefined(o) {
    return getType(o) === "Undefined";
}

function useHookedComponent(Component, setters, options = {}) {
    const [returnValues] = useState(() => {
        const {
            displayName = "HookedComponent",
            initial,
            settersProp = "__setters",
            props: optionsProps,
            omitSetters
        } = options;
        const defaultSetter = v => v;
        let componentSetters;
        let currentProps = {};
        let setState = () => {};
        let state;
        let updatedSetters;

        function getCurrent() {
            return {
                hookProps: { ...state },
                props: { ...currentProps }
            };
        }

        function updateSetter(setter) {
            return (...args) => {
                let result;

                if (isFunction(args[0])) {
                    result = setter(args[0](getCurrent()));
                } else {
                    result = setter !== defaultSetter ?
                        setter(...args) :
                        setter(args[0]);

                    if (isFunction(result)) {
                        result = result(getCurrent());
                    }
                }

                if (isObject(result) || isUndefined(result)) {
                    setState(result);
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
            }, {})];
        } else if (isFunction(setters)) {
            updatedSetters = [updateSetter(setters)];
        } else {
            updatedSetters = [updateSetter(defaultSetter)];
        }

        if (!omitSetters) {
            componentSetters = {
                [settersProp]: isObject(updatedSetters[0]) ?
                    updatedSetters[0] :
                    updatedSetters
            };
        }

        const HookedComponent = (props) => {
            [state, setState] = useState(initial);

            currentProps = { ...optionsProps, ...props };

            return (<Component {...currentProps} {...state} { ...componentSetters } />);
        };

        HookedComponent.displayName = displayName;

        return [HookedComponent, ...updatedSetters, getCurrent];
    });

    return returnValues;
}

export default useHookedComponent;
