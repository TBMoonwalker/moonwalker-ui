export function isJsonString(str: any) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export function isFloat(n: any) {
    return Number(n) === n && n % 1 !== 0;
}
