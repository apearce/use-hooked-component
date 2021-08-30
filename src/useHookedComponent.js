import React, { useState } from 'react';

function useHookedComponent(Component, defaultState, setters) {
    const [returnState] = useState(() => {
        let state = defaultState;
        let setState = () => {};
        const returnSetters = !!setters ? 
            setters.map(setter => (...args) => {
                setState(current => setter(...args, current));
            }) : [(v) => setState(v)];

        return [function HookedComponent(props) {
            [state, setState] = useState(defaultState);

            return (<Component {...props} {...state} />);
        }, ...returnSetters, () => state];
    });

    return returnState;
};

export default useHookedComponent;