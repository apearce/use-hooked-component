# use-hooked-component
Update your components props directly using callbacks from a hook.

## Installation
`npm i use-hooked-component`

## A Hooked Component?
Normally to update a component's props you update some state for the props on the parent component which causes a rerender of the parent and **all** of it's children. `useHookedComponent` allows you to update the props directly without rerendering everything. In it's simplest form you use it like so:

```jsx
const [HookedComponent, updateComponent, getValues] = useHookedComponent(SomeComponent);
```

It returns a component and a function you can use to update the component directly. It also returns a function as the **last** return value that you can use to get the values set using the updater.

Let's say you have a `Spinner` component that you may show when loading some data or saving something. It has a single prop `visible` which you use to show or hide it. Rather than having a `showSpinner` or some such state on the parent, you can just call the `Spinner` directy. Only the `Spinner` will rerender.

```jsx
import { useEffect } from 'react';
import useHookedComponent from 'use-hooked-component';
import Spinner from './my/awesome/spinner';

function PageComponent(props) {
    const [HookedSpinner, updateSpinner] = useHookedComponent(Spinner);
    ...

    useEffect(() => {
        // Show the spinner
        updateSpinner({ visible: true });

        fetch('/path/to/data.json')
            .then(resp => resp.json())
            .then(data => {
                // Do something with the data

                // Hide the spinner
                updateSpinner({ visible: false });
            });
    }, []);

    return (<main>
        <HookedSpinner />
        ...
    </main>);
}
```

Just like a state update function from `useState`, you can pass a function to `updateSpinner` which will get passed an object of all of the current values set using the hook.

```jsx
updateSpinner(current => ({ visible: !current.visible })); // toggle the Spinner
```

You can still use the `visible` prop on the `Spinner` itself as a default, but when you update it using the `updateSpinner` function it will take precedence. You can also pass an object as the second argument to `useHookedComponent` to set default props on the initial render.

```jsx
// The spinner will be visible initially
const [HookedSpinner, updateSpinner] = useHookedComponent(Spinner, { visible: true });
```

## Custom Setters
`useHookedComponent` also takes a third argument which is a list of custom setters. You can pass arguments to the setters and they will also get passed an object of all of the current values set using the hook. It should return an object of all of the props to be set on the component by the hook. Props set directly on the component should not be included unless you want to override them. The getter function, not shown, will still be returned as the last return value.

```jsx
const [HookedSpinner, showSpinner] = useHookedComponent(Spinner, {}, [visible => ({ visible })]);
```
Now you can show the `Spinner` by calling `showSpinner(true)` and hide it by calling `showSpinner(false)`.

```jsx
const [HookedSpinner, showSpinner, hideSpinner] = useHookedComponent(Spinner, {}, [() => ({ visible: true }), () => ({ visible: false })]);
```
Now you can show the `Spinner` by calling `showSpinner()` and hide it by calling `hideSpinner()`.

```jsx
const [HookedSpinner, toggleSpinner] = useHookedComponent(Spinner, {}, [current => ({ visible: !current.visible })]);
```
Now you can toggle the `Spinner` by calling `toggleSpinner()`.

## Wrapping Up
Now you can take your hooked spinner and wrap it in it's own hook.

```jsx
import useHookedComponent from 'use-hooked-component';
import Spinner from './my/awesome/spinner';

function useSpinner(visible) {
    return useHookedComponent(Spinner, { visible }, [() => ({ visible: true }), () => ({ visible: false })]);
}

export default useSpinner;
```

```jsx
import { useEffect } from 'react';
import useSpinner from './useSpinner';

function PageComponent(props) {
    const [Spinner, showSpinner, hideSpinner] = useSpinner(false);
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