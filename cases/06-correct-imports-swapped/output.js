// node build.mjs cases/06-correct-imports-swapped dce-only
// var n = get(81937);

//#region cases/06-correct-imports-swapped/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	var n = get(81937);
	return read;
}
//#endregion
//#region cases/06-correct-imports-swapped/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/06-correct-imports-swapped/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
