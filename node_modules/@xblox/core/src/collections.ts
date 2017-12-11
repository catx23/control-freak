/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

export interface Key {
	toString(): string;
}

export interface Entry<K, T> {
	next?: Entry<K, T>;
	prev?: Entry<K, T>;
	key: K;
	value: T;
}

/**
 * A simple map to store value by a key object. Key can be any object that has toString() function to get
 * string value of the key.
 */
export class LinkedMap<K extends Key, T> {

	protected map: { [key: string]: Entry<K, T> };
	protected _size: number;

	constructor() {
		this.map = Object.create(null);
		this._size = 0;
	}

	public get size(): number {
		return this._size;
	}

	public get(k: K): T {
		const value = this.peek(k);

		return value ? value : null;
	}

	public getOrSet(k: K, t: T): T {
		const res = this.get(k);
		if (res) {
			return res;
		}

		this.set(k, t);

		return t;
	}

	public keys(): K[] {
		const keys: K[] = [];
		for (let key in this.map) {
			keys.push(this.map[key].key);
		}
		return keys;
	}

	public values(): T[] {
		const values: T[] = [];
		for (let key in this.map) {
			values.push(this.map[key].value);
		}
		return values;
	}

	public entries(): Entry<K, T>[] {
		const entries: Entry<K, T>[] = [];
		for (let key in this.map) {
			entries.push(this.map[key]);
		}
		return entries;
	}

	public set(k: K, t: T): boolean {
		if (this.get(k)) {
			return false; // already present!
		}

		this.push(k, t);

		return true;
	}

	public delete(k: K): T {
		let value: T = this.get(k);
		if (value) {
			this.pop(k);
			return value;
		}
		return null;
	}

	public has(k: K): boolean {
		return !!this.get(k);
	}

	public clear(): void {
		this.map = Object.create(null);
		this._size = 0;
	}

	protected push(key: K, value: T): void {
		const entry: Entry<K, T> = { key, value };
		this.map[key.toString()] = entry;
		this._size++;
	}

	protected pop(k: K): void {
		delete this.map[k.toString()];
		this._size--;
	}

	protected peek(k: K): T {
		const entry = this.map[k.toString()];
		return entry ? entry.value : null;
	}
}

/**
 * A simple Map<T> that optionally allows to set a limit of entries to store. Once the limit is hit,
 * the cache will remove the entry that was last recently added. Or, if a ratio is provided below 1,
 * all elements will be removed until the ratio is full filled (e.g. 0.75 to remove 25% of old elements).
 */
export class BoundedLinkedMap<T> {
	protected map: { [key: string]: Entry<string, T> };
	private head: Entry<string, T>;
	private tail: Entry<string, T>;
	private _size: number;
	private ratio: number;

	constructor(private limit = Number.MAX_VALUE, ratio = 1) {
		this.map = Object.create(null);
		this._size = 0;
		this.ratio = limit * ratio;
	}

	public get size(): number {
		return this._size;
	}

	public set(key: string, value: T): boolean {
		if (this.map[key]) {
			return false; // already present!
		}

		const entry: Entry<string, T> = { key, value };
		this.push(entry);

		if (this._size > this.limit) {
			this.trim();
		}

		return true;
	}

	public get(key: string): T {
		const entry = this.map[key];

		return entry ? entry.value : null;
	}

	public getOrSet(k: string, t: T): T {
		const res = this.get(k);
		if (res) {
			return res;
		}

		this.set(k, t);

		return t;
	}

	public delete(key: string): T {
		const entry = this.map[key];

		if (entry) {
			this.map[key] = void 0;
			this._size--;

			if (entry.next) {
				entry.next.prev = entry.prev; // [A]<-[x]<-[C] = [A]<-[C]
			} else {
				this.head = entry.prev; // [A]-[x] = [A]
			}

			if (entry.prev) {
				entry.prev.next = entry.next; // [A]->[x]->[C] = [A]->[C]
			} else {
				this.tail = entry.next; // [x]-[A] = [A]
			}

			return entry.value;
		}

		return null;
	}

	public has(key: string): boolean {
		return !!this.map[key];
	}

	public clear(): void {
		this.map = Object.create(null);
		this._size = 0;
		this.head = null;
		this.tail = null;
	}

	protected push(entry: Entry<string, T>): void {
		if (this.head) {
			// [A]-[B] = [A]-[B]->[X]
			entry.prev = this.head;
			this.head.next = entry;
		}

		if (!this.tail) {
			this.tail = entry;
		}

		this.head = entry;

		this.map[entry.key] = entry;
		this._size++;
	}

