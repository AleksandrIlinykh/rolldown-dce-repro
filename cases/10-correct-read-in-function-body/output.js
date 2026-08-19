// node build.mjs cases/10-correct-read-in-function-body dce-only
// var n = get(81937);

//#region cases/10-correct-read-in-function-body/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/10-correct-read-in-function-body/victim.js
function factory(get) {
	const read = function(a) {
		return a || n.IS_BLOCK;
	};
	var n = get(81937);
	return read;
}
//#endregion
//#region cases/10-correct-read-in-function-body/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
