export interface LeafEvent {
    leaf: INavigationLeaf;
}

export type INavigationItem =
    INavigationLeaf | INavigationNode;

export interface INavigationLeaf {
    type: "leaf";
    name: string;
    resource: string;
}

export interface INavigationNode {
    type: "node";
    name: string;
    children: Array<INavigationItem>;
}
