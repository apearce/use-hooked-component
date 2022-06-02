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

    test("Inital state", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component />, container);
        });

        expect(container.textContent).toBe("Hello");
    });

    test("Getter", () => {
        const initalState = { message: "Hello" };
        const { result } = renderHook(() => useHookedComponent(TestComponent, initalState));
        const [Component, , getter] = result.current;

        expect(getter()).toBe(initalState);
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
        expect(getter()).toBe(newState);
    });

    test("Default setter passing function", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }));
        const [Component, setter] = result.current;

        act(() => {
            render(<Component message="Test" />, container);
        });

        act(() => {
            setter((current) => ({
                message: `${current.message} World`
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }));
        const [Component] = result.current;
    
        act(() => {
            render(<Component message="Hi" />, container);
        });
    
        expect(container.textContent).toBe("Hello");
    });
});

describe("Test passing a single setter", () => {
    test("Custom array of setters", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, () => ({ message: "World" })));
    
        expect(result.current.length).toBe(3);
        expect(result.current.every(r => typeof r === "function")).toBe(true);
    });
    
    test("Use custom setter", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, () => ({ message: "World" })));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, (message) => ({ message })));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, (current) => ({ message: `${current.message} World` })));
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
    
    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, {}, (...args) => {
            if (args.length === 2) {
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, [
            (prop) => ({ prop, show: true }),
            () => ({ show: false }),
        ]));
    
        expect(result.current.length).toBe(4);
        expect(result.current.every(r => typeof r === "function")).toBe(true);
    });
    
    test("Use custom setters", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, [
            () => ({ message: "World" }),
            () => ({}),
        ]));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, [
            () => ({ message: "World" }),
            (message) => ({ message }),
        ]));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, [
            (current) => ({ message: `${current.message} World` }),
            () => ({}),
        ]));
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
    
    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, {}, [
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, {
            setBye: () => ({ message: "Bye" }),
            setHi: () => ({ message: "Hi" }),
        }));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, {
            setBye: () => ({ message: "Bye" }),
            setHi: () => ({ message: "Hi" }),
        }));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, {
            setBye: () => ({ message: "Bye" }),
            setMessage: (message) => ({ message }),
        }));
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
        const { result } = renderHook(() => useHookedComponent(TestComponent, { message: "Hello" }, {
            setWithCurrent: (current) => ({ message: `${current.message} World` })
        }));
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
    
    test("Default props", () => {
        const { result } = renderHook(() => useHookedComponent(TestComponent, {}, {
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
