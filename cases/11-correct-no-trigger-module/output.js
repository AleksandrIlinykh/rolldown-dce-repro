// node build.mjs cases/11-correct-no-trigger-module dce-only
// var n = get(81937);

//#region cases/11-correct-no-trigger-module/victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {
		return a;
	};
	var n = get(81937);
	return read;
}
//#endregion
//#region cases/11-correct-no-trigger-module/entry.js
globalThis.__keep = [factory];
//#endregion
