import React, { useState } from 'react';

function useHookedComponent(Component, initial, setters) {
    const [returnState] = useState(() => {
        let state = initial;
        let setState = () => {};
        const returnSetters = !!setters ? 
            setters.map(setter => (...args) => {
                setState(current => setter(...args, current));
            }) : [(v) => setState(v)];

        return [function HookedComponent(props) {
            [state, setState] = useState(initial);

            return (<Component {...props} {...state} />);
        }, ...returnSetters, () => state];
    });

    return returnState;
};

export default useHookedComponent;