	private trim(): void {
		if (this.tail) {

			// Remove all elements until ratio is reached
			if (this.ratio < this.limit) {
				let index = 0;
				let current = this.tail;
				while (current.next) {

					// Remove the entry
					this.map[current.key] = void 0;
					this._size--;

					// if we reached the element that overflows our ratio condition
					// make its next element the new tail of the Map and adjust the size
					if (index === this.ratio) {
						this.tail = current.next;
						this.tail.prev = null;

						break;
					}

					// Move on
					current = current.next;
					index++;
				}
			}

			// Just remove the tail element
			else {
				this.map[this.tail.key] = void 0;
				this._size--;

				// [x]-[B] = [B]
				this.tail = this.tail.next;
				this.tail.prev = null;
			}
		}
	}
}

/**
 * A subclass of Map<T> that makes an entry the MRU entry as soon
 * as it is being accessed. In combination with the limit for the
 * maximum number of elements in the cache, it helps to remove those
 * entries from the cache that are LRU.
 */
export class LRUCache<T> extends BoundedLinkedMap<T> {

	constructor(limit: number) {
		super(limit);
	}

	public get(key: string): T {

		// Upon access of an entry, make it the head of
		// the linked map so that it is the MRU element
		const entry = this.map[key];
		if (entry) {
			this.delete(key);
			this.push(entry);

			return entry.value;
		}


		return null;
	}
}

// --- trie'ish datastructure

class Node<E> {
	element?: E;
	readonly children = new Map<string, E>();
}

/**
 * A trie map that allows for fast look up when keys are substrings
 * to the actual search keys (dir/subdir-problem).
 */
export class TrieMap<E> {

	static PathSplitter = (s: string) => s.split(/[\\/]/).filter(s => !!s);

	private _splitter: (s: string) => string[];
	private _root = new Node<E>();

	constructor(splitter: (s: string) => string[]) {
		this._splitter = splitter;
	}

	insert(path: string, element: E): void {
		const parts = this._splitter(path);
		let i = 0;

		// find insertion node
		let node = this._root;
		for (; i < parts.length; i++) {
			let child = node.children[parts[i]];
			if (child) {
				node = child;
				continue;
			}
			break;
		}

		// create new nodes
		let newNode: Node<E>;
		for (; i < parts.length; i++) {
			newNode = new Node<E>();
			node.children[parts[i]] = newNode;
			node = newNode;
		}

		node.element = element;
	}

	lookUp(path: string): E {
		const parts = this._splitter(path);

		let {children} = this._root;
		let node: Node<E>;
		for (const part of parts) {
			node = children[part];
			if (!node) {
				return;
			}
			children = node.children;
		}

		return node.element;
	}

	findSubstr(path: string): E {
		const parts = this._splitter(path);

		let lastNode: Node<E>;
		let {children} = this._root;
		for (const part of parts) {
			const node = children[part];
			if (!node) {
				break;
			}
			if (node.element) {
				lastNode = node;
			}
			children = node.children;
		}

		// return the last matching node
		// that had an element
		if (lastNode) {
			return lastNode.element;
		}
	}

	findSuperstr(path: string): TrieMap<E> {
		const parts = this._splitter(path);

		let {children} = this._root;
		let node: Node<E>;
		for (const part of parts) {
			node = children[part];
			if (!node) {
				return;
			}
			children = node.children;
		}

		const result = new TrieMap<E>(this._splitter);
		result._root = node;
		return result;
	}
}

export class ArraySet<T> {

	private _elements: T[];

	constructor(elements: T[] = []) {
		this._elements = elements.slice();
	}

	get size(): number {
		return this._elements.length;
	}

	set(element: T): void {
		this.unset(element);
		this._elements.push(element);
	}

	contains(element: T): boolean {
		return this._elements.indexOf(element) > -1;
	}

	unset(element: T): void {
		const index = this._elements.indexOf(element);

		if (index > -1) {
			this._elements.splice(index, 1);
		}
	}

	get elements(): T[] {
		return this._elements.slice();
	}
}
/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default ist zero).
 */
export function tail<T>(array: T[], n: number = 0): T {
	return array[array.length - (1 + n)];
}

export function equals<T>(one: T[], other: T[], itemEquals: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
	if (one.length !== other.length) {
		return false;
	}

	for (let i = 0, len = one.length; i < len; i++) {
		if (!itemEquals(one[i], other[i])) {
			return false;
		}
	}

	return true;
}

