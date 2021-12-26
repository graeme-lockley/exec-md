import { parseCell } from "@observablehq/parser";

export interface ImportStatement {
    type: "import";
    names: Array<{ name: string; alias: string }>;
    urn: string;
}

export interface AssignmentStatement {
    type: "assignment";
    name?: string;
    dependencies: Array<string>;
    body: string;
    fullBody: string;
    result: () => any
}

export type ParseResult = AssignmentStatement | ImportStatement;

export const parse = (code: string): ParseResult => {
    try {
        const ast = parseCell(code);

        if (ast?.body?.type === "ImportDeclaration") {
            const names: Array<{ name: string; alias: string }> =
                ast.body.specifiers.map(s => ({ name: s.imported.name, alias: s.local.name }));

            const urn: string =
                ast.body.source.value;

            return { type: "import", names, urn };
        } else {
            const name = ast.id !== null && ast.id.type === "Identifier" ? ast.id.name : undefined;
            const referencedNames = ast.references.map((dep: { name: string }) => dep.name);
            const dependencies = uniqueElementsInStringArray(referencedNames);
            const body = code.slice(ast.body.start, ast.body.end);

            const fullBody = `(${dependencies.join(", ")}) => ${body}`;

            // eslint-disable-next-line
            const result = eval(fullBody);

            return { type: "assignment", name, dependencies, body, fullBody, result };
        }
    } catch (e) {
        return { type: "assignment", name: undefined, dependencies: [], body: code, fullBody: code, result: () => { throw e; } };
    }
}

const uniqueElementsInStringArray = (inp: Array<string>): Array<string> =>
    Array.from(new Set<string>(inp))

export const parseInfoString = (infostring: string): Map<string, string> => {
    return new Map(infostring.split("|").map(s => s.trim()).map(s => {
        const i = s.indexOf(' ');

        return i == -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1).trim()];
    }));
}
