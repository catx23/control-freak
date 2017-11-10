define([
	"intern!bdd",
	"intern/chai!expect",
	"../../Observable",
	"../../features",
	"../../ObservableArray"
], function (bdd, expect, Observable, has, ObservableArray) {
	/* jshint withstmt: true */
	/* global describe, afterEach, it */
	with (bdd) {
		describe("ObservableArray", function () {
			var handles = [],
				baseData = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
			afterEach(function () {
				for (var handle = null; (handle = handles.shift());) {
					handle.remove();
				}
			});
			it("ObservableArray as constructor or as function", function () {
				/* jshint newcap: false */
				var a = baseData.slice(),
					observableArray = ObservableArray.apply(undefined, baseData);
				expect(new ObservableArray("a", "b", "c")).to.deep.equal(["a", "b", "c"]);
				expect(ObservableArray(3).length).to.equal(3);
				expect(new ObservableArray(3).length).to.equal(3);
				expect(Array.apply(undefined, ObservableArray(3))).to.deep.equal([undefined, undefined, undefined]);
				expect(ObservableArray.apply(undefined, ObservableArray(3)))
					.to.deep.equal([undefined, undefined, undefined]);
				expect(ObservableArray.apply(undefined, new ObservableArray(3)))
					.to.deep.equal([undefined, undefined, undefined]);
				expect(ObservableArray.apply(a, ObservableArray(3))).to.deep.equal([undefined, undefined, undefined]);
				expect(a).to.deep.equal(baseData);
				expect(ObservableArray.apply(a, new ObservableArray(3)))
					.to.deep.equal([undefined, undefined, undefined]);
				expect(a).to.deep.equal(baseData);
				expect(ObservableArray.apply(observableArray, ObservableArray(3)))
					.to.deep.equal([undefined, undefined, undefined]);
				expect(observableArray).to.deep.equal(baseData);
				expect(ObservableArray.apply(observableArray, new ObservableArray(3)))
					.to.deep.equal([undefined, undefined, undefined]);
				expect(observableArray).to.deep.equal(baseData);
			});
			it("Observable.observe() with push()/pop()/shift()/unshift() to ObservableArray instance", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 10,
							removed: [],
							addedCount: 2
						},
						{
							type: "splice",
							object: observableArray,
							index: 11,
							removed: ["l"],
							addedCount: 0
						},
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: [],
							addedCount: 2
						},
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: ["0"],
							addedCount: 0
						}
					]);
				}), ["update", "splice"]));
				observableArray.push("k", "l");
				observableArray.pop();
				observableArray.unshift("0", "1");
				observableArray.shift();
			});
			it("Observing for array length", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					if (has("object-observe-api")) {
						expect(records).to.deep.equal([
							{
								type: "add",
								object: observableArray,
								name: "10"
							},
							{
								type: "update",
								object: observableArray,
								name: "length",
								oldValue: 10
							},
							{
								type: "add",
								object: observableArray,
								name: "11"
							},
							{
								type: "update",
								object: observableArray,
								name: "length",
								oldValue: 11
							},
							{
								type: "delete",
								object: observableArray,
								name: "11",
								oldValue: "l"
							},
							{
								type: "update",
								object: observableArray,
								name: "length",
								oldValue: 12
							}
						]);
					} else {
						// Shim part of ObservableArray does not emit change records for array indices
						// as doing so will be heavy
						expect(records).to.deep.equal([
							{
								type: "update",
								object: observableArray,
								name: "length",
								oldValue: 10
							},
							{
								type: "update",
								object: observableArray,
								name: "length",
								oldValue: 12
							}
						]);
					}
				})));
				observableArray.push("k", "l");
				observableArray.pop();
			});
			it("Observable.observe() with reverse() to ObservableArray instance", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					if (has("object-observe-api")) {
						expect(records.sort(function (dst, src) { return dst.name - src.name; })).to.deep.equal([
							{
								type: "update",
								object: observableArray,
								name: "0",
								oldValue: "a"
							},
							{
								type: "update",
								object: observableArray,
								name: "1",
								oldValue: "b"
							},
							{
								type: "update",
								object: observableArray,
								name: "2",
								oldValue: "c"
							},
							{
								type: "update",
								object: observableArray,
								name: "3",
								oldValue: "d"
							},
							{
								type: "update",
								object: observableArray,
								name: "4",
								oldValue: "e"
							},
							{
								type: "update",
								object: observableArray,
								name: "5",
								oldValue: "f"
							},
							{
								type: "update",
								object: observableArray,
								name: "6",
								oldValue: "g"
							},
							{
								type: "update",
								object: observableArray,
								name: "7",
								oldValue: "h"
							},
							{
								type: "update",
								object: observableArray,
								name: "8",
								oldValue: "i"
							},
							{
								type: "update",
								object: observableArray,
								name: "9",
								oldValue: "j"
							}
						]);
					} else {
						expect(records).to.deep.equal([
							{
								type: "splice",
								object: observableArray,
								index: 0,
								removed: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
								addedCount: 10
							}
						]);
					}
				}), ["update", "splice"]));
				observableArray.reverse();
			});
			// ECMAScript Object.observe() emits change records for every internal change in sort().
			// Let ObservableArray.observe() squash it for this test case.
			it("ObservableArray.observe() with sort() to ObservableArray instance", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
							addedCount: 10
						}
					]);
				})));
				observableArray.sort(function (dst, src) { return src.charCodeAt(0) - dst.charCodeAt(0); });
			});
			it("Observable.observe() with setting entries to ObservableArray instance: Basic", function () {
				var dfd = this.async(1000),
					observableArray = new ObservableArray();
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: [],
							addedCount: 1
						},
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: [],
							addedCount: 1
						},
						{
							type: "splice",
							object: observableArray,
							index: 2,
							removed: [],
							addedCount: 1
						},
						{
							type: "update",
							object: observableArray,
							name: "1",
							oldValue: "b"
						},
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: [],
							addedCount: 2
						}
					]);
				}), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				observableArray.set(0, "a");
				observableArray.set(1, "b");
				observableArray.set(2, "c");
				observableArray.set(1, "B");
				observableArray.set(4, "e");
			});
			it("Observable.observe() with setting entries to ObservableArray instance: " +
			"Making array sparse", function () {
				var dfd = this.async(1000),
					observableArray = new ObservableArray();
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: [],
							addedCount: 3
						}
					]);
				}), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				observableArray.set(2, "c");
			});
			it("Observable.observe() with setting entries to ObservableArray instance: " +
			"Setting an entry to a sparse array", function () {
				var dfd = this.async(1000),
					observableArray = new ObservableArray(3);
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "add",
							object: observableArray,
							name: "1"
						}
					]);
				}), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				observableArray.set(1, "b");
			});
			it("Observable.observe() with making the length of an ObservableArray instance " +
			"bigger or smaller", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(Observable.observe(observableArray, dfd.callback(function (records) {
					expect(records).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 7,
							removed: ["h", "i", "j"],
							addedCount: 0
						},
						{
							type: "splice",
							object: observableArray,
							index: 7,
							removed: [],
							addedCount: 5
						}
					]);
				}), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				observableArray.set("length", 7);
				observableArray.set("length", 12);
			});
			it("ObservableArray.observe() with making the length of an ObservableArray instance " +
			"bigger or smaller", function () {
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 7,
							removed: ["h", "i", "j"],
							addedCount: 5
						}
					]);
				})));
				observableArray.set("length", 7);
				observableArray.set("length", 12);
			});
			it("ObservableArray.observe() with two sequential pushes", function () {
				var dfd = this.async(100),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 10,
							removed: [],
							addedCount: 2
						}
					]);
				})));
				observableArray.push("k");
				observableArray.push("l");
			});
			it("ObservableArray.observe() with setting entries to ObservableArray instance: Basic", function () {
				var dfd = this.async(1000),
					observableArray = new ObservableArray();
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 0,
							removed: [],
							addedCount: 4
						}
					]);
				})));
				observableArray.set(0, "a");
				observableArray.set(1, "b");
				observableArray.set(2, "c");
				observableArray.set(1, "B");
				observableArray.set(3, "d");
			});
			it("ObservableArray.observe() with setting entries to ObservableArray instance: " +
			"Setting an entry to a sparse array", function () {
				var dfd = this.async(1000),
					observableArray = new ObservableArray(3);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: [undefined],
							addedCount: 1
						}
					]);
				}), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				observableArray.set(1, "b");
			});
			it("ObservableArray.observe() with two splices: Second index is bigger, no intersection", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f", "g"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "A", "B", "C", "h", "i", "j"]
				// SPLICE: {index: 7, removed: ["i", "j"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "C", "h", "0", "1", "2"]
				// NO MERGE
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g"],
							addedCount: 3
						},
						{
							type: "splice",
							object: observableArray,
							index: 7,
							removed: ["i", "j"],
							addedCount: 3
						}
					]);
				})));
				observableArray.splice(3, 4, "A", "B", "C");
				observableArray.splice(7, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: Second index is bigger, adjacent", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f", "g"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "A", "B", "C", "h", "i", "j"]
				// SPLICE: {index: 6, removed: ["h", "i"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "C", "0", "1", "2", "j"]
				// MERGED: {index: 3, removed: ["d", "e", "f", "g", "h", "i"], added: ["A", "B", "C", "0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g", "h", "i"],
							addedCount: 6
						}
					]);
				})));
				observableArray.splice(3, 4, "A", "B", "C");
				observableArray.splice(6, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: Second index is bigger, intersects", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f", "g"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "A", "B", "C", "h", "i", "j"]
				// SPLICE: {index: 5, removed: ["C", "h"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "0", "1", "2", "i", "j"]
				// MERGED: {index: 3, removed: ["d", "e", "f", "g", "h"], added: ["A", "B", "0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g", "h"],
							addedCount: 5
						}
					]);
				})));
				observableArray.splice(3, 4, "A", "B", "C");
				observableArray.splice(5, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: " +
			"First splice range contains second splice range", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f"], added: ["A", "B", "C", "D"]}
				// ["a", "b", "c", "A", "B", "C", "D", "g", "h", "i", "j"]
				// SPLICE: {index: 4, removed: ["B", "C"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "0", "1", "2", "D", "g", "h", "i", "j"]
				// MERGED: {index: 3, removed: ["d", "e", "f"], added: ["A", "0", "1", "2", "D"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f"],
							addedCount: 5
						}
					]);
				})));
				observableArray.splice(3, 3, "A", "B", "C", "D");
				observableArray.splice(4, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: Second index is smaller, no intersection", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 4, removed: ["e", "f"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "d", "A", "B", "C", "g", "h", "i", "j"]
				// SPLICE: {index: 1, removed: ["b", "c"], added: ["0", "1", "2"]}
				// ["a", "0", "1", "2", "d", "A", "B", "C", "g", "h", "i", "j"]
				// NO MERGE
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: ["b", "c"],
							addedCount: 3
						},
						{
							type: "splice",
							object: observableArray,
							index: 5,
							removed: ["e", "f"],
							addedCount: 3
						}
					]);
				})));
				observableArray.splice(4, 2, "A", "B", "C");
				observableArray.splice(1, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: Second index is smaller, adjacent", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 4, removed: ["e", "f"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "d", "A", "B", "C", "g", "h", "i", "j"]
				// SPLICE: {index: 2, removed: ["c", "d"], added: ["0", "1", "2"]}
				// ["a", "b", "0", "1", "2", "A", "B", "C", "g", "h", "i", "j"]
				// MERGED: {index: 2, removed: ["c", "d", "e", "f"], added: ["0", "1", "2", "A", "B", "C"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 2,
							removed: ["c", "d", "e", "f"],
							addedCount: 6
						}
					]);
				})));
				observableArray.splice(4, 2, "A", "B", "C");
				observableArray.splice(2, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: Second index is smaller, intersects", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 4, removed: ["e", "f"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "d", "A", "B", "C", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "A"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "0", "1", "2", "B", "C", "g", "h", "i", "j"]
				// MERGED: {index: 3, removed: ["d", "e", "f"], added: ["0", "1", "2", "B", "C"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f"],
							addedCount: 5
						}
					]);
				})));
				observableArray.splice(4, 2, "A", "B", "C");
				observableArray.splice(3, 2, "0", "1", "2");
			});
			it("ObservableArray.observe() with two splices: " +
			"Second splice range contains first splice range", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 4, removed: ["e", "f"], added: ["A", "B", "C"]}
				// ["a", "b", "c", "d", "A", "B", "C", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "A", "B", "C", "g"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "0", "1", "2", "h", "i", "j"]
				// MERGED: {index: 3, removed: ["d", "e", "f", "g"], added: ["0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g"],
							addedCount: 3
						}
					]);
				})));
				observableArray.splice(4, 2, "A", "B", "C");
				observableArray.splice(3, 5, "0", "1", "2");
			});
			it("ObservableArray.observe() with three splices: " +
			"Third is adjacent with first but not with second", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f"], added: ["A", "B"]}
				// ["a", "b", "c", "A", "B", "g", "h", "i", "j"]
				// SPLICE: {index: 7, removed: ["i", "j"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "g", "h", "0", "1", "2"]
				// SPLICE: {index: 5, removed: ["g"], added: ["x", "y"]}
				// ["a", "b", "c", "A", "B", "x", "y", "h", "0", "1", "2"]
				// MERGED:
				//     {index: 3, removed: ["d", "e", "f", "g"], added: ["A", "B", "x", "y"]},
				//     {index: 8, removed: ["i, "j"], added: ["0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g"],
							addedCount: 4
						},
						{
							type: "splice",
							object: observableArray,
							index: 8,
							removed: ["i", "j"],
							addedCount: 3
						}
					]);
				})));
				observableArray.splice(3, 3, "A", "B");
				observableArray.splice(7, 2, "0", "1", "2");
				observableArray.splice(5, 1, "x", "y");
			});
			it("ObservableArray.observe() with three splices: " +
			"Third is adjacent with second but not with first", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f"], added: ["A", "B"]}
				// ["a", "b", "c", "A", "B", "g", "h", "i", "j"]
				// SPLICE: {index: 7, removed: ["i", "j"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "g", "h", "0", "1", "2"]
				// SPLICE: {index: 6, removed: ["h"], added: ["x", "y"]}
				// ["a", "b", "c", "A", "B", "g", "x", "y", "0", "1", "2"]
				// MERGED:
				//     {index: 3, removed: ["d", "e", "f"], added: ["A", "B"]},
				//     {index: 6, removed: ["h", "i, "j"], added: ["x", "y", "0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f"],
							addedCount: 2
						},
						{
							type: "splice",
							object: observableArray,
							index: 6,
							removed: ["h", "i", "j"],
							addedCount: 5
						}
					]);
				})));
				observableArray.splice(3, 3, "A", "B");
				observableArray.splice(7, 2, "0", "1", "2");
				observableArray.splice(6, 1, "x", "y");
			});
			it("ObservableArray.observe() with three splices: Third is adjacent with first and second", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 3, removed: ["d", "e", "f"], added: ["A", "B"]}
				// ["a", "b", "c", "A", "B", "g", "h", "i", "j"]
				// SPLICE: {index: 7, removed: ["i", "j"], added: ["0", "1", "2"]}
				// ["a", "b", "c", "A", "B", "g", "h", "0", "1", "2"]
				// SPLICE: {index: 5, removed: ["g", "h"], added: ["x", "y", "z"]}
				// ["a", "b", "c", "A", "B", "x", "y", "z", "0", "1", "2"]
				// MERGED: {index: 3, removed: ["d", "e", "f", "g", "h", "i", "j"],
				// 			added: ["A", "B", "x", "y", "z", "0", "1", "2"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 3,
							removed: ["d", "e", "f", "g", "h", "i", "j"],
							addedCount: 8
						}
					]);
				})));
				observableArray.splice(3, 3, "A", "B");
				observableArray.splice(7, 2, "0", "1", "2");
				observableArray.splice(5, 2, "x", "y", "z");
			});
			it("ObservableArray.observe() with three splices: First contains second and third", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 1, removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
				// 			added: ["A", "B", "C", "D", "E", "F", "G"]}
				// ["a", "A", "B", "C", "D", "E", "F", "G", "j"]
				// SPLICE: {index: 2, removed: ["B", "C"], added: ["0", "1", "2"]}
				// ["a", "A", "0", "1", "2", "D", "E", "F", "G", "j"]
				// SPLICE: {index: 6, removed: ["E", "F"], added: ["x", "y", "z"]}
				// ["a", "A", "0", "1", "2", "D", "x", "y", "z", "G", "j"]
				// MERGED: {index: 1, removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
				// 			added: ["A", "0", "1", "2", "D", "x", "y", "z", "G"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
							addedCount: 9
						}
					]);
				})));
				observableArray.splice(1, 8, "A", "B", "C", "D", "E", "F", "G");
				observableArray.splice(2, 2, "0", "1", "2");
				observableArray.splice(6, 2, "x", "y", "z");
			});
			it("ObservableArray.observe() with three splices: Second contains first and third", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 2, removed: ["c", "d", "e"], added: ["A", "B"]}
				// ["a", "b", "A", "B", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 1, removed: ["b", "A", "B", "f", "g", "h", "i"], added: ["0", "1", "2", "3"]}
				// ["a", "0", "1", "2", "3", "j"]
				// SPLICE: {index: 2, removed: ["1", "2"], added: ["x", "y", "z"]}
				// ["a", "0", "x", "y", "z", "3", "j"]
				// MERGED: {index: 1, removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
				// 			added: ["0", "x", "y", "z", "3"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
							addedCount: 5
						}
					]);
				})));
				observableArray.splice(2, 3, "A", "B");
				observableArray.splice(1, 7, "0", "1", "2", "3");
				observableArray.splice(2, 2, "x", "y", "z");
			});
			it("ObservableArray.observe() with three splices: Third contains first and second", function () {
				// ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 2, removed: ["c", "d", "e"], added: ["A", "B"]}
				// ["a", "b", "A", "B", "f", "g", "h", "i", "j"]
				// SPLICE: {index: 5, removed: ["g", "h"], added: ["0", "1", "2"]}
				// ["a", "b", "A", "B", "f", "0", "1", "2", "i", "j"]
				// SPLICE: {index: 1, removed: ["b", "A", "B", "f", "0", "1", "2", "i"], added: ["x", "y", "z"]}
				// ["a", "x", "y", "z", "j"]
				// MERGED: {index: 1, removed: ["b", "c", "d", "e", "f", "g", "h", "i"], added: ["x", "y", "z"]}
				var dfd = this.async(1000),
					observableArray = ObservableArray.apply(undefined, baseData);
				handles.push(ObservableArray.observe(observableArray, dfd.callback(function (splices) {
					expect(splices).to.deep.equal([
						{
							type: "splice",
							object: observableArray,
							index: 1,
							removed: ["b", "c", "d", "e", "f", "g", "h", "i"],
							addedCount: 3
						}
					]);
				})));
				observableArray.splice(2, 3, "A", "B");
				observableArray.splice(5, 2, "0", "1", "2");
				observableArray.splice(1, 8, "x", "y", "z");
			});
		});
	}
});
