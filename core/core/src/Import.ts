import { AbstractFile } from "@observablehq/stdlib";
import { importParser } from "./MarkedTemplateParser";

export const load = async (name: string) => {
    const fetchResponse = await fetch(name);
    const text = await fetchResponse.text();

    return text;
};

export const importContent = (content: string, module) =>
    importParser(content, module);

class FA extends AbstractFile {
    name: string;

    constructor(name: string) {
        super(name, name);
    }

    url() {
        return this.name;
    }
}

export const loadSource = (url: string): FA =>
    new FA(url);