import * as React from "react";
import { useState } from "react";

function isFunction(f) {
    return ({}).toString.call(f) === "[object Function]"
}

function isObject(o) {
    return ({}).toString.call(o) === "[object Object]"
}

function useHookedComponent(Component, methods, options = {}) {
    const [returnValues] = useState(() => {
        const defaultMethod = v => v;
        let currentProps = {};
        let setState = () => {};
        let state;
        let updatedMethods;

        function getCurrent() {
            return { ...currentProps, ...state };
        }

        function updatedMethod(method) {
            return (...args) => {
                return isFunction(args[0]) ? 
                    setState(() => method(args[0](getCurrent()))) : 
                    method !== defaultMethod ?
                        setState(() => method(...args, getCurrent())) :
                        setState(() => method(args[0]));
            }
        }

        if (Array.isArray(methods)) {
            updatedMethods = methods.map(updatedMethod);
        } else if (isObject(methods)) {
            updatedMethods = [Object.entries(methods).reduce((acc, [name, method]) => {
                acc[name] = updatedMethod(method);

                return acc;
            }, {})];
        } else if (isFunction(methods)) {
            updatedMethods = [updatedMethod(methods)];
        } else {
            updatedMethods = [updatedMethod(defaultMethod)];
        }

        return [function HookedComponent(props) {
            [state, setState] = useState(options.initial);
            currentProps = props;

            return (<Component {...props} {...state} />);
        }, ...updatedMethods, getCurrent];
    });

    return returnValues;
}

export default useHookedComponent;
