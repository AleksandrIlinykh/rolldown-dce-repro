// node build.mjs cases/07-correct-trigger-variable-renamed dce-only
// var n = get(81937);

//#region cases/07-correct-trigger-variable-renamed/trigger.js
let zz = 1;
function bump() {
	zz += 1;
}
//#endregion
//#region cases/07-correct-trigger-variable-renamed/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	var n = get(81937);
	return read;
}
//#endregion
//#region cases/07-correct-trigger-variable-renamed/entry.js
globalThis.__keep = [
	zz,
	bump,
	factory
];
//#endregion
