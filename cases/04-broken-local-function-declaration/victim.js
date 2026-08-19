// The local binding is a function declaration this time, not a variable, and it is
// called from a default parameter value. The shape comes from rolldown issue 9204.
export function make() {
  function bind(el = getActivator()) { return el }
  function getActivator() { return 'the local one' }
  return bind
}
