import * as DBus from "dbus-next";
import { EventEmitter } from "events";

function getDbusArrayTypes(arr: any[]): string[] {
    return arr
        .map(detectDbusType)
        .sort()
        .filter((value, index, self) => self.indexOf(value) === index);
}

export function detectDbusType(v: any): string {
    switch (typeof v) {
        case "bigint":
            return "x";
        case "string":
            return "s";
        case "boolean":
            return "b";
        case "number":
            if (Number.isInteger(v)) return "i";
            else return "d";
        case "object":
            if (Buffer.isBuffer(v)) {
                return "ay";
            }
            if (Array.isArray(v)) {
                if (v.length === 0) return "av";
                const types = getDbusArrayTypes(v);
                if (types.length === 1) {
                    return "a" + types[0];
                }
                return "av";
            }
            if (v.constructor === DBus.Variant) {
                return "v";
            }
            return "a{sv}";
        default:
            throw new Error("Could not detect signature for value of type " + typeof v);
    }
}

/**
 * This will create `v` signature
 * @param obj
 */
export function wrapDbusVariant(obj: any, type?: string): DBus.Variant {
    const detectedType = detectDbusType(obj);
    if (detectedType === "v") return obj;
    if (!type) type = detectedType;
    if (type[0] === "a" && type.includes("v")) {
        // recurse
        if (Array.isArray(obj)) {
            return new DBus.Variant(type, wrapDbusVariantArray(obj));
        }
        return new DBus.Variant(type, wrapDbusVariantObject(obj));
    }
    return new DBus.Variant(type, obj);
}

/**
 * This will create `a{sv}` signature
 * @param obj
 */
export function wrapDbusVariantObject(obj: { [key: string]: any }): { [key: string]: DBus.Variant } {
    const res = Object.assign({}, obj);
    for (const key in res) {
        res[key] = wrapDbusVariant(res[key]);
    }
    return res;
}
/**
 * This will create `av` signature
 * @param obj
 */
export function wrapDbusVariantArray(obj: any[]): DBus.Variant[] {
    return obj.map((v) => wrapDbusVariant(v));
}

export function wrapDbusSignature(obj: any, type: string): any {
    if (type === "v") return wrapDbusVariant(obj);
    if (type === "av") return wrapDbusVariantArray(obj);
    if (type === "a{sv}") return wrapDbusVariantObject(obj);
    if (type === "ay") {
        if (Buffer.isBuffer(obj)) {
            return obj.toJSON().data;
        }
        return obj;
    }
    if (type.includes("v")) {
        // TODO: other variant type
        console.warn("Unhandled Variant Type: %s. Please report this the Bluez library", type);
    }
    return obj;
}

/**
 * This unwarps `v` signatures
 * @param obj
 */
export function unwrapDbusVariant(obj: DBus.Variant): any {
    if (obj.signature === "ay") {
        return Buffer.from(obj.value);
    }
    if (obj.signature.includes("v")) {
        // recurse
        if (Array.isArray(obj.value)) {
            return unwrapDbusVariantArray(obj.value);
        }
        if (obj.value.constructor === DBus.Variant) {
            return unwrapDbusVariant(obj.value);
        }
        return unwrapDbusVariantObject(obj.value);
    }
    return obj.value;
}

/**
 * This unwraps `a{sv}` signatures
 * @param obj
 */
export function unwrapDbusVariantObject(obj: { [key: string]: DBus.Variant }): { [key: string]: any } {
    const res = Object.assign({}, obj); // clone object structure
    for (const [k, v] of Object.entries(obj)) {
        res[k] = unwrapDbusVariant(v);
    }
    return res;
}
/**
 * This unwraps `av` signatures
 * @param obj
 */
export function unwrapDbusVariantArray(obj: DBus.Variant[]): any[] {
    return obj.map(unwrapDbusVariant);
}

