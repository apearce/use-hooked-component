import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { renderHook } from "@testing-library/react-hooks";
import useHookedComponent from "../src/useHookedComponent";

let container = null;
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
    
    test("Use current value in custom setters", () => {
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
});
