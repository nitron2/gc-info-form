// Bootstrap's dropdown closes when middle clicked. To disable this behaviour, the registered handler
// is extracted and replaced with a handler which ignores middle clicks as well as ctrl+click and meta+click.

function bootstrap_dropdown_patch() {
	var events = jQuery._data(document, 'events').click;
	for(var i in events) {
		var event = events[i];
		// The most fragile portion of the code: If bootstrap dropdown changes its namespace this will break.
		// Also note that there are two registered click handlers in the same namespace. The only way to
		// differentiate between them is to check if a selector was specified.
		if(event.namespace === 'bs.data-api.dropdown' && event.selector === undefined) {
			// If there were any other way to grab this function, we could simply use $().off on the event handler
			// and cleanly replace it. However bootstrap wraps its functions up such that they can't be obtained any
			// other way.
			var clearMenus = event.handler;
			
			event.handler = function (e, x) {
				if(e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey)) ) {
					return;
				}
				clearMenus.apply(this, arguments);
			};

			return;
		}
	}

	// If the above function fails to return, then the conditional used to select the right event handler is broken.
	console.error('Bootstrap dropdown patch was unable to select the dropdown clearMenus handler.');
};
