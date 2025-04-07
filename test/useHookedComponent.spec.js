import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { renderHook } from "@testing-library/react-hooks";
import useHookedComponent from "../dist/index";

let container = null;
const MultiMessageComponent = (props) => (<span>{props.message} {props.message2}</span>);
const PropsComponent = (props) => (<>{JSON.stringify(Object.keys(props))}</>);
const TestComponent = (props) => (<span>{props.message}</span>);

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("Test default behavior", () => {
    test("Minimal useage", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent));
    
        expect(result.current.length).toBe(3);
        expect(result.current.every(r => typeof r === "function")).toBe(true);
    });

    test("Initial state", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, undefined, { initial }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });

        expect(container.textContent).toBe("Hello");
    });

    test("Getter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, undefined, { initial }));
        const [Component, , getter] = result.current;

        act(() => {
            render(<Component />, container);
        });

        expect(getter().hookProps).toStrictEqual(initial);
    });

    test("Default setter", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent));
        const newState = { message: "New Message" };
        const [Component, setter, getter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        expect(container.textContent).toBe("Test");

        act(() => {
            setter(newState);
        });
    
        expect(container.textContent).toBe("New Message");
        expect(getter().hookProps).toStrictEqual(newState);
        expect(getter().props.message).toBe("Test");
    });

    test("Default setter passing function", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, undefined, { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({
                message: `${current.hookProps.message} World`
            }));
        });
    
        expect(container.textContent).toBe("Hello World");
    });

    test("Default setter passing function in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, undefined, { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({ ...current.hookProps, message: "Foo"}));
            setter((current) => ({ ...current.hookProps, message2: "Bar"}));
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent));
        const [Component, setter] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(container.textContent).toBe("Hi");
    
        act(() => {
            setter({
                message: "There"
            });
        });
    
        expect(container.textContent).toBe("There");
    
        act(() => {
            setter();
        });
    
        expect(container.textContent).toBe("Hi");
    });

    test("Initial state overrrides default props", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, undefined, { initial }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    });

    test("Test that __async is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter({ __async: true });
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("__async")).toBe(true);
    });

    test("Test asyncProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, undefined, {
            asyncProp: "bar"
        }));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter({ bar: true });
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test that __setters is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("__setters")).toBe(true);
    });

    test("Test settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, undefined, {
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test omitSetters option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, undefined, {
            omitSetters: true
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });

    test("Test omitSetters option with settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, undefined, {
            omitSetters: true,
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });
});

describe("Test passing a single setter", () => {
    test("Custom array of setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, () => ({ message: "World" }), { initial }));
    
        expect(result.current.length).toBe(3);
        expect(result.current.every(r => typeof r === "function")).toBe(true);
    });
    
    test("Use custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, () => ({ message: "World" }), { initial }));
        const [Component, setter] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter();
        });
    
        expect(container.textContent).toBe("World");
    });
    
    test("Pass value to custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, (message) => ({ message }), { initial }));
        const [Component, setter] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter("World");
        });
    
        expect(container.textContent).toBe("World");
    });
    
    test("Use current value in custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, () => (current) => ({ message: `${current.hookProps.message} World` }), { initial }));
        const [Component, setter] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter();
        });
    
        expect(container.textContent).toBe("Hello World");
    });
    
    test("Use current value in custom setter in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent,
            (props) => (current) => ({ ...current.hookProps, ...props })
        , { initial }));
        const [Component, setter ] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello ");
    
        act(() => {
            setter({ message: "Foo"});
            setter({ message2: "Bar" });
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Custom setter passing function", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, (message) => ({ message }), { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => `${current.hookProps.message} World`);
        });
    
        expect(container.textContent).toBe("Hello World");
    });

    test("Custom setter passing function in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, (props) => (props), { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({ ...current.hookProps, message: "Foo"}));
            setter((current) => ({ ...current.hookProps, message2: "Bar"}));
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, (...args) => {
            if (args.length) {
                return {
                    message: args[0]
                };
            }
        }));
        const [Component, setter] = result.current;
    
        act(() => {
            render(<Component message="Hello" />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter("World");
        });
    
        expect(container.textContent).toBe("World");
    
        act(() => {
            setter();
        });
    
        expect(container.textContent).toBe("Hello");
    });

    test("Test that __async is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ __async: true })));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("__async")).toBe(true);
    });

    test("Test asyncProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ bar: true }), {
            asyncProp: "bar"
        }));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test that __setters is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ message: "There" })));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("__setters")).toBe(true);
    });

    test("Test settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ message: "There" }), {
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test omitSetters option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ message: "There" }), {
            omitSetters: true
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });

    test("Test omitSetters option with settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, () => ({ message: "There" }), {
            omitSetters: true,
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });
});

