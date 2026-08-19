// node build.mjs cases/05-broken-notistack-and-jodit dce-only
// i(81937);

{
					return o;
				} });
				var n = i(23211);
				function o(e, t, i) {
					return !!n.Dom.canSplitBlock(i) || (n.Dom.before(e, t.createInside.element("br")), !1);
				}
			},
			83376: function(e, t, i) {
				"use strict";
				i.d(t, { getBlockWrapper: function() {
					return function e(t, i, r = n.IS_BLOCK) {
						let s = t, a = i.editor;
						do {
							if (!s || s === a) break;
							if (r.test(s.nodeName)) {
								if (o.Dom.isLeaf(s)) return s;
								return e(s.parentNode, i, /^li$/i) || s;
							}
							s = s.parentNode;
						} while (s && s !== a);
						return null;
					};
				} });
				i(81937);
				var o = i(23211);
			},
			66862: function(e, t
