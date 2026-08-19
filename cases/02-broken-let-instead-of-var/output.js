// node build.mjs cases/02-broken-let-instead-of-var dce-only
// get(81937);

//#region cases/02-broken-let-instead-of-var/trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region cases/02-broken-let-instead-of-var/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	get(81937);
	return read;
}
//#endregion
//#region cases/02-broken-let-instead-of-var/entry.js
globalThis.__keep = [
	n,
	bump,
	factory
];
//#endregion