/** This unwraps anything */
export function unwrapDbusVariantAll(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.constructor === DBus.Variant) return unwrapDbusVariant(obj);
    if (Array.isArray(obj)) {
        return obj.map(unwrapDbusVariantAll);
    }
    // otherwise its an object
    const res = Object.assign({}, obj); // clone object structure
    for (const key in obj) {
        res[key] = unwrapDbusVariantAll(obj[key]);
    }
    return res;
}

export function unwrapDbusSignature(type: string): (obj: any) => any {
    if (type.includes("v")) return unwrapDbusVariantAll;
    if (type === "ay") {
        return function (obj: any) {
            return Buffer.from(obj);
        };
    }
    if (type.includes("ay")) {
        // TODO: directly extract Buffer at index
        return unwrapDbusVariantAll;
    }
    return function (obj: any) {
        return obj;
    };
}

type DefaultFunction = (...args: any[]) => any;
export type EventListenerSignature<L> = {
    [E in keyof L]: DefaultFunction;
};

export interface TypedEmitter<L extends EventListenerSignature<L> = Record<string, never>> {
    //static defaultMaxListeners: number;
    addListener<U extends keyof L>(event: U, listener: L[U]): this;
    prependListener<U extends keyof L>(event: U, listener: L[U]): this;
    prependOnceListener<U extends keyof L>(event: U, listener: L[U]): this;
    removeListener<U extends keyof L>(event: U, listener: L[U]): this;
    removeAllListeners(event?: keyof L): this;
    once<U extends keyof L>(event: U, listener: L[U]): this;
    on<U extends keyof L>(event: U, listener: L[U]): this;
    off<U extends keyof L>(event: U, listener: L[U]): this;
    emit<U extends keyof L>(event: U, ...args: Parameters<L[U]>): boolean;
    eventNames<U extends keyof L>(): U[];
    listenerCount(type: keyof L): number;
    listeners<U extends keyof L>(type: U): L[U][];
    rawListeners<U extends keyof L>(type: U): L[U][];
    getMaxListeners(): number;
    setMaxListeners(n: number): this;
}
export const TypedEmitter: {
    new <L extends EventListenerSignature<L> = Record<string, never>>(): TypedEmitter<L>;
} = EventEmitter as any;

export interface LooselyTypedEmitter<L extends EventListenerSignature<L> = Record<string, never>> {
    //static defaultMaxListeners: number;
    addListener<U extends keyof L>(event: U, listener: L[U]): this;
    addListener(event: string, listener: DefaultFunction): this;
    prependListener<U extends keyof L>(event: U, listener: L[U]): this;
    prependListener(event: string, listener: DefaultFunction): this;
    prependOnceListener<U extends keyof L>(event: U, listener: L[U]): this;
    prependOnceListener(event: string, listener: DefaultFunction): this;
    removeListener<U extends keyof L>(event: U, listener: L[U]): this;
    removeListener(event: string, listener: DefaultFunction): this;
    removeAllListeners(event?: keyof L): this;
    removeAllListeners(event?: string): this;
    once<U extends keyof L>(event: U, listener: L[U]): this;
    once(event: string, listener: DefaultFunction): this;
    on<U extends keyof L>(event: U, listener: L[U]): this;
    on(event: string, listener: DefaultFunction): this;
    off<U extends keyof L>(event: U, listener: L[U]): this;
    off(event: string, listener: DefaultFunction): this;
    emit<U extends keyof L>(event: U, ...args: Parameters<L[U]>): boolean;
    emit(event: string, ...args: any[]): boolean;
    eventNames<U extends keyof L>(): U[];
    listenerCount(type: keyof L): number;
    listenerCount(type: string): number;
    listeners<U extends keyof L>(type: U): L[U][];
    listeners(type: string): DefaultFunction[];
    rawListeners<U extends keyof L>(type: U): L[U][];
    rawListeners(type: string): DefaultFunction[];
    getMaxListeners(): number;
    setMaxListeners(n: number): this;
}
export const LooselyTypedEmitter: {
    new <L extends EventListenerSignature<L> = Record<string, never>>(): LooselyTypedEmitter<L>;
} = EventEmitter as any;
