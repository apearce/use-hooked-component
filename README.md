# use-hooked-component
Update your component's props directly using callbacks from a hook.

## Installation
`npm i use-hooked-component`

## A hooked component?
Normally to update a component's props you update some state for the props on the parent component which causes a re-render of the parent and **all** of it's children. `useHookedComponent` allows you to update the props directly without re-rendering everything. In its simplest form you use it like so:

```jsx
const [HookedComponent, updateComponent, getValues] = useHookedComponent(SomeComponent);
```

It returns a component and a function you can use to update the component's props directly. It also returns a function as the **last** return value that you can use to get the props set using the update function, as well as any props set directly on the component.

Let's say you have a `Spinner` component that you show when loading some data or saving something. It has a single prop, `visible`, which you use to show or hide it. Rather than having a `showSpinner` or some such state on the parent, you can just call a function to update the `Spinner` directy. Only the `Spinner` will re-render. It's kind of like having methods for your components.

```jsx
import { useEffect } from 'react';
import useHookedComponent from 'use-hooked-component';
import Spinner from './my/awesome/spinner';

function PageComponent(props) {
    const [HookedSpinner, updateSpinner] = useHookedComponent(Spinner);
    ...

    useEffect(() => {
        // Show the spinner - Only HookedSpinner re-renders
        updateSpinner({ visible: true });

        fetch('/path/to/data.json')
            .then(resp => resp.json())
            .then(data => {
                // Do something with the data

                // Hide the spinner - Only HookedSpinner re-renders
                updateSpinner({ visible: false });
            });
    }, []);

    return (<main>
        <HookedSpinner />
        ...
    </main>);
}
```

Just like a state update function from `useState`, you can pass a function to `updateSpinner` which will get passed an object of all of the props set using the hook as well as any props set on the component.

```jsx
updateSpinner(current => ({ visible: !current.hookProps.visible })); // toggle the Spinner
```

You can still use the `visible` prop on the `Spinner` itself as a default, but when you update it using the `updateSpinner` function it will take precedence.

## Defining your own setters
To have more control over updates, you can also define your own setter functions to update the component's props. You can pass a single setter, an array of setters, or an object. Each setter should return an object with all of the props to be set on the component. Props set directly on the component should not be included unless you want to override them. The getter function, not shown, will still be returned as the last return value.

```jsx
const [HookedSpinner, showSpinner] = useHookedComponent(Spinner, visible => ({ visible }));
```
The above example defines a single setter. You can show the `Spinner` by calling `showSpinner(true)` and hide it by calling `showSpinner(false)`.

```jsx
// Array of setters
const [HookedSpinner, showSpinner, hideSpinner] = useHookedComponent(Spinner, [
    () => ({ visible: true }),
    () => ({ visible: false })
]);
```
OR
```jsx
// Object containing the setters
const [HookedSpinner, { showSpinner, hideSpinner }] = useHookedComponent(Spinner, {
    showSpinner: () => ({ visible: true }),
    hideSpinner: () => ({ visible: false })
});
```
Now you can show the `Spinner` by calling `showSpinner()` and hide it by calling `hideSpinner()`.

### Getting the "current" object with custom setters
If you return a function from a custom setter, the function will be called and passed an object of all of the props set using the hook, as well as any props set on the component.

```jsx
const [HookedSpinner, toggleSpinner] = useHookedComponent(Spinner, () => current => ({ 
    visible: !current.hookProps.visible
}));
```
The above example uses a single setter which automatically gets the current props passed to it. You can toggle the `Spinner` by calling `toggleSpinner()`.

## Wrapping up
Now you can take your hooked spinner and wrap it in its own hook.

```jsx
import useHookedComponent from 'use-hooked-component';
import Spinner from './my/awesome/spinner';

function useSpinner() {
    return useHookedComponent(Spinner, {
        showSpinner: () => ({ visible: true }),
        hideSpinner: () => ({ visible: false })
    });
}

export default useSpinner;
```

```jsx
import { useEffect } from 'react';
import useSpinner from './useSpinner';

function PageComponent(props) {
    const [Spinner, { showSpinner, hideSpinner }] = useSpinner();
    ...

    useEffect(() => {
        showSpinner();

        fetch('/path/to/data.json')
            .then(resp => resp.json())
            .then(data => {
                // Do something with the data

                hideSpinner();
            });
    }, []);

    return (<main>
        <Spinner />
        ...
    </main>);
}
```