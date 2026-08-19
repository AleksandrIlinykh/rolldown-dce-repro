// node build.mjs cases/04-broken-local-function-declaration dce-only
// bind() returns "THE OTHER ONE", the same source without a bundler returns "the local one"

//#region cases/04-broken-local-function-declaration/trigger.js
function getActivator() {
	return "THE OTHER ONE";
}
//#endregion
//#region cases/04-broken-local-function-declaration/victim.js
function make() {
	function bind(el = getActivator()) {
		return el;
	}
	return bind;
}
//#endregion
//#region cases/04-broken-local-function-declaration/entry.js
globalThis.__keep = [getActivator, make];
//#endregion
export { make };