describe("Test passing an array of setters", () => {
    test("Custom array of setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, [
            (prop) => ({ prop, show: true }),
            () => ({ show: false }),
        ], { initial }));
    
        expect(result.current.length).toBe(4);
        expect(result.current.every(r => typeof r === "function")).toBe(true);
    });
    
    test("Use custom setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, [
            () => ({ message: "World" }),
            () => ({}),
        ], { initial }));
        const [Component, setter1, setter2] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter1();
        });
    
        expect(container.textContent).toBe("World");
    
        act(() => {
            setter2();
        });
    
        expect(container.textContent).toBe("");
    });
    
    test("Pass value to custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, [
            () => ({ message: "World" }),
            (message) => ({ message }),
        ], { initial }));
        const [Component, setter1, setter2] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter1();
        });
    
        expect(container.textContent).toBe("World");
    
        act(() => {
            setter2("Bye");
        });
    
        expect(container.textContent).toBe("Bye");
    });
    
    test("Use current value in custom setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, [
            () => (current) => ({ message: `${current.hookProps.message} World` }),
            () => ({}),
        ], { initial }));
        const [Component, setter1, setter2] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setter1();
        });
    
        expect(container.textContent).toBe("Hello World");
    
        act(() => {
            setter2();
        });
    
        expect(container.textContent).toBe("");
    });
    
    test("Use current value in custom setters in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, [
            (message) => (current) => ({ ...current.hookProps, message }),
            (message2) => (current) => ({ ...current.hookProps, message2 })
        ], { initial }));
        const [Component, setMessage, setMessage2 ] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello ");
    
        act(() => {
            setMessage("Foo");
            setMessage2("Bar");
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Custom setter passing function", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, [(message) => ({ message })], { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => `${current.hookProps.message} World`);
        });
    
        expect(container.textContent).toBe("Hello World");
    });

    test("Custom setter passing function in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, [
            (props) => (props)
        ], { initial }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({ ...current.hookProps, message: "Foo"}));
            setter((current) => ({ ...current.hookProps, message2: "Bar"}));
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, [
            () => ({ message: "There" }),
            () => ({}),
        ]));
        const [Component, setter1, setter2] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(container.textContent).toBe("Hi");
    
        act(() => {
            setter1();
        });
    
        expect(container.textContent).toBe("There");
    
        act(() => {
            setter2();
        });
    
        expect(container.textContent).toBe("Hi");
    });

    test("Test that __async is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [() => ({ __async: true })]));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("__async")).toBe(true);
    });

    test("Test asyncProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [() => ({ bar: true })], {
            asyncProp: "bar"
        }));
        const [Component, setter] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test that __setters is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [
            () => ({ message: "There" }),
            () => ({}),
        ]));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("__setters")).toBe(true);
    });

    test("Test settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [
            () => ({ message: "There" }),
            () => ({}),
        ], {
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test omitSetters option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [
            () => ({ message: "There" }),
            () => ({}),
        ], {
            omitSetters: true
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });

    test("Test omitSetters option with settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, [
            () => ({ message: "There" }),
            () => ({}),
        ], {
            omitSetters: true,
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });
});

