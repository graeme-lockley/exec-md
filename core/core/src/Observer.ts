export interface Observer {
    fulfilled(value: any): void;
    pending(): void;
    rejected(value?: any): void;
};
