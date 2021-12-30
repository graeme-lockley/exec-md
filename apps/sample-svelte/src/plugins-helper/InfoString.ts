export const parse = (infostring: string): Map<string, string> => {
    return new Map(infostring.split("|").map(s => s.trim()).map(s => {
        const i = s.indexOf(' ');

        return i == -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1).trim()];
    }));
}