describe("Test passing an object of setters", () => {
    test("Custom object of setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, {
            setBye: () => ({ message: "Bye" }),
            setHi: () => ({ message: "Hi" }),
        }, { initial }));
        const setters = result.current[1];

        expect(result.current.length).toBe(3);
        expect(typeof result.current[0] === "function").toBe(true);
        expect(typeof setters === "object").toBe(true);
        expect(typeof result.current[2] === "function").toBe(true);
        expect(Object.keys(setters).includes("setBye")).toBe(true);
        expect(Object.keys(setters).includes("setHi")).toBe(true);
        expect(Object.values(setters).every(s => typeof s === "function")).toBe(true);
    });
    
    test("Use custom setters", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, {
            setBye: () => ({ message: "Bye" }),
            setHi: () => ({ message: "Hi" }),
        }, { initial }));
        const [Component, { setBye, setHi }] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setBye();
        });
    
        expect(container.textContent).toBe("Bye");
    
        act(() => {
            setHi();
        });
    
        expect(container.textContent).toBe("Hi");
    });
    
    test("Pass value to custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, {
            setBye: () => ({ message: "Bye" }),
            setMessage: (message) => ({ message }),
        }, { initial }));
        const [Component, { setBye, setMessage }] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setBye();
        });
    
        expect(container.textContent).toBe("Bye");
    
        act(() => {
            setMessage("Hello");
        });
    
        expect(container.textContent).toBe("Hello");
    });
    
    test("Use current value in custom setter", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, {
            setWithCurrent: () => (current) => ({ message: `${current.hookProps.message} World` })
        }, { initial }));
        const [Component, { setWithCurrent }] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    
        act(() => {
            setWithCurrent();
        });
    
        expect(container.textContent).toBe("Hello World");
    });

    test("Use current value in custom setters in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, {
            setMessage: (message) => (current) => ({ ...current.hookProps, message }),
            setMessage2: (message2) => (current) => ({ ...current.hookProps, message2 })
        }, { initial }));
        const [Component, { setMessage, setMessage2 }] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.textContent).toBe("Hello ");
    
        act(() => {
            setMessage("Foo");
            setMessage2("Bar");
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });
    
    test("Custom setter passing function", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, { setter: (message) => ({ message }) }, { initial }));
        const [Component, { setter }] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => `${current.hookProps.message} World`);
        });
    
        expect(container.textContent).toBe("Hello World");
    });

    test("Custom setter passing function in same act", () => {
        const initial = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(MultiMessageComponent, { 
            setter: (props) => (props)
        }, { initial }));
        const [Component, { setter }] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({ ...current.hookProps, message: "Foo"}));
            setter((current) => ({ ...current.hookProps, message2: "Bar"}));
        });
    
        expect(container.textContent).toBe("Foo Bar");
    });

    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, {
            reset: () => ({}),
            setBye: () => ({ message: "Bye" })
        }));
        const [Component, { reset, setBye }] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(container.textContent).toBe("Hi");
    
        act(() => {
            setBye();
        });
    
        expect(container.textContent).toBe("Bye");
    
        act(() => {
            reset();
        });
    
        expect(container.textContent).toBe("Hi");
    });

    test("Test that __async is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            setter: () => ({ __async: true })
        }));
        const [Component, { setter }] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("__async")).toBe(true);
    });

    test("Test asyncProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            setter: () => ({ bar: true })
        }, {
            asyncProp: "bar"
        }));
        const [Component, { setter }] = result.current;
        let setterResult;

        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        act(() => {
            setterResult = setter();
        });

        expect(setterResult instanceof Promise).toBe(true);
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test that __setters is passed", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            reset: () => ({}),
            setBye: () => ({ message: "Bye" })
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("__setters")).toBe(true);
    });

    test("Test settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            reset: () => ({}),
            setBye: () => ({ message: "Bye" })
        }, {
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(true);
    });

    test("Test omitSetters option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            reset: () => ({}),
            setBye: () => ({ message: "Bye" })
        }, {
            omitSetters: true
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });

    test("Test omitSetters option with settersProp option", () => {
        const { result } = renderHook(() => useHookedComponent(PropsComponent, {
            reset: () => ({}),
            setBye: () => ({ message: "Bye" })
        }, {
            omitSetters: true,
            settersProp: "bar"
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(JSON.parse(container.textContent).includes("bar")).toBe(false);
    });
});

describe("Test using an HTML element", () => {
    test("Basic test", () => {
        const { result } = renderHook(() => useHookedComponent("div"));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.firstChild.tagName.toLowerCase()).toBe("div");
    });

    test("Setting an attribute", () => {
        const { result } = renderHook(() => useHookedComponent("div"));
        const [Component] = result.current;
    
        act(() => {
            render(<Component className="foo" />, container);
        });
    
        expect(container.firstChild.hasAttribute("class")).toBe(true);
        expect(container.firstChild.getAttribute("class")).toBe("foo");
    });

    test("Setting an attribute using initial option", () => {
        const { result } = renderHook(() => useHookedComponent("div", undefined, {
            initial: {
                className: "foo"
            }
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.firstChild.hasAttribute("class")).toBe(true);
        expect(container.firstChild.getAttribute("class")).toBe("foo");
    });

    test("Setting an attribute using props option", () => {
        const { result } = renderHook(() => useHookedComponent("div", {}, {
            props: {
                "className": "foo"
            }
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.firstChild.hasAttribute("class")).toBe(true);
        expect(container.firstChild.getAttribute("class")).toBe("foo");
    });

    test("Ensure __setters is NOT passed", () => {
        const { result } = renderHook(() => useHookedComponent("div", {
            setFoo: () => {}
        }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        expect(container.firstChild.hasAttribute("__setters")).toBe(false);
    });

    test("Ensure __async is NOT passed", () => {
        const { result } = renderHook(() => useHookedComponent("div", {
            setFoo: () => ({ __async: true })
        }));
        const [Component, { setFoo }] = result.current;
    
        act(() => {
            render(<Component />, container);
        });
    
        act(() => {
            setFoo();
        });

        expect(container.firstChild.hasAttribute("__async")).toBe(false);
    });
});
