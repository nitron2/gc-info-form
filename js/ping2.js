// old ping exists... disable it since we do all it's functions
if (typeof window.ping === "function") {
	// window.ping = function () { };

	// if (typeof window.check_login_cookie === "function")
	//	{
	//	window.check_login_cookie = function () {};
	//	} 
}

var pinger_uuid = pinger_uuid || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

// If we don't have a cookie identifying the browser then set it... we use this to communicate login events
if ( ! $.cookie('pinger_browser_id') )
	{
	$.cookie('pinger_browser_id', pinger_uuid, {domain: '.andrews.edu', path:'/'});
	}

var pinger_socket;

// on page ready (page load) call our shim to keep us logged into CAS
$(function () {
	// If we haven't checked before... or it has been more than 5 minutes then call CAS again with a gateway passthrough
	if ( 0 ) // ! $.cookie('pinger_last_call') || (new Date).getTime() - $.cookie('pinger_last_call') > 60000 && ! window.frameElement)
		{
		$('<iframe src="https://cas.andrews.edu/cas/login?gateway=true&service=https%3A%2F%2Fwww.andrews.edu%2Flogin%2Fping" style="display: none" frameborder="0" scrolling="no" id="CASshimFrame"></iframe>').appendTo('body');
 		$.cookie('pinger_last_call', (new Date).getTime(), {domain: '.andrews.edu', path:'/'});
		}
	});

$(function () {
	// Setup default message handler
	$('body').on('pinger.message', function (e,msg) {
       		msg = JSON.parse(msg.body);
       		$.notify(msg[0], msg[1]);
       		});
 });

function _au_reconnect_pinger() {
	try {
	if ( pinger_socket && pinger_socket.readyState != 0 )
		{
		pinger_socket.close();
		pinger_socket = undefined;
		}

	if ( ! pinger_socket )
		{
		var website = location.hostname.replace('cc.andrews.edu','andrews.edu').replace('.andrews.edu','') + location.pathname.replace('index.html','');
		pinger_socket = new WebSocket('wss://www.andrews.edu/ping/channel/' + $.cookie('pinger_browser_id') + '/' + pinger_uuid + '/' + website);
		}

	pinger_socket.onopen = function () {
		$('body').trigger('pinger.open');
		};
  
	pinger_socket.onmessage = function (msg) {
		try
			{
			console.log('onmessage for pinger_socket');
			msg = JSON.parse(msg.data);
			console.log(msg);
			if ( msg.routing_key.match(/\.msg$/) )
				{
				$('body').trigger('pinger.message', [ msg ]);
				}
			else if (  msg.routing_key.match(/\.event\./) )
				{
				console.log('event received: ' + msg.routing_key);
				$('body').trigger('pinger.event', [ msg ]);
				if ( msg.routing_key.match(/\.event\.login$/) )
					{
					// Login detected...  cut our connection and let it reconnect at the next pinger check
					// We don't do this for logouts as those are cut server side
					pinger_socket.close();
					show_logged_in();
					}
				else if ( msg.routing_key.match(/\.event\.logout$/) )
					{
	                                if ( ! $('iframe#loggedout').length )
	                                        {
						$('<div class="loggedout" style="background-color:#000; top:0px; left:0px; width:100%; height:100%; padding: 1px; position:fixed; z-index:20;"></div>').fadeTo('fast',0.70).appendTo('body');
						$('<iframe style="border:5px solid #cccccc; position:absolute; top:15%; left:30%; background-color:#fff; z-index:1000; overflow:hidden; box-shadow:0px 0px 30px #333;" width="620" height="580" src="https://cas.andrews.edu/cas/login?service=https://www.andrews.edu/login/success" id="loggedout"></iframe>').appendTo('body');
						}
					}
				}
			else if ( msg.routing_key.match(/^client\.info$/) )
				{ // Just an informational event so ignore it
				}
			else
				{
				console.log('Unhandled route type: ' + msg.routing_key );
				}
			}
		catch(error)
			{
			console.log('Trouble triggering events for msg: ' + error.message);
			console.log('  ' + msg);
			}
		};

	pinger_socket.onerror = function (error) {
		$('body').trigger('pinger.error', [ error ]);
      		};

	pinger_socket.onclose = function (e) {
		$('body').trigger('pinger.close');
      		};
	  }

	catch(e) { console.log(e); };
	}

function _au_check_pinger()
	{
	if ( ! pinger_socket || pinger_socket.readyState != 1)
		{
		_au_reconnect_pinger();
		}
	} 

// Only create the socket if we are NOT in an iframe
if ( ! window.frameElement )
	{
	setInterval(function () {_au_check_pinger()}, 1000);
	}