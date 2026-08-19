// node build.mjs cases/09-correct-var-declared-before-reader dce-only
// var n = get(81937);

//#region cases/09-correct-var-declared-before-reader/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/09-correct-var-declared-before-reader/victim.js
function factory(get) {
	var n = get(81937);
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	return read;
}
//#endregion
//#region cases/09-correct-var-declared-before-reader/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
