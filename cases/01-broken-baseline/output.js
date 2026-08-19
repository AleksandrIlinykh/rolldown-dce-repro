// node build.mjs cases/01-broken-baseline dce-only
// get(81937);

//#region cases/01-broken-baseline/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/01-broken-baseline/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	get(81937);
	return read;
}
//#endregion
//#region cases/01-broken-baseline/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
