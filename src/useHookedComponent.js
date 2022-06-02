// import React, { useState } from 'react';

// function useHookedComponent(Component, initial, setters) {
//     const [returnState] = useState(() => {
//         let state = initial;
//         let setState = () => {};
//         const returnSetters = !!setters ? 
//             setters.map(setter => (...args) => setState(current => setter(...args, current))) :
//             [(v) => setState(v)];

//         return [function HookedComponent(props) {
//             [state, setState] = useState(initial);

//             return (<Component {...props} {...state} />);
//         }, ...returnSetters, () => state];
//     });

//     return returnState;
// };

// export default useHookedComponent;

import * as React from "react";
import { useState } from "react";

function useHookedComponent(Component, initial, setters) {
    const [returnState] = useState(() => {
        let state = initial;
        let setState = () => {};
        let returnSetters = [(v) => setState(v)];

        function getSetter(setter) {
            return (...args) => setState(current => setter(...args, current));
        }

        if (Array.isArray(setters)) {
            returnSetters = setters.map(setter => getSetter(setter));
        } else if (({}).toString.call(setters) === "[object Object]") {
            returnSetters = [Object.entries(setters).reduce((acc, [name, setter]) => {
                acc[name] = getSetter(setter);

                return acc;
            }, {})];
        } else if (({}).toString.call(setters) === "[object Function]") {
            returnSetters = [getSetter(setters)];
        }

        return [function HookedComponent(props) {
            [state, setState] = useState(initial);

            return (<Component {...props} {...state} />);
        }, ...returnSetters, () => state];
    });

    return returnState;
}

export default useHookedComponent;
