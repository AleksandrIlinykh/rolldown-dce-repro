// node build.mjs cases/08-correct-victim-variable-renamed dce-only
// var q = get(81937);

//#region cases/08-correct-victim-variable-renamed/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/08-correct-victim-variable-renamed/victim.js
function factory(get) {
	const read = function(a = q.IS_BLOCK) {
		return a;
	};
	var q = get(81937);
	return read;
}
//#endregion
//#region cases/08-correct-victim-variable-renamed/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
