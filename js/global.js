// Current edit differences between preview and prod are re-arranging global.js before seperating older forms / validation to a separate file
var login_check_interval;
var logout_refresh_interval;

if(!window.console)
	window.console = {};
if(!window.console.log)
	window.console.log = function(){ };

(function animatewhenvisible() {
	const known = new WeakSet();
	const intersectionObserver = new IntersectionObserver((entries) => {
		for(const entry of entries) {
			if(entry.intersectionRatio < 0.1) {
				entry.target.classList.remove("intersecting");
			}
			else {
				entry.target.classList.add("intersecting");
			}

			if(!known.has(entry.target)) {
				entry.target.classList.add("initial");
				known.add(entry.target);
			}
			else {
				entry.target.classList.remove("initial");
			}
		}
	}, {
		threshold: [0, 0.1, 0.2]
	});

	(new MutationObserver((mutationList) => {
		for(const mut of mutationList) {
			if(mut.type === "childList") {
				for(const child of mut.addedNodes) {
					if(!(child instanceof Element)) continue;
					if(child.classList.contains("intersect-notify")) {
						intersectionObserver.observe(child);
					}
				}
				for(const child of mut.removedNodes) {
					if(!(child instanceof Element)) continue;
					intersectionObserver.unobserve(child);
					known.delete(child);
				}
			}
			else if(mut.type === "attributes" && mut.attributeName === "class") {
				if(!(mut.target instanceof Element)) continue;

				if(mut.target.classList.contains("intersect-notify")) {
					intersectionObserver.observe(mut.target);
				}
				else {
					intersectionObserver.unobserve(mut.target);
					known.delete(mut.target);
				}
			}
		}
	})).observe(document, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ["class"]
	});

})();

if(jQuery ){
	// Capture all errors and send them to a bogus endpoint... errors are at least shown in the access logs then
	window.onerrorx = function(m,u,l){
		jQuery.get("/bogus/errors",
			{
			msg: m,
			url: u,
			line: l,
			window: window.location.href
			});
		console.log('Javascript error: ' + m + '   at line: ' + l);
		};
	//Area to customize jquery
	jQuery.extend( jQuery.expr[ ":" ], {
		parents: function(a,i,m){ return jQuery(a).parents(m[3]).length; },
		reallyvisible: function(a){ return !jQuery(a).parents().add(a).filter(function(){return jQuery(this).is(':hidden') || jQuery(this).css('visibility') == 'hidden';}).length }
		//Add :selectors here
		});
	jQuery(function(){
		jQuery(window).bind('hashchange', function(e){
			console.log(e.type, location.hash );
			if(location.hash.length < 2) return;
			var look = jQuery('body').find("#" + CSS.escape(location.hash.slice(1)));
			if(look.length == 0) return;
			if(look.is('.modal')){
				jQuery('.modal.in').modal('hide');
				var linkType = look.data('linkScroll');
				var a = jQuery();
				var links = jQuery('[data-toggle=modal][href="#' + CSS.escape(look.attr('id')) + '"]');
				if(linkType == 'inline'){
					a = look.prevAll(':visible:first');
					}
				else if(linkType == 'first'){
					a = links.first();
					}
				else if(linkType == 'last'){
					a = links.last();
					}
				else if(linkType){
					a = jQuery('#' + linkType);
					}

				if( a.length ){
					setTimeout(function(){
						jQuery(window).scrollTop(a.offset().top - 35 - $('.navbar-fixed:visible').outerHeight() * 1);
						setTimeout(function(){
							jQuery(window).scrollTop(a.offset().top - 35 - $('.navbar-fixed:visible').outerHeight() * 1);
							}, 2000);
						}, 1000);
					}
				look.modal('show');
				return true;
				}
			if(look.is('.collapse')){
				if( !jQuery.fn.collapse ) return;
				look.collapse('show');
				var a = jQuery('[data-toggle=collapse][href="#' + CSS.escape(look.attr('id')) + '"]');
				if ( a.length > 0 )
					{
					jQuery(window).scrollTop( a.offset().top - 35 );
					}
				}
			}).triggerHandler('hashchange');
		});

	}

