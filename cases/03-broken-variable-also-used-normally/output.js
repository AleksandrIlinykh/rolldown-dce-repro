// node build.mjs cases/03-broken-variable-also-used-normally dce-only
// return [read, get(81937)];

//#region cases/03-broken-variable-also-used-normally/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/03-broken-variable-also-used-normally/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	return [read, get(81937)];
}
//#endregion
//#region cases/03-broken-variable-also-used-normally/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
