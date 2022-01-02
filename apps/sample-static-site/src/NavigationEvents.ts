export interface LeafEvent {
    leaf: INavigationLeaf;
}

export type INavigationItem =
    INavigationLeaf | INavigationNode;

export interface INavigationLeaf {
    name: string;
    resource: string;
}

export interface INavigationNode {
    node: string;
    children: Array<INavigationItem>;
}
