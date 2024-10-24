type Obj<T = unknown> = { [k: string]: T };

interface Options {
    asyncProp?: string,
    displayName?: string;
    initial?: Obj;
    omitSetters?: boolean;
    props?: Obj;
    settersProp?: string;
}

interface IHookedComponent {
    (props?: Obj): React.JSX.Element;
    displayName: string;
};

type BasicSetter = (...args: unknown[]) => Obj;
type CurrentProps = { hookProps: Obj, props: Obj };
type CurrentCallback = (current: CurrentProps) => Obj;
type CallbackSetter = (...args: unknown[]) => CurrentCallback;
type DefaultSetter = (v: Obj) => Obj; 
type Setter = BasicSetter | CallbackSetter;
type SettersArray = Setter[];
type SettersObject = Obj<Setter>;
type Setters = Setter | SettersArray | SettersObject;
type UpdatedSetter = (...args: unknown[]) => undefined | Promise<unknown>;
type UpdatedSetters = UpdatedSetter[]; 
type UpdatedSetterObject = Obj<UpdatedSetter>; 
type RetVal = [IHookedComponent, ...([UpdatedSetterObject] | UpdatedSetters), () => CurrentProps];

export {
    CurrentProps,
    DefaultSetter,
    Obj,
    Options,
    RetVal,
    Setter,
    Setters,
    UpdatedSetter,
    UpdatedSetterObject
};