function URLencode(sStr) {
    return escape(sStr).
             replace(/\+/g, '%2B').
                replace(/\"/g,'%22').
                   replace(/\'/g, '%27').
                     replace(/\//g,'%2F').
			replace(/\&/g,'%26');
  }


/* DoubleClick Block */
/* Usage:
DoubleClick Protection
Html Element: <input type="submit" />
* Class doubleclick (Required): <input type="submit" class="doubleclick" />
    Prevents multiple submits less than 5 seconds apart
* HTML property disableme (Optional): <input type="submit" class="doubleclick" disableme />
    disables the submit button during the 5 seconds so its input value isn't sent in the form post
*/
var submit=1; var timerid=0;
var reset = function(btn) {
        submit=1;
        clearTimeout(timerid);
        timerid  = 0;
	if(btn && typeof(btn.prop) !== "undefined"){
		btn.prop('disabled',false);
		}
        };
var doubleclick = function(e) {
	var self = jQuery(this);
	console.log('doubleclick protection started');
	if(submit==1){
		console.log('doubleclick submit = 1');
		submit=0;
		timerid=setTimeout("reset(self)",5000);

		/* Used if you used the optional disableme feature */
		if(self.prop('disableme')){
			self.prop('disabled',true);
			setTimeout(function(){self.prop('disabled', false); console.log('doubleclick protection ended');},5000);
			}
		return 1;
		}
	e.preventDefault();
	return 0;
	};
jQuery(function() {
        submit=1;
        jQuery('body').on('click','.doubleclick',doubleclick);

        } );

var last_login_cookie;
var pinger_uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

(function($){ // Remap jQuery into $ for this code section
	 window.ping = function(simple) {
		simple = (typeof simple == 'undefined') ? 0 : simple;
	        $.ajax({
	                type: 'GET',
	                url: 'https://www.andrews.edu/PING',
			xhrFields: {
			   withCredentials: true
			   },
			data: {
				uuid: pinger_uuid
				},
	                cache: false,
	                success: function(data,status){
	                        setTimeout("ping('" + simple + "');", 30000);
	                        if ( data.match('OK') ){
					show_logged_in();
	                                }
				else if( data == '' ){

					}
	                        else{
	                                if ( ! $('iframe#loggedout').length )
	                                        {
						show_logged_out();
	                                        }
	                                }
	                        },
	                error: function(){
				console.log('ping http error 10sec');
	                        setTimeout("ping('" + simple + "');", 10000);
	                        }
	                });
	        }
	window.show_logged_in = function(){
	        clearInterval(login_check_interval);

		//If there is a login iframe there
		if( $('iframe#loggedout').length )
			{
			$('body').trigger('login');
			$('iframe#loggedout').remove();
			$('.loggedout').remove();
			}
		}

	window.show_logged_out = function(){
		$('<div class="loggedout" id="loggedout_iframe_container" style="background-color:#000; top:0px; left:0px; width:100%; height:100%; padding: 1px; position:fixed; z-index:20;"></div>').fadeTo('fast',0.70).appendTo('body');
		$('<iframe style="border:5px solid #cccccc; position:absolute; top:15%; left:30%; background-color:#fff; z-index:1000; overflow:hidden; box-shadow:0px 0px 30px #333;" width="620" height="580" src="https://auth.andrews.edu/cas/login?service=https://www.andrews.edu/login/success" id="loggedout"></iframe>').appendTo('body');
	        // Start checking for authentication cookie changes
	        $('body').append("<script src='/code/js/cookies.js'></script>");

	        last_login_cookie = $.cookie('CHOCOLATE_CHIP');
		if ( login_check_interval )
			{
			clearInterval(login_check_interval);
			}
		// Check once a second to see if the login cookie has changed (most likely we logged in successfully)
	        login_check_interval = setInterval('check_login_cookie()', 1000);
		// When the CAS session times out the login page sitting there in the popup will fail... it tries to make a call
		// but WSO2 sends it through a retry.do that forbids embeddment in an iFrame. To prevent this we, if the loggedout
		// iframe exists, replace the iframe every 5 minutes thus refreshing the CAS login session
		if ( ! logout_refresh_interval )
			{
			logout_refresh_interval = setInterval(function () { if ( $('#loggedout_iframe_container').remove().size() ) { show_logged_out(); } }, 300000);
			}
		}

	window.zeroFill = function( number, width )
	{
		width -= number.toString().length;
		if ( width > 0 ) return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
		return number;
	}
	window.check_login_cookie = function()
	        {
		console.log('check_login_cookie start');
	        // If the cookie changes
	        if ( $.cookie('CHOCOLATE_CHIP') != '' && $.cookie('CHOCOLATE_CHIP') != last_login_cookie )
	                {
			// Display page since we are logged in again
			console.log('cookie changed, show login && trigger login event');
			show_logged_in();
			$('body').trigger('login');
	                }
		console.log('check_login_cookie end');
	        }



	function crop(segments, ...substitutions) {
		// Whitespace including newline
		const ws = /\n\s*$/s.exec(segments[segments.length - 1])?.[0];
		if(!ws) throw new Error("missing trailing newline with space to crop");

		let result = segments[0].replaceAll(ws, '\n');
		for(let i = 1; i < segments.length; i++) {
			result += substitutions[i];
			result += segments[i].replaceAll(ws, '\n');
		}

		return result;
	}


	window.load_quick_links = async function () {
		if(top !== self) return; // We are in an iframe... this might get recursive and go horribly wrong :( so we bail


		$('body').one('login', function () {
			if($('#quick-links .modal.in').length > 0) {
				$('#quick-links .modal.in').removeClass('fade').modal('hide');
			}
			load_quick_links();
		});

		const data = await new Promise((resolve, reject) => $.ajax({
			url: "/tools/usage/jsonp",
			jsonp: "usage_callback",
			dataType: "jsonp",
			contentType: "application/json",
			success: resolve,
			error: reject
		}));

		const ghl = 

		// Place it in the standard quick links area
		$('#global-helpful-links').html(data.html_data);
		// Place it in the mobile versions hidden navigation
		$('.navigation-mobile .quick-links').html(data.html_data);

		$('.navigation-mobile .embed-responsive-4by3').parent().prepend(crop`
			<div class="quick-links-login-modal modal fade" id="modal-mobile-bookmarks" tabindex="-1" role="dialog">
				<div class="modal-dialog modal-sm">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
							<h4 class="modal-title">Login to access your Andrews Tools</h4>
						</div>
						<div class="modal-body">
							<div class="put-content-here"></div>
						</div>
					</div>
				</div>
			</div>
		`);
		$('.navigation-mobile .embed-responsive-4by3').prependTo('.put-content-here');
		// If we are not logged in then show the login button on mobile view
		if ($('ul.my-andrews-tools') && $('ul.my-andrews-tools').length) {
			console.log('assuming they are logged in');
		}
		else {
			console.log('doesn\'t appear to be logged in...');
			$('.navigation-mobile .quick-links-search').parent().before('<button type="button" class="btn-inset btn-gray login-button" data-toggle="modal" data-target="#modal-mobile-bookmarks">Login to access your Andrews Tools</button>');
		}
		$('#modal-mobile-bookmarks').modal({ show: false });
		$('#modal-mobile-bookmarks').on('shown.bs.modal', function (e) {
			console.log('Modal was shown... calling ping');
			ping();
			if(login_check_interval) {
				clearInterval(login_check_interval);
			}
			login_check_interval = setInterval('check_login_cookie()', 1000);
		});




					$.ajaxSetup({xhrFields: { withCredentials: true } });
			$('.quick-links-container').on('click','a.countme',function (e) {
	                                var ts = (new Date).getTime();
	                                $(this).attr('href','/tools/usage/increment?_ts=' + ts + '&url=' + encodeURI($(this).attr('href')));
	                                });

			$('.quick-links-container').on('click','.add-quick-link', function () {
								$.ajax({
									url: '/tools/usage/add_bookmark',
									data: { url_id: $(this).data('url-id') },
									dataType: 'html',
									success: function (data) { $('.quick-links-container').html(data); }
									});

								});
			$('.quick-links-container').on('click','.remove-quick-link', function () {
								$.ajax({
									url: '/tools/usage/remove_bookmark',
									data: { url_id: $(this).data('url-id') },
									dataType: 'html',
									success: function (data) { $('.quick-links-container').html(data); }
									});

								});
	}

/*
	window.load_quick_links = function()
		{
		if ( top !== self )
			{
			// We are in an iframe... this might get recursive and go horribly wrong :( so we bail
			return;
			}

		console.log('loading quick links');

		$.ajax({
				url: "/tools/usage/jsonp",
				jsonp: "usage_callback",
				dataType: "jsonp",
				contentType: "application/json",
				success: function (data) {
						// Place it in the standard quick links area
						$('#global-helpful-links').html(data.html_data);
						// Place it in the mobile versions hidden navigation
						$('.navigation-mobile .quick-links').html(data.html_data);

						$('.navigation-mobile .embed-responsive-4by3').parent().prepend('\
				<div class="quick-links-login-modal modal fade" id="modal-mobile-bookmarks" tabindex="-1" role="dialog">\
					<div class="modal-dialog modal-sm">\
						<div class="modal-content">\
							<div class="modal-header">\
								<button type="button" class="close" data-dismiss="modal" aria-label="Close">\
									<span aria-hidden="true">&times;</span>\
								</button>\
								<h4 class="modal-title">Login to access your Andrews Tools</h4>\
							</div>\
							<div class="modal-body">\
								<div class="put-content-here"></div>\
							</div>\
						</div>\
					</div>');
					$('.navigation-mobile .embed-responsive-4by3').prependTo('.put-content-here');
						// If we are not logged in then show the login button on mobile view
						if ( $('ul.my-andrews-tools') && $('ul.my-andrews-tools').length )
							{
							console.log('assuming they are logged in');
							}
						else
							{
							console.log('doesn\'t appear to be logged in...');
							$('.navigation-mobile .quick-links-search').parent().before('<button type="button" class="btn-inset btn-gray login-button" data-toggle="modal" data-target="#modal-mobile-bookmarks">Login to access your Andrews Tools</button>');
							}
						$('#modal-mobile-bookmarks').modal({ show: false });
						$('#modal-mobile-bookmarks').on('shown.bs.modal', function (e) {
							console.log('Modal was shown... calling ping');
							ping();
							if( login_check_interval ) clearInterval(login_check_interval);
							login_check_interval = setInterval('check_login_cookie()', 1000);
							});

				},
				    error: function(e) {
	      				console.log(e);
					}
				});

		$('body').on('login',function () {
			if( $('#quick-links .modal.in').length > 0 ) {
				$('#quick-links .modal.in').removeClass('fade').modal('hide');
				}
			load_quick_links();
			} );
		}
*/

	$(function () {
		// Fill in blank weather information for people that can't run TT plugins
		if ( $('footer li.weather').length && $('footer li.weather').html().match(/^\s*$/) )
			{
			$.ajax({
	 			  type: 'GET',
	 			   url: '/code/templates/weather.html',
				 // disabled... holding page loads up   async: false,
	 			   jsonpCallback: 'jsonCallback',
	 			   contentType: 'application/json',
				    dataType: 'jsonp',
				    success: function(json) {
				      $('footer li.weather').html(json.weather_info);
	 			   }
				});
			}

		if ( $('#global-helpful-links,.quick-links-container').length )
			{
				/*
			$.ajaxSetup({xhrFields: { withCredentials: true } });
			$('.quick-links-container').on('click','a.countme',function (e) {
	                                var ts = (new Date).getTime();
	                                $(this).attr('href','/tools/usage/increment?_ts=' + ts + '&url=' + encodeURI($(this).attr('href')));
	                                });

			$('.quick-links-container').on('click','.add-quick-link', function () {
								$.ajax({
									url: '/tools/usage/add_bookmark',
									data: { url_id: $(this).data('url-id') },
									dataType: 'html',
									success: function (data) { $('.quick-links-container').html(data); }
									});

								});
			$('.quick-links-container').on('click','.remove-quick-link', function () {
								$.ajax({
									url: '/tools/usage/remove_bookmark',
									data: { url_id: $(this).data('url-id') },
									dataType: 'html',
									success: function (data) { $('.quick-links-container').html(data); }
									});

								});
*/
			load_quick_links();
/*
			$('#quick_links_dropdown').on('shown.bs.dropdown', function () {
				setTimeout(function() {$("#quick-links-search").focus()}, 5);
				});

			$('#global-helpful-links').on('click',function (event) { event.stopPropagation() } );

			// reenable when quicklinks goes live for real
			$('body').on('shown.bs.dropdown','#quick_links_dropdown', function () { if ( $('#loggedout').length ) { ping(); if( login_check_interval ) clearInterval(login_check_interval); login_check_interval = setInterval('check_login_cookie()', 1000); } } );

			$('body').on('keyup','.quick-links-search',function () {
//						console.log('running keyup hook');
						if ( $(this).val().length )
							{
//							console.log('has length');
							$('.quick-links-search-mode').css({cursor: 'pointer'}).addClass('fa-times-circle').removeClass('fa-search').on('click',function () { $('.quick-links-search').val('').trigger('keyup') });
							}
						else
							{
//							console.log('no length');
							$('.quick-links-search-mode').css({cursor: 'auto'}).removeClass('fa-times-circle').addClass('fa-search').off('click');
							}

						if ( $(this).val().length >= 2 )
							{
//							console.log('long enough to call network');
							$('.quick-links-search-results').load('https://www.andrews.edu/tools/usage/search?search=' + escape($(this).val()) );
							}
						else
							{
//							console.log('not long enough to call network');
							$('.quick-links-search-results').html('');
							}
						} );
*/
			}

		/*
		 * Allow us to place bootstrap carousel controls in any tab interface...with a container having
		 * class="tabs-carousel"
		 *
		 */
		$('body').on('click','.tabs-carousel .carousel-control', function(){
			var self = $(this);
			var cont = self.closest('.tabs-carousel');
			var active = cont.find('ul.nav-tabs li.active');
			if(self.hasClass('left')){
				var next = active.prev();
				if(next.length == 0){
					next = active.nextAll('li:last');
					}
				 next.children('a').trigger('click');
				};
			if(self.hasClass('right')){
				var next = active.next();
				if(next.length == 0){
					next = active.prevAll('li:last');
					}
				 next.children('a').trigger('click');
				};
			return false;
			});

	});
 })(jQuery); // End remapping jQuery into $

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


$('body').on('pinger.event',function (e,msg) {
                                if ( msg.routing_key.match('.event.login')  )
                                        {
					show_logged_in();
                                        }
                                });

/* Validator stuff */

/* Form Error Messages & Validation Calls */
$('.auform').on('focusout',function(e){
	if(!$(e.target).attr('id')) return;
	var id = $(e.target).attr('id').replace(/\//g,'\\\/');
	var cont = $('.' + id + '_container');
	cont.removeClass('sffocus');
	setTimeout(function(){
		if(!cont.hasClass('sffocus'))
			validate(e.target);
		},0);
	});
$('.auform').on('focusin', function(e){
	if(!$(e.target).attr('id'))
		return;
	var id = $(e.target).attr('id').replace(/\//g,'\\\/');
	$('.' + id + '_container').addClass('sffocus');
	});


var pageloaded=0;
var qstring="";
/* Validator */
function validate(i)
	{
	if( !(i instanceof jQuery) ){
		if(typeof(i) == 'string'){
			i=$('#'+i);
			}
		if(i.nodeName){
			i = $(i);
			}
		else{
			return;
			}
		}
	if(typeof(i.attr('name'))!='string' || typeof(i.attr('id')) != 'string'){
		//Object is not real element
		return;
		}
	//Create namespaces so we don't change the elements
	var name=i.attr('name');
	var value=i.val();
	if(i.attr('type')=='radio'){
		var selected = i.parent().parent().find('input:radio[name=' + name + ']');
		if( selected.is(':checked') ){
			value=selected.val();
			}
		else{
			value='';
			}
		}
	$('.validation').filter('[value*="conditional=' + name + '"]').each(function(){
		var nname=$(this).attr('name').match('^v:(.*)$')[1];
		$('#' + nname).blur();
		});
	var parent_name = name.split("/");
	if(parent_name === undefined){
		parent_name = [name];
		}
	parent_name = parent_name[0];
	var validator = 'v:' + parent_name;
	if( typeof(defaultpageloaded) == "undefined" || (!pageloaded && parent_name==get_pagelast() || ( typeof(defaultpageloaded) != "undefined" && defaultpageloaded==1))){
		pageloaded=1;
		}
	else{
		pageloaded=defaultpageloaded;
		}
	var names=[];
	var hiddenfield = i.parents('.' + parent_name + '_container').find('.validation#v\\:' + parent_name);
	if(hiddenfield.length == 0)
		return;
	var pars=validator + '=' + hiddenfield.val();
	names.push(name);
	if(i.hasClass('multifield')){
		var vals="";
		var new_parent=parent_name.replace('_international','');
		$('.' + parent_name + '_container [name][name^="'+new_parent+'"]:visible').each(function(){
			if(i.attr('type')=='checkbox'){
				if($(this).is(':checked')){
					vals+="1";
					}
				}
			else if(i.attr('type')=='radio'){
				if($('[name='+name+']').is(':checked')){
					vals=$('[name='+name+']:checked').val();
					pars += '&' + $(this).attr('name') + '=' + vals;
					}
				}
			else{
				pars += '&' + $(this).attr('name') + '=' + $(this).val();
				}
			});
		if(i.attr('type')=='checkbox'){
			pars += '&' + i.attr('name') + '=' + vals;
			}
		}
	else{
		$(names).each(function(){
			var name=this;
			var vals="";
			$(i).parents('.' + name + '_container').find('[name=' + name + ']').each(function(){
				if(i.attr('type')=='checkbox'){
					if($(this).is(':checked')){
						vals+="1";
						}
					}
				else if(i.attr('type')=='radio'){
					if($(this).is(':checked')){
						pars += '&' + $(this).attr('name') + '=' + $('[name='+name+']:checked').val();
						}
					}
				else{
					pars += '&' + $(this).attr('name') + '=' + $(this).val();
					}
				});
			if($('[name=' + name + ']:checkbox').size()){
				pars += '&' + name + '=' + vals;
				}
			});
		}
	if(validator.match( /Phone/ ) && !validator.match( /Type|Temporary/ )){
		var new_parent=parent_name.replace('_international','');
		pars += '&' + 'v:' + new_parent +'_Type' + '=' + $('#v\\:'+ new_parent + '_Type').val();
		}

	var valval=hiddenfield.val()
	if(typeof(valval) != "undefined" && valval.match('conditional')){
		var args=valval.match('conditional=([^,]+)')[1];
		var field=$('#' + args);
		pars += '&' + args + '=';
		if(!field.is(':checkbox') || field.is(':checked')){
			pars += field.val();
			}
		}
	if(valval != ''){
		if(pageloaded || qstring.length > 4000){
			if(qstring != ""){
				pars +=qstring;
				qstring="";
				}
			$.get( '/VALIDATE?' + pars,function(data){show_errors(data,i);});
			}
		else{
			qstring +='&' + pars;
			}
		}
	}
function show_errors(request,field)
	{
	$.each(request.split("\n"),
		function (i,response)
			{
			// alert('Index:' + i + ' response: ' + response);
			var items = response.split(':');
			if ( items[0] == '' )
				{
				return true;
				}
			if ( items[1] == 'OK' )
				{
				var i=$('#'+items[0]);
				var val=i.val();
				var ok=0;
				if(items[0].match( "Country" )){
					if(val!='0')
						ok=1;
					}
				else if(i.attr('type')=='radio'){
					if(i.is(':checked') && val != 'No')
						ok=1;
					}
				else if(i.attr('type')=='checkbox'){
					if(i.is(':checked')){
						ok=1;
						}
					}
				else {
					if(val!=''){
						ok=1;
						}
					}
				if(ok){
					$('.' + items[0]+"_container [name][name^='"+items[0]+"']").addClass('ok').removeClass('error');
					}
				else{
					$('.' + items[0]+"_container [name][name^='"+items[0]+"']").removeClass('ok').filter(':not(.servererror)').removeClass('error');
					}
				}
			else{
				var container='.' + items[0] + '_container';
				$(container + ' [name][name^="'+items[0]+'"], ' + container + ' [name][name^="'+items[0]+'\/"]').addClass('error').removeClass('ok');
				}
			set_container(items[0] + '_container',field);
			return true;
			}
		);
	/*
	var block = $(field).parents('.repeatable:first');
	if(block.length){
		if(blocks.contents().is('.ok')){
			$('#'+repeat+'_empty_error').removeClass('error');
			}
		}
	*/
	}
function get_pagelast(){
	return $('input, select, textarea').not('input:submit').filter('[id]:last').attr('id');
	/*
	 * jQuery not keeps DOM order so this junk is no longer needed
	var elem = $(null);
	if(document.forms.length > 0)
	elem = $(document.forms[document.forms.length-1].elements).filter(':not(:hidden, :submit, :image)').filter(':reallyvisible:last');
	return (elem.size()) ? elem.attr('id').match('^([^/]*)')[1] : '';
	 *
	 */
	}
function get_blocklast(field){
	if(	typeof(field) != "undefined" &&
		typeof(field.get) != "undefined" &&
		 $(field).length > 0
		 ){
		/*
		 *
		 * jQuery now keeps DOM order
		var id = $(field).parents('.repeatable:first').find('*').filter(function(){
			return $(this).filter('input, select, textarea').is(':not(:hidden, :submit, :image)');
			})
			.filter(':last').attr('id');
		*/
		var id = $(field)
				.parents('.repeatable:first')
				.find('input, select, textarea')
				.not(':hidden, :submit, :image')
				.filter('[id]:last')
				.attr('id');
		if(typeof(id) != 'undefined')
			return id.match('^([^/]*)')[1];
		}
	return '';
	}
function set_container(container,field){
	var pagelast=get_pagelast();
	var blocklast=get_blocklast(field);
	var block = $(field).parents('.repeatable:first');
	if(block.length > 0){
		if(container.match( pagelast ) || container.match( blocklast ) || pageloaded ){
			set_blocks(block);
			}
		return true;
		}
//	var child=$(container).children();
	container=$('.'+container.replace(/\//g,'\\\/'));
	if(typeof($(container).attr('class'))=="undefined") return true;
	if($('.error', container).size()){
		$(container).addClass('error').removeClass('ok');
		}
	else{
		$(container).removeClass('error');
		if($('.ok', container).size()){
			$(container).addClass('ok');
			}
		else{
			$(container).removeClass('ok');
			}
		}
	return true;
	}
function set_blocks(block){
	var list = block.find('input:not(.validation), select, textarea').filter(':reallyvisible');
	var badlist=list.filter('.error');
	var goodlist=list.filter(':not(.error)');
	var goodcontlist=[];
	var goodcontcheck=[];
	$(goodlist).each(function(){
		var cont = $(this).parent().attr('class');
		cont = cont.replace(' ok','').replace(' error','').replace(' servererror','').replace(' multifield','').replace('generic_element','').replace('date','').replace(/ +/g,'.').replace(/ +$/,'').replace(/^ +/,'').replace(/\.$/,'').replace(/^ *\./,'');
		if(goodcontcheck[cont]!=1){
			goodcontcheck[cont]=1;
			goodcontlist.push(cont);
			}
		return true;
		});
	var str = "badlist:\n";
	badlist.each(function(i,f){
		str += f.name + ' = ' + f.value + "\n";
		return true;
		});
	str += "goodcontlist\n" + goodcontlist.join("\n");

	$.each(goodcontlist,function(i,v){ //Add oks to the containers that have oks in them ...
		set_container(v);
		return true;
		});
	if(goodlist.size()){
		$(badlist).each(function(){ //Add errors to a block because there is one good element in it...
			$('.'+$(this).attr('name')+'_container').addClass('error').removeClass('ok');
			return true;
			});
		}
	else{ // Remove errors to the block because there are no finished blocks in it...
		$(badlist).each(function(){
			$('.'+$(this).attr('name')+'_container.error').removeClass('error');
			return true
			});
		}
	return true;
	}

function ajaxify() {
	var form = document.currentScript.parentNode;
	if(!(form instanceof HTMLFormElement)) {
		throw new Error("Unable to ajaxify form, script's parent is not a form element");
	}
	if(!form.id) form.id = Math.random().toString(36).replace('0.', 'x');

	var message_display = form.querySelectorAll(".ajaxify-message");
	if(message_display.length === 0) {
		var div = document.createElement("div");
		div.className = "ajaxify-message ajaxify-message-default";
		form.appendChild(div);
		message_display = [div];
	}

	form.addEventListener("submit", handle_submit, false);
	form.addEventListener("click", handle_click, false);

	var click_target = null;
	var click_target_timeout = null;

	var listeners = {
		//lock: undefined,
		//unlock: undefined,
		//submit: undefined,

		//pending: undefined,
		//resolved: undefined,
		//rejected: undefined,

		doUnlock: function () { return unlock_form(form) },
		doLock: function () { return lock_form(form) },
		doReset: function () {
			unlock_form(form);
			ajopen(".ajaxify-initial", true);
			ajopen(".ajaxify-resolved", false);
			ajopen(".ajaxify-rejected", false);
			ajopen(".ajaxify-pending", false);
		}
	};
	return Promise.resolve(listeners);

	function handle_click(e) {
		click_target = closestSubmitter(e.target);

		// Automatically clean up click_target approximately next-tick,
		// allowing enqueued events to be processed.
		clearTimeout(click_target_timeout);
		if(click_target === null) return;
		click_target_timeout = setTimeout(function () { click_target = null }, 0);
	}

	function handle_submit(e) {
		e.preventDefault();
		e.stopPropagation();

		var submitter = null;
		if("explicitOriginalTarget" in e && (e.explicitOriginalTarget instanceof HTMLButtonElement || e.explicitOriginalTarget instanceof HTMLInputElement)) {
			// Only supported by old versions firefox, but it's always the submitter.
			submitter = e.explicitOriginalTarget;
		}
		else if(document.activeElement && (document.activeElement.form === form || closestForm(document.activeElement) === form)) {
			// Relies on platform specific behavior, but if the activeElement is
			// within the form (or attached to it), the activeElement was used
			// to submit the form.
			submitter = document.activeElement;
		}
		else if(click_target !== null) {
			// Otherwise we fallback on using the last submit button that was
			// clicked on.
			submitter = click_target;
		}

		// Reset click_target
		click_target = null;

		// If the element isn't a submit of some kind, ignore it.
		// Additionally, if the submitter doesn't belong to the form, ignore it.
		if(!submitter || submitter.type !== "submit" || (submitter.form !== form && closestForm(submitter) !== form)) {
			// Pick the default submit button
			// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission
			for(var i = 0; i < form.elements.length; i++) {
				var element = form.elements[i];
				if(element.type !== "submit" && !element.disabled) continue;
				submitter = element;
				break;
			}
		}

		var data = new FormData(form);

		// We add the submitter to the form data
		// WebKit already includes that data
		// WARNING: this isn't perfect, the submitter is added to the FormData
		// out-of-order. Additionally, if another form field has the same name
		// as the submitter, then the submitter will be ignored. Neither of
		// these issues are worth the time to fix, right now.
		if(submitter && submitter.name && (!("has" in data) || !data.has(submitter.name))) {
			data.append(submitter.name, submitter.value);
		}

		do_submit(data, submitter);
	}

	function do_submit(data, submitter) {
		if(listeners.submit) data = listeners.submit(data, submitter) || data;

		var xhr = new Promise(function (resolve, reject) {
			var xhr = window.yyy= new XMLHttpRequest();
			xhr.open(form.method, form.action);
			xhr.timeout = 30000;
			if(data.get("TESTOPERATION") === "timeout") xhr.timeout = 5000;
			xhr.onerror = function (event) { reject(event) }
			xhr.ontimeout = function (event) { reject(event) }
			xhr.onabort = function (event) { reject(event) }
			xhr.onload = function (event) {
				event.status = xhr.status;
				event.statusText = xhr.statusText;

				if(xhr.status < 400) resolve(event);
				else reject(event)
			}
			xhr.send(data);
		});

		lock_form(form);
		message_display.forEach(function (el) { el.innerHTML = "" });

		ajopen(".ajaxify-initial", false);
		ajopen(".ajaxify-resolved", false);
		ajopen(".ajaxify-rejected", false);
		ajopen(".ajaxify-pending", true);
		if(listeners.pending) listeners.pending(data, submitter);

		xhr.then(function (event) {
			ajopen(".ajaxify-pending", false);
			ajopen(".ajaxify-resolved", true);
			if(listeners.resolved) listeners.resolved(event);
		}, function (event) {
			ajopen(".ajaxify-pending", false);
			ajopen(".ajaxify-rejected", true);

			if(event.type === "load") {
				message_display.forEach(function (el) { el.innerHTML = "Unable to send information, a server error was encountered <em>(" + event.status + " " + event.statusText + ")</em>." });
			}
			else if(event.type === "timeout") {
				message_display.forEach(function (el) { el.innerHTML = "Ran out of time trying to send information, check your internet connection."; });
			}
			else if(event.type === "error") {
				message_display.forEach(function (el) { el.innerHTML = "Unable to send information, check your internet connection."; });
			}
			else if(event.type === "abort") {
				message_display.forEach(function (el) { el.innerHTML = "User aborted, information not sent."; });
			}

			unlock_form(form);
			if(listeners.rejected) listeners.rejected(event);
		});
	}

	function ajopen(sel, state) {
		form.querySelectorAll(sel)
			.forEach(state ? function (el) { el.classList.add("open"); el.classList.remove("shut") }
				: function (el) { el.classList.add("shut"); el.classList.remove("open") });
	}

	function lock_form(form) {
		for(var i = 0; i < form.elements.length; i++) {
			if(form.elements[i].disabled || form.elements[i].dataset.ajaxifyIgnore) continue;
			form.elements[i].setAttribute("disabled", "disabled-by-ajaxify");
		}
		if(listeners.lock) listeners.lock();
	}

	function unlock_form(form) {
		for(var i = 0; i < form.elements.length; i++) {
			if(form.elements[i].getAttribute("disabled") !== "disabled-by-ajaxify") continue;
			form.elements[i].disabled = false;
		}
		if(listeners.unlock) listeners.unlock();
	}

	function closest(el, fn) {
		while(el !== null) {
			if(fn(el)) return el;
			el = el.parentNode;
		}
		while(el !== null);
		return el;
	}

	function closestForm(el) {
		return closest(el, function (el) {
			return el instanceof HTMLFormElement;
		});
	}

	function closestSubmitter(el) {
		return closest(el, function (el) {
			return (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) && el.type === "submit";
		});
	}
}













function isCatalogListResponse(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("CatalogListResponse is not an object"), false);
    if (!("catalog-list" in o) || !(o["catalog-list"] instanceof Array))
        return (console.error("CatalogListResponse missing catalog-list"), false);
    return o["catalog-list"].every(c => isCatalog(c));
}
function isCatalog(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("Catalog is not an object"), false);
    if (!("legacy-id" in o) || typeof o["legacy-id"] !== "number")
        return (console.error("Catalog missing legacy-id"), false);
    if (!("published" in o) || typeof o["published"] !== "boolean")
        return (console.error("Catalog missing published"), false);
    if (!("modified" in o) || typeof o["modified"] !== "string")
        return (console.error("Catalog missing modified"), false);
    if (!("catalog-type" in o) || typeof o["catalog-type"] !== "object" || o["catalog-type"] === null)
        return (console.error("Catalog missing catalog-type"), false);
    if (!("name" in o["catalog-type"]) || typeof o["catalog-type"].name !== "string")
        return (console.error("Catalog missing catalog-type.name"), false);
    return true;
}
function isProgramListResponse(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("ProgramListResponse is not an object"), false);
    if (!("program-list" in o) || !(o["program-list"] instanceof Array))
        return (console.error("ProgramListResponse missing program-list"), false);
    return o["program-list"].every(c => isProgram(c));
}
function isProgram(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("Program is not an object"), false);
    if (!("legacy-id" in o) || typeof o["legacy-id"] !== "number")
        return (console.error("Program missing legacy-id"), false);
    return true;
}
function isHierarchyListResponse(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("HierarchyListResponse is not an object"), false);
    if (!("hierarchy-list" in o) || !(o["hierarchy-list"] instanceof Array))
        return (console.error("HierarchyListResponse missing hierarchy-list"), false);
    return o["hierarchy-list"].every(c => isProgram(c));
}
function isHierarchy(o) {
    if (typeof o !== "object" || o === null)
        return (console.error("Hierarchy is not an object"), false);
    if (!("legacy-id" in o) || typeof o["legacy-id"] !== "number")
        return (console.error("Hierarchy missing legacy-id"), false);
    return true;
}
document.addEventListener("DOMContentLoaded", async () => {
    const anchors = document.querySelectorAll("a.acalog");
    if (anchors.length === 0)
        return console.log("no acalog links found, skipping");
    const json = await fetch("https://bulletin.andrews.edu/widget-api/catalogs/").then(result => result.json());
    if (!isCatalogListResponse(json))
        throw new Error("Not a CatalogListResponse");
    const catalogs = json["catalog-list"];
    function searchCatalogs(catalogType) {
        return catalogs.filter(c => c["catalog-type"].name === catalogType && c.archived !== true).sort((a, b) => a.modified < b.modified ? 1 : a.modified > b.modified ? -1 : 0)[0];
    }
    const currentCatalogs = {};
    const matchingProgramIds = {};
    const matchingHierarchyIds = {};
    anchors.forEach(async (a) => {
        var _a, _b, _c, _d;
        var _e, _f;
        const catalogType = a.dataset.acalogCatalogType;
        if (!catalogType)
            return console.error("skipping", a, "missing acalog-catalog-type");
        const catalogId = (_a = currentCatalogs[catalogType]) !== null && _a !== void 0 ? _a : (currentCatalogs[catalogType] = (_b = searchCatalogs(catalogType)) === null || _b === void 0 ? void 0 : _b["legacy-id"]);
        if (!catalogId)
            return console.error("no catalog found for", catalogType, a);
        switch (a.dataset.acalogData) {
            case "programs": {
                const programName = a.dataset.acalogProgramName;
                if (!programName)
                    return console.error("skipping", a, "missing acalog-program-name");
                const programId = await ((_c = matchingProgramIds[_e = catalogType + programName]) !== null && _c !== void 0 ? _c : (matchingProgramIds[_e] = fetch(`https://bulletin.andrews.edu/widget-api/catalog/${catalogId}/programs/?page-size=10&page=1&name=${encodeURIComponent(programName)}`)
                    .then(result => result.json())
                    .then(json => {
                    var _a;
                    if (!isProgramListResponse(json))
                        throw new Error("Did not receive list of programs for " + catalogType + " query " + programName);
                    const programId = (_a = json["program-list"][0]) === null || _a === void 0 ? void 0 : _a["legacy-id"];
                    if (!programId)
                        throw new Error("unable to find a matching program");
                    return programId;
                })));
                a.href = `https://bulletin.andrews.edu/preview_program.php?catoid=${catalogId}&poid=${programId}`;
                break;
            }
            case "entities": {
                const entityName = a.dataset.acalogEntityName;
                if (!entityName)
                    return console.error("skipping", a, "missing acalog-entity-name");
                const programId = await ((_d = matchingHierarchyIds[_f = catalogType + entityName]) !== null && _d !== void 0 ? _d : (matchingHierarchyIds[_f] = fetch(`https://bulletin.andrews.edu/widget-api/catalog/${catalogId}/hierarchies/?page-size=10&page=1&name=${encodeURIComponent(entityName)}`)
                    .then(result => result.json())
                    .then(json => {
                    var _a;
                    if (!isHierarchyListResponse(json))
                        throw new Error("Did not receive list of hierarchies for " + catalogType + " query " + entityName);
                    const programId = (_a = json["hierarchy-list"][0]) === null || _a === void 0 ? void 0 : _a["legacy-id"];
                    if (!programId)
                        throw new Error("unable to find a matching hierarchy");
                    return programId;
                })));
                a.href = `https://bulletin.andrews.edu/preview_entity.php?catoid=${catalogId}&ent_oid=${programId}`;
                break;
            }
            default: throw new Error("unknown acalog-data-type: " + a.dataset.acalogDataType);
        }
        a.classList.add("acalog-ready");
    });
});











