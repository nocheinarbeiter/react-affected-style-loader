import {
    ReactNode, ReactChild,
    HTMLAttributes, ClassAttributes, DetailedReactHTMLElement
} from 'react';


// original ReactFragment type defined as "{} | Array<...>" in @types/react
// using "{}" makes not possible for type checker to distinguish regular Props object form ReactChild object
// so the first argument in markup factory function can not be optional
// to walkaround this we introduce StrictReactFragment type
export type StrictReactFragment = Array<ReactChild | any[] | boolean>;
export type StrictReactNode = ReactChild | StrictReactFragment | boolean | null | undefined;

// another walkaround about extending props with mods:
// original declaration for this in @types/react DOMFactory looks like "props?: ClassAttributes<T> & P"
// (where P extends HTMLAttributes<T>, T extends HTMLElement)
// if we extends that declaration as "props?: ClassAttributes<T> & P & {mods?: M}"
//      then type validation for mods does not works well:
//      undeclared mod keys may presents without any errors (see typecheck-comparison.ts);
// so if we make such extension using interfaces, it's ok (generated below)

// custom version of DetailedHTMLFactory with mods support
export interface Factory<TModProps, TAttributes extends HTMLAttributes<TElement>, TElement extends HTMLElement> {
    (child?: StrictReactNode, ...children: ReactNode[]): DetailedReactHTMLElement<TAttributes, TElement>;
    (props?: TModProps, ...children: ReactNode[]): DetailedReactHTMLElement<TAttributes, TElement>;
}