export function binarySearch<T>(array: T[], key: T, comparator: (op1: T, op2: T) => number): number {
	let low = 0,
		high = array.length - 1;

	while (low <= high) {
		let mid = ((low + high) / 2) | 0;
		let comp = comparator(array[mid], key);
		if (comp < 0) {
			low = mid + 1;
		} else if (comp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
}

/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
export function findFirst<T>(array: T[], p: (x: T) => boolean): number {
	let low = 0, high = array.length;
	if (high === 0) {
		return 0; // no children
	}
	while (low < high) {
		let mid = Math.floor((low + high) / 2);
		if (p(array[mid])) {
			high = mid;
		} else {
			low = mid + 1;
		}
	}
	return low;
}

/**
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @return The first n elemnts from array when sorted with compare.
 */
export function top<T>(array: T[], compare: (a: T, b: T) => number, n: number): T[] {
	if (n === 0) {
		return [];
	}
	const result = array.slice(0, n).sort(compare);
	for (let i = n, m = array.length; i < m; i++) {
		const element = array[i];
		if (compare(element, result[n - 1]) < 0) {
			result.pop();
			const j = findFirst(result, e => compare(element, e) < 0);
			result.splice(j, 0, element);
		}
	}
	return result;
}

/**
 * @returns a new array with all undefined or null values removed. The original array is not modified at all.
 */
export function coalesce<T>(array: T[]): T[] {
	if (!array) {
		return array;
	}

	return array.filter(e => !!e);
}

/**
 * Moves the element in the array for the provided positions.
 */
export function move(array: any[], from: number, to: number): void {
	array.splice(to, 0, array.splice(from, 1)[0]);
}

/**
 * @returns {{false}} if the provided object is an array
 * 	and not empty.
 */
export function isFalsyOrEmpty(obj: any): boolean {
	return !Array.isArray(obj) || (<Array<any>>obj).length === 0;
}

/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equalness by returning a unique string for each.
 */
export function distinct<T>(array: T[], keyFn?: (t: T) => string): T[] {
	if (!keyFn) {
		return array.filter((element, position) => {
			return array.indexOf(element) === position;
		});
	}

	const seen: { [key: string]: boolean; } = Object.create(null);
	return array.filter((elem) => {
		const key = keyFn(elem);
		if (seen[key]) {
			return false;
		}

		seen[key] = true;

		return true;
	});
}

export function uniqueFilter<T>(keyFn: (t: T) => string): (t: T) => boolean {
	const seen: { [key: string]: boolean; } = Object.create(null);

	return element => {
		const key = keyFn(element);

		if (seen[key]) {
			return false;
		}

		seen[key] = true;
		return true;
	};
}

export function firstIndex<T>(array: T[], fn: (item: T) => boolean): number {
	for (let i = 0; i < array.length; i++) {
		const element = array[i];

		if (fn(element)) {
			return i;
		}
	}

	return -1;
}

export function first<T>(array: T[], fn: (item: T) => boolean, notFoundValue: T = null): T {
	const index = firstIndex(array, fn);
	return index < 0 ? notFoundValue : array[index];
}

export function commonPrefixLength<T>(one: T[], other: T[], equals: (a: T, b: T) => boolean = (a, b) => a === b): number {
	let result = 0;

	for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
		result++;
	}

	return result;
}

export function flatten<T>(arr: T[][]): T[] {
	return arr.reduce((r, v) => r.concat(v), []);
}

export function range(to: number, from = 0): number[] {
	const result: number[] = [];

	for (let i = from; i < to; i++) {
		result.push(i);
	}

	return result;
}

export function fill<T>(num: number, valueFn: () => T, arr: T[] = []): T[] {
	for (let i = 0; i < num; i++) {
		arr[i] = valueFn();
	}

	return arr;
}

export function index<T>(array: T[], indexer: (t: T) => string): { [key: string]: T; };
export function index<T, R>(array: T[], indexer: (t: T) => string, merger?: (t: T, r: R) => R): { [key: string]: R; };
export function index<T, R>(array: T[], indexer: (t: T) => string, merger: (t: T, r: R) => R = t => t as any): { [key: string]: R; } {
	return array.reduce((r, t) => {
		const key = indexer(t);
		r[key] = merger(t, r[key]);
		return r;
	}, Object.create(null));
}

/**
 * Inserts an element into an array. Returns a function which, when
 * called, will remove that element from the array.
 */
export function insert<T>(array: T[], element: T): () => void {
	array.push(element);

	return () => {
		const index = array.indexOf(element);
		if (index > -1) {
			array.splice(index, 1);
		}
	};
}
