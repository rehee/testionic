//document.ontouchstart = function(e){ e.preventDefault(); }
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("pause", onAppPause, false);
document.addEventListener("resume", onAppResume, false);
var globJson = null;
var eventsJson = null;
var menuHeight = null;
var dockHeight = null;
var t = null;
var bottomMenuScroll = null;
var mainContentScroll = null;
var myappmodScroll = null;
var calInfoScroll = null;
var livemap = null;
var lat = 53.304621;
var lng = -1.274414;
var meLayer = null;
var mymarker = null;
var friendsLayer = null;
var watchID = null;
var currentPage = 'home';
var apiUrl = null;
var buildHomeTimeout = null;
var podcastUpdateTime = null;
var pcListScroll = null;
var deviceReady = 0;
var emailAddress = null;
var pushNotification;
var setUpT = null;
var refreshing = false;
//set Templates
var bigText_source   = tmp_reuse_bigText();
var bigText_template = Handlebars.compile(bigText_source);
var bottomLink_source   = tmp_btmAppLink();
var bottomLink_template = Handlebars.compile(bottomLink_source);
var blockSource   = tmp_reuse_block();
var blockTemplate = Handlebars.compile(blockSource);
var blogSource   = tmp_reuse_infolist();
var blogTemplate = Handlebars.compile(blogSource);
var invBlogSource   = tmp_reuse_infolistindv();
var invBlogTemplate = Handlebars.compile(invBlogSource);
var blockContSource = tmp_reuse_blockCont();
var blockContTemplate = Handlebars.compile(blockContSource);
var votdSource = tmp_reuse_votd();
var votdTemplate = Handlebars.compile(votdSource);
var podcastBackSource = tmp_reuse_podcastTrackList();
var podcastTemplate = Handlebars.compile(podcastBackSource);
var podcastStreamSource = tmp_reuse_podcastStream();
var podcastStreamTemplate = Handlebars.compile(podcastStreamSource);
var podcastEpisodeSource = tmp_reuse_podcastEpisode();
var podcastEpisodeTemplate = Handlebars.compile(podcastEpisodeSource);
var notificationSource = tmp_reuse_notification();
var notificationTemplate = Handlebars.compile(notificationSource);
var socialFeedSource = tmp_reuse_socialentry();
var socialFeedTemplate = Handlebars.compile(socialFeedSource);


var eventAvailableDate = null;
var eventFinalAmount = null;
var eventIPN = null;
var transaction_poll = null;
var transaction_passid = null;
var transaction_invoice = null;
var transaction_type = null;

var lastLocSend = null;

$(function(){
//do all this on jquery load
	//$.jStorage.flush();
	//take the 20px off the html
	//$.jStorage.flush();

	var curHei = parseInt($('html').height())-20;
	$('#viewMeta').attr('content', 'initial-scale=1.0, user-scalable=0, width=device-width, height=' + curHei + ', target-densityDpi=device-dpi');
	$('#main-content').css('width', $(window).width());
	setInitialVars();
	$.ajax({
		url: 'church/church.json',
		dataType: 'json',
		success: function(json){
			globJson = json;
			console.log(json);
			buildMenu();
			
			apiUrl = globJson.init.base_url;
			lat = globJson.church.lat;
			lng = globJson.church.lng;
			pageInit(globJson);
		}
	});
	$('body').hammer().on('tap', '.leaveapplink', function(){
		
		var href = $(this).attr('data-href');
		if(href!='nolink' || href=='#'){
			if(device.platform=='iOS'){
				CDVTweetSheet.openlink(href);
			}else{
				navigator.app.loadUrl(href, { openExternal:true });
			}
		}
	});
	
	$('.appContent').hammer().on('tap', '.pageHead', function(){
		if(currentPage!='calendar' && device.platform=='iOS'){
			showOverlayMenu();
		}
	});
	$('#menu-overlay').hammer().on('tap', '.overlayMenuItem', function(){
		page = $(this).attr('data-goto');
		hideOverlayMenu();
		if(page!='exitmenu'){
			linkToPage(page);
		}
	});
	//see if the rate app is set
	$('#menu-logged-in').hammer().on("release", '.myOptions', function(){
	  t = setTimeout(function(){
		 	$('#menu-logged-in').find('.myOptions').attr('data-status', 'min');
		   checkBottomMenuState();
	   }, 2000);
    });
    $('#menu-logged-in').hammer().on("touch", '.myOptions', function(){
	   clearTimeout(t);
	   $(this).attr('data-status', 'max');
	   checkBottomMenuState();
    });
    $('body').hammer().on("tap", '.calDateBox.active', function(){
	   $('.calDateBox.active.selected').removeClass('selected');
	   $(this).addClass('selected');
	   var date = $(this).attr('data-date');
	   parts = date.split('-');
		if(typeof eventsJson[parts[0]]!='undefined'){
		   if(typeof eventsJson[parts[0]][parts[1]]!='undefined'){
				$('#calInfoList').html('');	 	
			   $.each(eventsJson[parts[0]][parts[1]], function(id, appointment){
			   		var theTime = moment("01-01-2000 " + appointment.time, "MM-DD-YYYY HHmm").format('h:mma');
				   $('#calInfoList').append('<div class="rowOptionSingle"><span class="fadedOut">' + theTime + '</span> ' + appointment.title + ' <span style="font-size:8pt">(' + appointment.campus + ')</span></div>');
			   });
		   }else{
			   $('#calInfoList').html('<div class="nts">nothing on here</div>');
		   }
		}else{
				$('#calInfoList').html('<div class="nts">nothing on here</div>');
		}
    });
    $('body').hammer().on('tap', '.tickOption', function(){
    	if($(this).hasClass('checked')){
    		$(this).removeClass('checked');
    	}else{f
    		$(this).addClass('checked');
    	}
    });
    $('body').hammer().on('tap', '.pullToRefreshEmulate', function(){
    	$(this).html('<i class="fa fa-spinner fa-spin"></i> Loading');
    	pullToRefreshfunction();
  	});  
    
    $('body').hammer().on("tap", '.calTo', function(){
		build_calendar($(this).attr('data-calto'));
    });
    $('body').hammer().on('tap', '.myOptions li', function(){
    	//addTitle('Live Map');
		if(livemap!=null){
			livemap.remove();
			livemap = null;
		}
		clearTimeout(buildHomeTimeout);
		currentPage = $(this).attr('data-load');
		linkToPage($(this).attr('data-load'));
    });
    $('body').hammer().on('tap', '.viewBlog', function(){
    	clearTimeout(buildHomeTimeout);
		var requestedBlog = $(this).attr('data-id');
		var blogType = $(this).attr('data-blogType');
		var blogId = $(this).attr('data-blogId');
		$.jStorage.set('blog-' + blogType + '-' + blogId + '-read-' + requestedBlog, '1');
		var blogs = $.jStorage.get('blog-' + blogType + '-' + blogId);
		var scroll = $('.main-content-scroller').scrollTop();
		$.each(blogs, function(i, blog){
			if(blog.id==requestedBlog){
				thisBlog = blog;
			}	
		});

		var context = new Object;
		var dateTime = moment(thisBlog.created_at, "YYYY-MM-DD HH:mm:ss").format("ddd Do MMM YY");
		context['title'] = thisBlog.name;
		context['subTitle'] = thisBlog.ppl_fname + ' ' + thisBlog.ppl_sname;
		context['subTitleExtra'] = dateTime;
		context['body'] = thisBlog.content;
		context['backTo'] = blogType;
		context['backToScroll'] = scroll;
		var html = bigText_template(context);
		clearContent('#main-content');
		addContent('#main-content', html);
    });
    
    $('body').hammer().on('tap', '.backToHome', function(){
    	var scroll = $(this).attr('data-backtoscroll');
    	linkToPage($(this).attr('data-backto'), scroll);
    });

    $('body').hammer().on('tap', '.seriesImageLoose', function(){
    	var stream_id = $(this).attr('data-stream');
		var series_id = $(this).attr('data-series');
		var array_id = $(this).attr('data-array');
		var offset = $(this).offset();
		var width = $(this).width();
		var height = $(this).height();
		var bgImage = $(this).css('background-image');
		var placeHolder = $(this).clone();
			placeHolder.css('background-image', '');
			placeHolder.addClass('placeHolder');
		$(this).css('display', 'none');
		$(this).after(placeHolder);
		clone = 
				$('<div class="flipperContainer" data-series="' + series_id + '" data-array="' + array_id + '">' +
					'<div class="flip-container seriesImage flipSeries' + series_id + '">' +
						'<div class="flipper">' +
							'<div class="front series" style="background-image:' + bgImage + '">&nbsp;</div>' +
							'<div class="back"><div class="backContents"></div></div>' + 
						'</div>' + 
					'</div>' +
				'</div>');
		clone.addClass('clone');
		$('body').append('<div class="coverer" style="display:block"></div>');
		$('.coverer').css({
			'background-color': 'rgba(0,0,0,0.8)'
		}, 200);
		$('body').append(clone);
		clone.css({
			'width': width,
			'height': height,
			'top': offset.top,
			'left': offset.left,
			'display': 'block',
			'z-index': '5000'			
		});
		clone.attr('data-top', offset.top);
		clone.attr('data-left', offset.left);
		clone.attr('data-width', width);
		clone.attr('data-height', height);
		setTimeout(function(){
			clone.animate({
				'top': 2,
				'left': 2,
				'width': parseInt($(window).width())-4,
				'height': parseInt($(window).height())-24
			}, 200);
			var podcasts = $.jStorage.get('mediastreams');
			var series = podcasts[stream_id]['series'][array_id];
			clone.find('.seriesImage').addClass('flipped');
			context = new Object;
			context['series_image'] = supplyImage(series.image);
			context['series_title'] = series.series_title;
			context['count_podcasts'] = series.count;
			var html = podcastTemplate(context);
			clone.find('.backContents').html(html);
			$.ajax({
				url: apiUrl + '/mediastreams/' + stream_id + '/' + series_id,
				dataType: 'json',
				headers: { 'iknow-api-key': $.jStorage.get('api_key') },
				success: function(series){	
					if(series.status==true){
						if(series.data.series.count==0){
							$('.ptl-list').html('<div class="nts">no episodes in this series</div>');	
						}else{
							$('.ptl-list').html('');
							$.each(series.data.series.episodes, function(k, v){
								context = new Object;
								context['title'] = v.episode_title;
								context['url'] = v.episode_localurl;
								context['author'] = v.episode_speaker_1;
								context['description'] = v.episode_desc;
								var html = podcastEpisodeTemplate(context);
								$('.ptl-list').append(html);
							});
						}
					}else{
						$('.ptl-list').html('<div class="nts">could not communication with server</div>');	
					}
				},
				error: function(){
					linkToPage('home');
					$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
					$('.appmod-body').html('<p>Could Not Connect To Server</p>');
					$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
					$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
				}
			});
			$('.ptl-top').hammer().off('tap', '.closePodcastBack');
			$('.ptl-top').hammer().on('tap', '.closePodcastBack', function(){
		    	var thisView = $('.flipperContainer.clone');
		    	series = thisView.attr('data-array');
				thisView.animate({
				   'top': thisView.attr('data-top'),
				   'left': thisView.attr('data-left'),
				   'width': thisView.attr('data-width'),
				   'height': thisView.attr('data-height'),
			   }, 200);
			   thisView.find('.flip-container').removeClass('flipped');
			   $('.coverer').animate({
				   'background-color': 'rgba(0,0,0,0)'
			   }, 200);
			   setTimeout(function(){
			   		$('.looseSeries' + series).css('display', 'block');
			   		$('.placeHolder.looseSeries' + series).remove();
			   		thisView.remove();
				   $('.coverer').remove();
			   }, 200);
		    });
		}, 10);
    });
    $('body').hammer().on('tap', '.podcastStreamOption', function(){
		var stream_id = $(this).attr('data-stream');
		$('.podcastStreamOption').animate({
			'margin-left': '-1000px',
			'margin-right': '1000px'
		}, 300);
		$('#podcastScroll').css('background-color', 'black');
		setTimeout(function(){
			buildStream(stream_id); 			
		}, 300);
    });
    $('body').hammer().on('tap', '.podcastRowButton', function(){
    	$('.podcastRowButton').removeClass('active');
    	$(this).addClass('active');
    	$('#playProg').css('width', '0%');
    	document.getElementById('podcastPlayer').src=$(this).parent().attr('data-url');
	   document.getElementById('podcastPlayer').play(); 
	   clearTimeout(podcastUpdateTime);
	   podcastUpdateTime = setTimeout("checkPlayState()", 1000);
	   $('.podcastPlayer-player').removeClass('paused');
	   $('.podcastPlayer-player').removeClass('playing');
	   $('.podcastPlayer-player').html('<i class="fa fa-spin fa-spinner"></i>');
	   
	   var thisView = $('.flipperContainer.clone');
    	series = thisView.attr('data-array');
		thisView.animate({
		   'top': thisView.attr('data-top'),
		   'left': thisView.attr('data-left'),
		   'width': thisView.attr('data-width'),
		   'height': thisView.attr('data-height'),
	   }, 200);
	   thisView.find('.flip-container').removeClass('flipped');
	   $('.coverer').animate({
		   'background-color': 'rgba(0,0,0,0)'
	   }, 200);
	   setTimeout(function(){
	   		$('.looseSeries' + series).css('display', 'block');
	   		$('.placeHolder.looseSeries' + series).remove();
	   		thisView.remove();
		   $('.coverer').remove();
	   }, 200);
			   
			   
	});
    $('body').hammer().on('tap', '.podcastPlayer-player', function(){
   		if($(this).hasClass('paused')){
	   		//play this
	   		$(this).removeClass('paused');
	   		$(this).addClass('play');
	   		$('.podcastPlayer-player').html('<i class="fa fa-pause"></i>');
	   		document.getElementById('podcastPlayer').play();
	   		podcastUpdateTime = setTimeout("updatePlayerSlider()", 1000);
   		}else if($(this).hasClass('playing')){
	   		//pause this
	   		$(this).removeClass('play');
	   		$(this).addClass('paused');
	   		$('.podcastPlayer-player').html('<i class="fa fa-play"></i>');
	   		document.getElementById('podcastPlayer').pause();
	   		clearTimeout(podcastUpdateTime);
   		}
    });
    $('body').hammer().on('doubletap', '.podcastPlayer-player', function(){
    	$('#playProg').css('width', '0%');
    	$('.podcastPlayer-position').html('0:00:00');
    	$('.podcastPlayer-from').html('0:00:00');
    	$(this).removeClass('paused');
    	$(this).removeClass('playing');
    	$('.podcastPlayer-player').html('<i class="fa fa-stop"></i>');
    	document.getElementById('podcastPlayer').pause();
		document.getElementById('podcastPlayer').src='';
		document.getElementById('podcastPlayer').removeAttribute("src");
    });
    $('body').hammer().on('tap', '.podcastRowShow', function(){
	    descript = $(this).parent().parent().find('.podcastDescription');
	    height = descript.find('.innerHeight').height();
	    if($(this).attr('data-stat')=='closed'){
	    	$('.podcastDescription').animate({'height': 0, 'margin-top': 0}, 200);
			$('.podcastRowShow').attr('data-stat', 'closed');
	    	$(this).attr('data-stat', 'open');
	    	descript.animate({
	    		'margin-top': 10,
		    	'height': height
	    	}, 200);
    	}else{
	    	$('.podcastDescription').animate({'height': 0, 'margin-top': 0}, 200);
			$('.podcastRowShow').attr('data-stat', 'closed');
    	}
    });
    $('body').hammer().on('tap', '.submitLogin', function(){
		$('.loginBox').find('.canDisable').attr('disabled', 'disabled');
		$('input').blur();
		post = new Object;
		if($('#loginEmail').val()=='' || $('#loginPassword').val()==''){
			$('.loginBox').find('h4').html('<span class="text-warning">Please enter the fields</span>');
			$('.loginBox').find('.canDisable').removeAttr('disabled');
			$('#loginPassword').val('');
			$('#loginEmail').focus();
		}else{
			post['email'] = $('#loginEmail').val();
			post['password'] = $('#loginPassword').val();
			$('.submitLogin').html('<i class="fa fa-spin fa-spinner"></i>');
			$.ajax({
				url: apiUrl + '/auth/login',
				dataType: 'json',
				data: post,
				type: 'post',
				headers: { 'iknow-api-key': $.jStorage.get('api_key') },
				success: function(series){	
					if(series.auth.status==true){
						$.jStorage.set('firstname', series.data.ppl_fname);
						$.jStorage.set('lastname', series.data.ppl_sname);
						$.jStorage.set('loggedInUser', series.auth.ppl_id);
						//login
						authLoginInit();
						$('.loginBox').animate({
							'top': -320
						}, 200, function(){
							$('.coverer').remove();
							$('.loginBox').remove();
						});
						$('.coverer').animate({
							'background-color': 'rgba(0,0,0,0)'
						}, 200);
					}else{
						$('.loginBox').find('.canDisable').removeAttr('disabled');
						$('#loginPassword').val('');
						$('#loginPassword').focus();
						$('.loginBox').find('h4').html('<span class="text-warning">Authentication Failed</span>');
						$('.submitLogin').html('Try Again');
					}
				},
				error: function(){
					linkToPage('home');
					$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
					$('.appmod-body').html('<p>Could Not Connect To Server</p>');
					$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
					$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
				}
			});
		}
		
    });
     $('body').hammer().on('tap', '.cancelLogin', function(){
		$('.loginBox').animate({
			'top': -320
		}, 200, function(){
			$('.coverer').remove();
			$('.loginBox').remove();
		//	linkToPage('home');
		});
		$('.coverer').animate({
			'background-color': 'rgba(0,0,0,0)'
		}, 200);
    });
    $('body').hammer().on('tap', '.submitReg', function(){
		 var name = $('#subscribeName').val();
		 var email = $('#subscribeEmail').val();
		 var date = $('#dobDate').val();
		 var month = $('#dobMonth').val();
		 var year = $('#dobYear').val();
		 if (date == 'DD') date = '00';
		 if (month =='MM') month = '00';
		 if (year =='YYYY') year = '0000'; 
		 if(name.length==0 || email.length==0 || date=='DD' || month=='MM' || year=='YYYY'){
			 $('.subscribeBox h4').html('Please fill out all the boxes');
		 }else if(!checkEmail(email)){
			 $('.subscribeBox h4').html('Invalid Email');
		 }else{
			 $('.subscribeBox').find('.canDisable').attr('disabled', 'disabled');
			 $('.submitReg').html('<i class="fa fa-spin fa-spinner"></i>');
			 post = new Object;
			 post['name'] = name;
			 post['email'] = email;
			 post['dob-d'] = date;
			 post['dob-m'] = month;
			 post['dob-y'] = year;
			 post['lat'] = lat;
			 post['long'] = lng;
			 $.ajax({
				url: apiUrl + '/auth/register',
				dataType: 'json',
				data: post,
				type: 'post',
				headers: { 'iknow-api-key': $.jStorage.get('api_key') },
				success: function(series){	
					if(series.status==true){
						$('.subscribeBox').find('.canDisable').removeAttr('disabled');
						if(series.auth.ppl_id!=null){
							$.jStorage.set('loggedInUser', series.auth.ppl_id);
							$.jStorage.set('firstname', series.data.ppl_fname);
							$.jStorage.set('lastname', series.auth.ppl_sname);
							$('.subscribeBox').animate({
								'top': -320
							}, 200, function(){
								$('.coverer').remove();
								$('.subscribeBox').remove();
								profileInfo(series.data.campuses, true);	
							});
							$('.coverer').animate({
								'background-color': 'rgba(0,0,0,0)'
							}, 200);
						}else{
							$('.registerCoverer').unbind('click');
							emailAddress = post['email'];
							$('.subscribeBox h4').html('<i class="fa fa-exclamation-triangle"></i> Already Registered');
							$('.subscribeBox').find('.subscribeTextBox').remove();
							$('.subscribeBox').height(140);
							$('.subscribeBox').append('<div class="subscribeTextBox"><div style="width: 50%; padding: 5px"><button class="btn btn-info btn-block regToLogin">OK, Login</button></div><div style="width: 50%; padding: 5px"><button class="btn btn-success btn-block regPasswordReset">Password Reset</button></div></div>');
						}
					}
				},
				error: function(){
					linkToPage('home');
					$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
					$('.appmod-body').html('<p>Could Not Connect To Server</p>');
					$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
					$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
				}
			});
		 }
    });
    $('body').hammer().on('tap', '.regToLogin', function(){
	    $('.subscribeBox').animate({
			'top': -320
		}, 200, function(){
			$('.coverer').remove();
			$('.subscribeBox').remove();
			showLogin(emailAddress);
		});
		$('.coverer').animate({
			'background-color': 'rgba(0,0,0,0)'
		}, 200);
    });
    $('body').hammer().on('tap', '.regPasswordReset', function(){
		$('.regToLogin').attr('disabled', 'disabled');
		$('.regPasswordReset').attr('disabled', 'disabled');
		$('.regPasswordReset').html('<i class="fa fa-spin fa-spinner"></i>');
		post = new Object;
		post['email'] = emailAddress;
		$.ajax({
			url: apiUrl + '/auth/passwordReset',
			dataType: 'json',
			data: post,
			type: 'post',
			headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			success: function(series){	
				if(series.status==true){
					$('.regPasswordReset').html('Sent!');
					setTimeout(function(){
						$('.subscribeBox').animate({
							'top': -320
						}, 200, function(){
							$('.coverer').remove();
							$('.subscribeBox').remove();
							linkToPage('home');
						});
						$('.coverer').animate({
							'background-color': 'rgba(0,0,0,0)'
						}, 200);
					}, 1000);
				}else{
					$('.regPasswordReset').html('Error');
					setTimeout(function(){
						$('.subscribeBox').animate({
							'top': -320
						}, 200, function(){
							$('.coverer').remove();
							$('.subscribeBox').remove();
							linkToPage('home');
						});
						$('.coverer').animate({
							'background-color': 'rgba(0,0,0,0)'
						}, 200);
					}, 1000);
				}
			},
			error: function(){
				linkToPage('home');
				$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
				$('.appmod-body').html('<p>Could Not Connect To Server</p>');
				$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
				$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
			}
		});
    });
	/*
	$('#main-content').on('focus', 'input,select,textarea', function(e){
		clearTimeout(t);
		$('#main-content').css('bottom', '0px');
		$('#menu-logged-in').css({
			'bottom': '-' + (dockHeight+25) +'px'
		});
	});
	$('#main-content').on('blur', 'input,select,textarea', function(e){
		if(!$(this).hasClass('saveBlur')){
			clearTimeout(t);
			$('#main-content').css('bottom', (dockHeight-25) +'px');
			$('#menu-logged-in').css({
				'bottom': '-25px' 
			});
		}
	});
	*/
	$('body').hammer().on('tap', '.userEntryCoverer', function(){
		$('input').blur();
		$('.userEntryCoverer').animate({'background-color': 'rgba(0,0,0,0)'}, 200, function(){$('.userEntryCoverer').css('display', 'none');});
		$('.userEntryBox').animate({'top': -240}, 200);
	});
	$('body').hammer().on('tap', '.buttonradio button', function(){
		val = $(this).attr('data-value');
		$(this).parent().attr('data-value', val);
		$(this).parent().find('button').removeClass('active');
		$(this).addClass('active');
		$(this).parent().find('.btnvalue').val(val);
	});
	$('body').hammer().on('tap', '.dashticket_block', function(){
		currentPage = 'tickets';
		$('.main-content-scroller').html('<div id="showTicketsHere"></div>');
		$('.main-content-scroller').css('background-color', '#fff');
		$('#showTicketsHere').html('<div class="loadingHolder"><i class="fa fa-spin fa-spinner"></i></div>');
		showTicketInfo($(this));
	});
	$('body').hammer().on('tap', '.givingLink', function(){
		//code for giving

	});
    setTimeout(function(){
		$('#splash').fadeOut(100, function(){
		    $('#splash').remove();
	    });
	}, 100);	
});


$(window).resize(function(){
	var w = $(window).width();
	var h = $(window).height();
	isItResized(w, h);
});
function checkConnection() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'unknown';
    states[Connection.ETHERNET] = 'eth';
    states[Connection.WIFI]     = 'wifi';
    states[Connection.CELL_2G]  = '2g_cell';
    states[Connection.CELL_3G]  = '3g_cell';
    states[Connection.CELL_4G]  = '4g_cell';
    states[Connection.CELL]     = 'generic_cell';
    states[Connection.NONE]     = 'no_network';
    return states[networkState];
}

function showLogin(email){
	if(email==null){email='';}
	$('body').append('<div class="coverer cancelLogin"></div>');
	$('body').append(
	 	'<div class="loginBox">' + 
	 		'<h4 style="padding: 2px 10px; margin: 8px;"><i class="fa fa-lock"></i> Login With iKnow</h5>' + 
	 		'<hr style="margin: 0px;" />' + 
	 		'<div class="loginTextBox"><input type="email" class="form-control canDisable" placeholder="email address" id="loginEmail" value="' + email + '"></div>' + 
	 		'<div class="loginTextBox"><input type="password" class="form-control canDisable" placeholder="password" id="loginPassword"/></div>' +
	 		'<div class="loginTextBox" style="float:left; width:50%"><button class="btn btn-block btn-warning cancelLogin canDisable">Cancel</button></div>' +
	 		'<div class="loginTextBox" style="float:left; width:50%"><button class="btn btn-block btn-success submitLogin canDisable">Login</button></div>' +
	 		'<div style="clear:both"></div>' + 
	 	'</div>'
	 );
	$('.cancelLogin').css('display', 'block');
	$('.loginBox').animate({
		'top': 0
	}, 200);
	$('.coverer').css({
		'background-color': 'rgba(0,0,0,0.8)'
	}, 200);
	setTimeout(function(){
		$('#loginEmail').focus();
	}, 300);
}
function checkEmail(email) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!filter.test(email)) {
    	return false;
	}else{
		return true;
	}
}
function profileInfo(obj, reBuild){
	id = obj.id; 
	title = obj.title; 
	type = obj.type; 
	options = obj.options;
	$('.profileInfoBox').remove();
	$('body').append(
	 	'<div class="profileInfoBox">' + 
	 		'<h4 style="padding: 2px 10px; margin: 8px;"><i class="fa fa-comment-o"></i> ' + title + '</h5>' + 
	 		'<hr style="margin: 10px;" />' + 
	 	'</div>'
	 );
	 if(type=='dropdown'){
		 $('.profileInfoBox').append('<div class="subscribeTextBox"><div style="width: 100%;"><select style="width:100%" class="canDisable answer select"><option>Choose</option></select></div></div>');
		 $.each(options, function(i, option){
			$('select.canDisable.answer.select').append('<option value="' + i + '">' + option + '</option>');
		 });
	 }else if(type=='text'){
		 $('.profileInfoBox').append('<div class="subscribeTextBox"><div style="width: 100%;"><input type="text" class="form-control canDisabled answer" /></div></div>');
	 }else if(type=='password'){
	 	$('.profileInfoBox').append('<div class="subscribeTextBox"><div style="width: 100%;"><input type="password" class="form-control canDisabled answer" /></div></div>');
	 }
	 $('.profileInfoBox').append('<div class="subscribeTextBox" width:100%"><button class="btn btn-block btn-info canDisable submitProfileChange" onclick="submitProfileChange(' + reBuild + ')">OK</button></div>');
	 $('.profileInfoBox').append('<input type="hidden" class="fieldName" value="' + id + '" />');
	 $('body').append('<div class="coverer"></div>');
	 $('.coverer').css('display', 'block');
	 $('.profileInfoBox').animate({
		 'top': 0
	 }, 200);
	 $('.coverer').css({
		 'background-color': 'rgba(0,0,0,0.8)'
	 }, 200);
		 
}
function submitProfileChange(reBuild){
	var val = $('.profileInfoBox').find('.answer').val();
	var field = $('.profileInfoBox').find('.fieldName').val();
	$('.profileInfoBox').find('h4').css('color', '#000');
	if(val=='' || val.length==0 || val=='Choose'){
		$('.profileInfoBox').find('h4').css('color', 'red');
	}else{
		$('.profileInfoBox').find('.canDisable').attr('disabled', 'disabled');
		$('.submitProfileChange').html('<i class="fa fa-spin fa-spinner"></i>');
		post = new Object;
		post['data'] = new Object;
		post['data'][field] = val;
		$.ajax({
			url: apiUrl + '/account/',
			dataType: 'json',
			data: post,
			type: 'put',
			headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			success: function(series){	
				$('.submitProfileChange').html('All Done!');
				setTimeout(function(){	
					$('.profileInfoBox').animate({
						'top': -170
					}, 200, function(){
						$('.coverer').remove();
						$('.profileInfoBox').remove();
						if(reBuild==true){
							authLoginInit();
						}else{
							linkToPage('home');
						}
					});
					$('.coverer').animate({
						'background-color': 'rgba(0,0,0,0)'
					}, 200);
				}, 1000);
			},
			error: function(series){
				$('.submitProfileChange').html('Error!');
				setTimeout(function(){	
					$('.profileInfoBox').animate({
						'top': -170
					}, 200, function(){
						$('.coverer').remove();
						$('.profileInfoBox').remove();
						linkToPage('home');
					});
					$('.coverer').animate({
						'background-color': 'rgba(0,0,0,0)'
					}, 200);
				}, 1000);
			}
		});
	}
	
}
function checkPlayState(){
	var state = document.getElementById('podcastPlayer').readyState;
	if(state==3 || state==4){
		updatePlayerSlider();
	}else{
		podcastUpdateTime = setTimeout("checkPlayState()", 1000);
	}
}

function updatePlayerSlider(){
	var dur = parseInt(document.getElementById('podcastPlayer').duration);
	var ply = parseInt(document.getElementById('podcastPlayer').currentTime);
	//find out if we are still spinning
	if(ply && dur){
		var percent = Math.round(((ply/dur)*100));
		$('#playProg').css('width', percent+'%');
		console.log(percent);
		if(!$('.podcastPlayer-player').hasClass('paused') && !$('.podcastPlayer-player').hasClass('playing')){
			$('.podcastPlayer-player').addClass('playing');
			$('.podcastPlayer-player').html('<i class="fa fa-pause"></i>');
		}
		var rem = parseInt(dur-ply);
		$('.podcastPlayer-position').html(numeral(ply).format('00:00'));
		$('.podcastPlayer-from').html(numeral(rem).format('00:00'));
	}
	podcastUpdateTime = setTimeout("updatePlayerSlider()", 1000);
}
function isItResized(w, h){
	setTimeout(function(){
		var nw = $(window).width();
		var nh = $(window).height();
		if(nw==w){
			if(nh==h){
				windowResized();
			}
		}
	}, 200);
}
function windowResized(){
//	pageInit(globJson);
}
function linkToPage(page, scroll){
	$('.infoBarDrop').animate({
		'top': '-40px'
	}, 500, function(){
		$('.infoBarDrop').remove();
	})
	if(currentPage=='podcasts' && page=='podcasts'){
		//dont fadeout
	}else{
		clearTimeout(podcastUpdateTime);
		$('.podcastPlayer').css('display', 'none');	
	}
	if(page=='logout'){
		authLogoutInit();
		return;
	}
	$('.myOptions li').removeClass('active');
	$('li[data-load="' + page + '"]').addClass('active');
	var templateName = 'tmp_page_' + page;
	//var functionName = $(this).attr('data-init');
	var functionName = 'build_' + page;
		currentPage = page;
	var functionParams = 'null';
	var html = window[templateName];
	setTimeout(function(){
		$('#main-content').html(html);
		if(typeof window[functionName] === 'function') {
			functionParams = functionParams.split(",");
			window[functionName](functionParams);
		}
		if(typeof scroll!='undefined'){
			if(scroll!=null){
				$('.main-content-scroller').scrollTop(scroll);
			}
		}
	}, 400);
}    
function clearContent(selector){
	$(selector).html('');
}
function addContent(selector, html){
	$(selector).append(html);
}
function pageInit(json){
	if(bottomMenuScroll!=null){
		bottomMenuScroll.destroy();
	}
	bottomMenuScroll = null;
	$('.churchName').html(json.church.name);
	var appTemplate = tmp_btmAppLink();
	//set up the logged in option scroll
	//first set the icon width based on the screen width
	var width = $(window).width()-40;
	var height = $(window).height();
	var display = 1;
	if(width<520){
		display = 4;
	}else if(width<610){
		display = 5
	}else if(width<768){
		display = 6
	}else if(width<840){
		display = 7;
	}else if(width<900){
		display = 8;
	}else{
		display = 9;
	}
	var countMyOpts = $('.myOptions').find('li').length;
	var iconSquare = width/display;
	$('.myOptionsScroller').width(iconSquare*countMyOpts);
	$('.myOptions li').css({'width': iconSquare+'px', 'height': iconSquare+'px'})
	$('#menu-logged-in').css({
		'height': iconSquare+"px",
		'width': width+'px',
		'left': '20px',
		'right': '20px'
	});
	$('#bottom-bar-cont').find('.chevvy').css({
		'line-height': (iconSquare-20)+"px"
	});
	$('#bottom-bar-cont').height(iconSquare);
	$('.loggedInIcon').each(function(){
		var square = $(this).parent().height()-30;
		$(this).css({
			'-webkit-border-radius': ($(this).parent().height()+20)/2 + 'px',
			'height': square+'px',
			'width': square + 'px',
		});
		$(this).find('.optionIcon').css({
			'line-height': square + 'px',
			'font-size': square/8*5 + 'px'
		});	
		$(this).parent().find('.optionText').css({
			'font-size': square/24*4 + 'px'
		});
	});

	dockHeight = iconSquare;
	menuHeight = height-40;
	bottomMenuScroll = new iScroll('menu-logged-in', {
		snap: 'li',
		momentum: true,
		hScrollbar: false,
		vScrollbar: false,
		vScroll: false,
		useTransform: true,
		zoom: false
	});	
	$('#topMenuPull').css({
		'width': width + 'px',
		'height': height+ 'px',
		'top': '-' + menuHeight + 'px'
	});
	$('.pageTitle').css('width', (width+40) +'px');
	$('#main-content').css('bottom', (dockHeight-25) + 'px');
	var seventh = (width+40)/7;
	$('#jsSet').append('.col-7{width:' + seventh + 'px;}');
	$('.startupprocess').append('Content buffer created<br>');
	
}
function checkBottomMenuState(){
	var status = $('#menu-logged-in').find('.myOptions').attr('data-status');
	if(status=='min'){
		setTimeout(function(){
			var status = $('#menu-logged-in').find('.myOptions').attr('data-status');
			if(status=='min'){
				$('#bottom-bar-cont').animate({
					'height': (dockHeight) + 'px'
				},200);
				$('#bottom-bar-cont').find('.chevvy').animate({
					'line-height': (dockHeight-20)+"px"
				});
			}
		}, 400);
	}else{
		$('#bottom-bar-cont').animate({
			'height': dockHeight+25 + 'px'
		},200);
		$('#bottom-bar-cont').find('.chevvy').animate({
			'line-height': (dockHeight)+"px"
		});
	}	
}

//these are all phonegap functions
function onDeviceReady(){
	alert(JSON.stringify(device));
	StatusBar.show();
	StatusBar.overlaysWebView(false);
	$('.startupprocess').append('Device Ready<br>');
	deviceReady = 1;
	canISetUp();
	$.jStorage.set('device_uuid', device.uuid);
	$.jStorage.set('device_model', device.model);
	$.jStorage.set('device_platform', device.platform);
	$.jStorage.set('device_version', device.version);
	navigator.geolocation.clearWatch(watchID);
	watchID = navigator.geolocation.watchPosition(onLocationUpdateSuccess, onLocationUpdateError, { frequency: 20000 });
//navigator.camera.getPicture( cameraSuccess, cameraError, { quality: 50, allowEdit: true, destinationType : Camera.DestinationType.FILE_URI });
	rateAppTime();
}
function PgetTheToken(){
	pushNotification = window.plugins.pushNotification;
	if ( device.platform == 'android' || device.platform == 'Android' )
	{
	    pushNotification.register(
	        PsuccessHandler,
	        PerrorHandler, {
	            "senderID":"589461906242",
	            "ecb":"onNotificationGCM"
	        });
	}
	else
	{
	    pushNotification.register(
	        PtokenHandler,
	        PerrorHandler, {
	            "badge":"true",
	            "sound":"true",
	            "alert":"true",
	            "ecb":"onNotificationAPN"
	        });
	}
}
function PsuccessHandler (result) {
	//android one is not handled here
}
function PerrorHandler (error) {
    $.jStorage.set('device_ptoken', null);
}
function PtokenHandler (result) {
    $.jStorage.set('device_ptoken', result);
    token = new Object;
   	token['device_ptoken'] = result;
    $.ajax({
		type: 'put',
		url: apiUrl + '/auth/ptoken',
		data: token,
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') }
	});
}   
function onNotificationGCM(e) {
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                $.jStorage.set('device_ptoken', e.regid);
			   	token = new Object;
			   	token['device_ptoken'] = e.regid;
			    $.ajax({
					type: 'put',
					url: apiUrl + '/auth/ptoken',
					data: token,
					dataType: 'json',
					headers: { 'iknow-api-key': $.jStorage.get('api_key') }
				});
            }
        break;

        case 'message':
          // this is the actual push notification. its format depends on the data model
          // of the intermediary push server which must also be reflected in GCMIntentService.java
          //alert(JSON.stringify(e));
        break;

        case 'error':
          //alert('GCM error = '+e.msg);
        break;

        default:
          //alert('An unknown GCM event has occurred');
          break;
    }
}


function canISetUp(){
	verifyApp();
	$('.startupprocess').append('Set up attempt<br>');
	setTimeout(function(){
	linkToPage('home');
	}, 100);
	if(apiUrl==null){
		clearTimeout(setUpT);
		setUpT = setTimeout("canISetUp()", 100);
	}else{
		//put the instructions screen in

		if(!$.jStorage.get('firstinstructions') && device.platform=='iOS'){
			$('#menu-overlay-instructions').css('display', 'block');
			$('#menu-overlay-instructions').hammer().on('tap', '.closeFirstInstructions', function(){
				$.jStorage.set('firstinstructions', 'seenit');
				$('#menu-overlay-instructions').fadeOut(function(){
					$('#menu-overlay-instructions').remove();
				});
			});
		}else{
			$('#menu-overlay-instructions').remove();
		}

		whoami = new Object;
		whoami['storedImages'] = getStoredImages();
		if(!$.jStorage.get('api_key') || $.jStorage.get('api_key')=='null'){
			//there is no api key, no connection has ever been made to the server
			//i need to tell the server who i am
			$.jStorage.set('api_key', 'null');
			whoami['device_model'] = device.model;
			whoami['device_platform'] = device.platform;
			whoami['device_version'] = device.version;
			whoami['uuid'] = device.uuid;
			whoami['device_ptoken'] = '';
		}else{
			whoami['null'] = true;
		}
		
		$.ajax({
			type: 'post',
			url: apiUrl + '/app/all',
			data: whoami,
			dataType: 'json',
			headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			success: function(church){
				//get api key
				$('.startupprocess').append('Server connection success<br>');
				$.jStorage.set('api_key', church.auth.key);
				if(church.auth.status==false && $.jStorage.get('loggedInUser')!='null'){
					//the user has been logged out fail;
					authLogoutInit();
					return;
				}	
				if(church.status==true){
					$.jStorage.set('lastUpdated', moment());
					$.each(church.data, function(key, val){
						$.jStorage.set(key, val);
					});
				}
				if(currentPage=='home'){
					createPullScroll = true;
					buildHomeTimeout = setTimeout("build_home()", 100);
					if(church.data.accountUpdates!=false){
						profileInfo(church.data.accountUpdates, false);
					}
				}
				PgetTheToken();
			},
			error: function(church){
				// alert('error 1');
				// linkToPage('home');
				// $('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
				// $('.appmod-body').html('<p>Could Not Connect To Server</p>');
				// $('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
				// $('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
			}
		});
	}
}
	function onAppPause(){
		navigator.geolocation.clearWatch(watchID);
		clearTimeout(podcastUpdateTime);
	}
	function onAppResume(){
		verifyApp();
		navigator.geolocation.clearWatch(watchID);
		watchID = navigator.geolocation.watchPosition(onLocationUpdateSuccess, onLocationUpdateError, { frequency: 20000 });
		//see if we need to roger refresh
		lastUpdated = $.jStorage.get('lastUpdated');
		rateAppTime();
		if(lastUpdated!=null){
			var timeAgo = moment().diff(lastUpdated, 'seconds');
			if(timeAgo>3600){
				//refresh and send home
				linkToPage('home');
				apiUrl = globJson.init.base_url;
				lat = globJson.church.lat;
				lng = globJson.church.lng;
				$('.pulToRefreshDiv').html('<i class="fa fa-spinner fa-spin"></i> Updating');
				$('.main-content-scroller').css('margin-top', 0);
				$.ajax({
					url: apiUrl + '/app/all',
					dataType: 'json',
					headers: { 'iknow-api-key': $.jStorage.get('api_key') },
					success: function(church){	
						if(church.auth.status==false && $.jStorage.get('loggedInUser')!='null'){
							//the user has been logged out fail;
							authLogoutInit();
							return;
						}	
						if(church.status==true){
							$.jStorage.set('lastUpdated', moment());
							$.each(church.data, function(key, val){
								$.jStorage.set(key, val);
							});
						}
						if(currentPage=='home'){
							$('.main-content-scroller').animate({
								'margin-top': -45
							}, 200, function(){
								buildHomeTimeout = setTimeout("fillHomePage()", 100);
								if(church.data.accountUpdates!=false){
									profileInfo(church.data.accountUpdates, false)
								}
							});
						}
					},
					error: function(){
						linkToPage('home');
						$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
						$('.appmod-body').html('<p>Could Not Connect To Server</p>');
						$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
						$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
					}
				});
			}
		}else{
			//refresh and send home
			linkToPage('home');
			apiUrl = globJson.init.base_url;
			lat = globJson.church.lat;
			lng = globJson.church.lng;
			$('.pulToRefreshDiv').html('<i class="fa fa-spinner fa-spin"></i> Updating');
				$('.main-content-scroller').css('margin-top', 0);
				$.ajax({
					url: apiUrl + '/app/all',
					dataType: 'json',
					headers: { 'iknow-api-key': $.jStorage.get('api_key') },
					success: function(church){	
						if(church.auth.status==false && $.jStorage.get('loggedInUser')!='null'){
							//the user has been logged out fail;
							authLogoutInit();
							return;
						}	
						if(church.status==true){
							$.jStorage.set('lastUpdated', moment());
							$.each(church.data, function(key, val){
								$.jStorage.set(key, val);
							});
						}
						if(currentPage=='home'){
							$('.main-content-scroller').animate({
								'margin-top': -45
							}, 200, function(){
								buildHomeTimeout = setTimeout("fillHomePage()", 100);
								if(church.data.accountUpdates!=false){
									profileInfo(church.data.accountUpdates, false)
								}
							});
						}
					},
					error: function(){
						linkToPage('home');
						$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
						$('.appmod-body').html('<p>Could Not Connect To Server</p>');
						$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
						$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
					}
				});			
		}
		if(currentPage=='podcasts'){
			podcastUpdateTime = setTimeout("updatePlayerSlider()", 100);
		}
	}
	function cameraSuccess(imageData){
		var image = document.getElementById('myImage');
		image.src = imageData;
	}
	function cameraError(){
		//camera failed
		return false;
	}
	function onLocationUpdateSuccess(position){
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		sendLoc('false');
		if(currentPage=='map'){
			if(meLayer!=null){
				livemap.removeLayer(meLayer);
				meLayer = null;
			}
			meLayer = 	new L.layerGroup();
			mymarker = L.marker([lat, lng], {icon: redIcon}).addTo(meLayer);
			livemap.addLayer(meLayer);
		}
	}
	function onLocationUpdateError(error) {
		//could not determine location
	}
//end phonegap functions
//some random functions
function addTitle(title){
	if(title=='[church_name]'){
		var title = "<span class='churchName'>" + globJson.church.name + "</span>";
	}else{
		var title = title;
	}
	$('.pageTitle').html(title);
}

function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}
function htmlEntities(str) {
    return String(str).replace(/<\/?[^>]+(>|$)/g, "");
}
//end of random functions
function buildMenu(){
	$('#showMenuHere').html('');
	
	if($.jStorage.get('device_platform')!=null){
		var platform = $.jStorage.get('device_platform');
		$.each(globJson.init.menu.public, function(i, context){
			if((context.ios==true && platform=='iOS') || (context.android==true && (platform=='android' || platform=='Android'))){
				if((context.private==true && $.jStorage.get('loggedInUser')!='null') || context.private==false){
					var html = bottomLink_template(context);
					if(i==0){
						var h = $(html);
						h = h.addClass('active');
					}else{
						h = html;
					}
					$('#showMenuHere').append(h);
				}
			}
		});
		$('#showMenuHere').append('<div style="clear:both"></div>');
		$('.startupprocess').append('Built menu<br>');
	}else{
		setTimeout(function(){
			if(globJson!=null&&navigator.product=="Gecko"){
				if(navigator.userAgent.match(/(iPhone|iPod|iPad)/)){
					$.jStorage.set('device_platform', "iOS");
				}else{
					$.jStorage.set('device_platform', "android");
					$.jStorage.get('device_platform')
				}
				
			}
			
			buildMenu();
			pageInit(globJson);
		}, 500);
	}
/*	if($.jStorage.get('loggedInUser')!='null'){
		$.each(globJson.init.menu.private, function(i, context){
			var html = bottomLink_template(context);
			$('#showMenuHere').append(html);
		});
	}
*/
	
}
function tmp_btmAppLink(){
	var tmp = [
		'<li data-load="{{href}}" data-init="{{init}}" data-params="{{params}}">',
			'<div class="loggedInIcon">',
				'<div class="optionIcon">',
					'<i class="fa {{icon}}"></i>',
				'</div>',
			'</div>',
			'<div class="optionText">{{text}}</div>',
		'</li>'	
	];
	return tmp.join(" ");
}
//the following functions are to build pages, they are build followed by template
function build_calendar(month){
	var startDay = 0; //start calendar on sunday
	var endDay = 6+startDay;
	if(endDay>6){
		endDay = endDay-7;
	}
	if(month=='null'){
		//looking in this month
		var year = moment().format('YY');
		var month = moment().format('MM');
	}else{
		var year = month.substring(2,4);
		var month = month.substring(0,2);
	}
	var thisView = month + year;
	var rightNow = moment().format('MMYY');
	var firstDate = moment(month + "-01-" + year, "MM-DD-YY");
	var lastDate = moment(firstDate).add('months', 1).date(0);
	var days = firstDate.daysInMonth();
	var dayStart = parseInt(firstDate.format('d'));
	var dayEnd = parseInt(lastDate.format('d'));
	if(thisView==rightNow){
		var highlight = parseInt(moment().format('D'))-1;
	}else{
		var highlight = null;
	}
	/*
		our calendar has sunday at the start, so we can find out how many days we need before the first day
	*/
	//get next month
	var nextMonth = moment(firstDate).add('months', 1).format('MMYY');
	var lastMonth = moment(firstDate).add('months', -1).format('MMYY');
	var currentMonthTitle = moment(firstDate).format('MMM YYYY')
	var calHtml = '';
	var titleHtml = '';
	var prepend = dayStart+(7-startDay);
	if(prepend>6){prepend=prepend-7;}
	var daysUsed = days+prepend;
	var daysOver = daysUsed-(7*(Math.floor(daysUsed/7)));
	var append = 7-daysOver;
	if(append>6){append = append-7;}
	//put in the title bar
	titleHtml += '<div class="calTitleBar">';
	titleHtml += '<span class="calArr calTo leftArrow" data-calto="' + lastMonth + '"><span class="calArrBtnIn"><span class="arrowICont"><i class="fa fa-chevron-left"></i></span></span></span>';
	titleHtml += '<span class="calTitle calTo" data-calto="' + rightNow + '">' + currentMonthTitle + '</span>';
	titleHtml += '<span class="calArr calTo rightArrow" data-calto="' + nextMonth + '"><span class="calArrBtnIn"><span class="arrowICont"><i class="fa fa-chevron-right"></i></span></span></span>';
	titleHtml += '</div>';
	$('.pageTitle').html(titleHtml);
	
	//put in the titles first
	titleDay = startDay;
	titles = {0:'S',1:'M',2:'T',3:'W',4:'T',5:'F',6:'S'};
	for(i=0; i<7; i++){
		calHtml += '<span class="calDateTitle col-7">' + titles[titleDay] + '</span>';
		titleDay++;
		if(titleDay==7){
			titleDay=0;
		}	
	}
	for(i=0; i<prepend; i++){
		var date = (days-prepend)+1+i;
		calHtml += '<span class="calDateBox deactive col-7">' + date + '</span>';
	}
	for(i=0; i<days; i++){
		if(i==highlight){
			calHtml += '<span class="calDateBox active selected col-7" id="calDate' + (i+1) + '" data-date="' + thisView + '-' + (i+1) + '">' + (i+1) + '</span>';
		}else{
			calHtml += '<span class="calDateBox active col-7" id="calDate' + (i+1) + '" data-date="' + thisView + '-' + (i+1) + '">' + (i+1) + '</span>';	
		}
	}
	for(i=0; i<append; i++){
		calHtml += '<span class="calDateBox deactive col-7">' + (i+1) + '</span>';
	}
	$('#showCal').html(calHtml);
	$('.calendarBottom').css({
		'top': $('#showCal').height()
	});
	//time to populate the mega cal
	
	if($.jStorage.get('whatson')){
		eventsJson = $.jStorage.get('whatson');
		if(typeof eventsJson[thisView]!='undefined'){
			events = eventsJson[thisView];
			$.each(events, function(date, day){
				var count = day.length;
				$('#calDate' + date).addClass('events' + count);
			});
		}		
	}
	//here we will cheeky select the current date
	//here we will cheeky select the current date
	i = 0;
	$('.calDateBox.active.selected').each(function(){
		var date = $(this).attr('data-date');
		parts = date.split('-');
		if(typeof eventsJson[parts[0]]!='undefined'){
		   if(typeof eventsJson[parts[0]][parts[1]]!='undefined'){
				$('#calInfoList').html('');	 	
			   $.each(eventsJson[parts[0]][parts[1]], function(id, appointment){
			   		var theTime = moment("01-01-2000 " + appointment.time, "MM-DD-YYYY HHmm").format('h:mma');
				   $('#calInfoList').append('<div class="rowOptionSingle"><span class="fadedOut">' + theTime + '</span> ' + appointment.title + ' <span style="font-size:8pt">(' + appointment.campus + ')</span></div>');
			   });
		   }else{
			   $('#calInfoList').html('<div class="nts">nothing on here</div>');
		   }
		}else{
				$('#calInfoList').html('<div class="nts">nothing on here</div>');
		}
		i++;
	});
	if(i==0){
		$('#calInfoList').html('<div class="nts">choose a date</div>');
	}
}
function tmp_page_calendar(){
	var tmp = [
		'<div class="calendarTop">' +
			'<div id="showCal"></div>' +
		'</div>' +
		'<div class="calendarBottom">' +
			'<div id="calInfoScroll" class="main-content-scroller">' +
				'<div id="calInfoList" class="rowOptionSingleCont"></div>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}


function build_home(){
//	$('.startupprocess').append('Building home page<br>');
	if($.jStorage.get('home')!=null){
		addTitle('Home');
		fillHomePage();
		$('#homeScroll > *').css("margin-top", -45);
		$('#homeScroll').hammer().off('tap', '.loginOption');
		$('#homeScroll').hammer().on('tap', '.loginOption', function(){
			 //open the mega login option
			 showLogin(null);
	    });
	    
		height = $('#homeScroll .paddedContent').height();
		var newHeight = $('#homeScroll .paddedContent').parent().height();
		$('#homeScroll .paddedContent').css({
			'min-height': (newHeight+1) + 'px' 
		});

	    $('.main-content-scroller').hammer().on('dragdown', '.paddedContent', function(){
	    	if(refreshing==false){
		    	var scrolled = parseInt($('.paddedContent').position().top);
		    	if(scrolled>=45 && scrolled <=50){
		    		$('.pulToRefreshDiv').html('<i class="fa fa-chevron-up"></i> Release To Refresh <i class="fa fa-chevron-up"></i>');
		    	}
		    }
	    });
	    $('.main-content-scroller').hammer().off('release', '.paddedContent');
	    $('.main-content-scroller').hammer().on('release', '.paddedContent', function(){
			if(refreshing==false){
				var scrolled = parseInt($('.paddedContent').position().top);
		    	if(scrolled>=45){
					refreshing = true;
		    		$('.pulToRefreshDiv').html('<i class="fa fa-spin fa-spinner"></i> Refreshing');
		    		$('#homeScroll > *').css({"margin-top": scrolled-45});
		    		$('#homeScroll > *').animate({"margin-top": 0},100);
		    		

		    		whoami = new Object;
					whoami['storedImages'] = getStoredImages();
					//$.jStorage.set('api_key', null);
					if(!$.jStorage.get('api_key')){
						//there is no api key, no connection has ever been made to the server
						//i need to tell the server who i am
						$.jStorage.set('api_key', 'null');
						whoami['device_model'] = device.model;
						whoami['device_platform'] = device.platform;
						whoami['device_version'] = device.version;
						whoami['uuid'] = device.uuid;
						whoami['device_ptoken'] = $.jStorage.get('device_ptoken');
					}else{
						whoami['null'] = true;
					}
					
					$.ajax({
						type: 'post',
						url: apiUrl + '/app/all',
						data: whoami,
						dataType: 'json',
						headers: { 'iknow-api-key': $.jStorage.get('api_key') },
						success: function(church){
							//alert('123');
							refreshing = false;
							$.jStorage.set('api_key', church.auth.key);
							
							if(church.auth.status==false && $.jStorage.get('loggedInUser')!='null'){
								//the user has been logged out fail;
								authLogoutInit();
								return;
							}	
							if(church.status==true){
								$.jStorage.set('lastUpdated', moment());
								$.each(church.data, function(key, val){
									$.jStorage.set(key, val);
								});
							}
							$('.pulToRefreshDiv').html('<i class="fa fa-smile-o"></i> All Done');
							setTimeout(function(){
				    			linkToPage('home');
				    			if(currentPage=='home'){
									if(church.data.accountUpdates!=false){
										profileInfo(church.data.accountUpdates, false);
									}
								}
				    		},800);
						},
						error: function(church){
							alert('error 2')
							refreshing = false;
							$('.pulToRefreshDiv').html('<i class="fa fa-frown-o"></i> An Error Occured 1');
							setTimeout(function(){
				    			$('#homeScroll > *').animate({
				    				'margin-top': -45
				    			}, 200, function(){
				    				$('.pulToRefreshDiv').html('<i class="fa fa-chevron-down"></i> Pull To Refresh <i class="fa fa-chevron-down"></i>');
				    			});
				    		},800);
						}
					});


				}else{
					$('.pulToRefreshDiv').html('<i class="fa fa-chevron-down"></i> Pull To Refresh <i class="fa fa-chevron-down"></i>');
				}
			}
		});
	    $('body').hammer().off('tap', '.pullToRefreshEmulate');
	    $('body').hammer().on('tap', '.pullToRefreshEmulate', function(){
	    	//this is a copy of the pull one
	    	if(refreshing==false){
				$('.pullToRefreshEmulate').html('<i class="fa fa-spinner fa-spin"></i> Loading');
				whoami = new Object;
				whoami['storedImages'] = getStoredImages();
				refreshing = true;
				$.jStorage.set('api_key', null);
				if(!$.jStorage.get('api_key')){
					//there is no api key, no connection has ever been made to the server
					//i need to tell the server who i am
					$.jStorage.set('api_key', 'null');
					whoami['device_model'] = device.model;
					whoami['device_platform'] = device.platform;
					whoami['device_version'] = device.version;
					whoami['uuid'] = device.uuid;
					whoami['device_ptoken'] = $.jStorage.get('device_ptoken');
				}else{
					whoami['null'] = true;
				}
				//alert(JSON.stringify(whoami));
				$.ajax({
					type: 'post',
					url: apiUrl + '/app/all',
					data: whoami,
					dataType: 'json',
					headers: { 'iknow-api-key': $.jStorage.get('api_key') },
					success: function(church){
						refreshing = false;
						$.jStorage.set('api_key', church.auth.key);
						if(church.auth.status==false && $.jStorage.get('loggedInUser')!='null'){
							//the user has been logged out fail;
							authLogoutInit();
							return;
						}
						
						if(church.status==true){
							$.jStorage.set('lastUpdated', moment());
							$.each(church.data, function(key, val){
								$.jStorage.set(key, val);
							});
						}
						$('.pullToRefreshEmulate').html('Refresh Content');
						setTimeout(function(){
			    			linkToPage('home');
			    			if(currentPage=='home'){
								if(church.data.accountUpdates!=false){
									profileInfo(church.data.accountUpdates, false);
								}
							}
			    		},800);
					},
					error: function(church){
						alert('error 3');
						refreshing = false;
						$('.pullToRefreshEmulate').html('An Error Occurred 3');
						setTimeout(function(){
			    			$('.pullToRefreshEmulate').html('Refresh Content');
			    		},800);
					}
				});
			}else{
				$('.pullToRefreshEmulate').html('Refresh Content');
			}
	    });
	    $('#homeScroll').hammer().off('tap', '.subscribeOption');
	    $('#homeScroll').hammer().on('tap', '.subscribeOption', function(){
			 //open the mega login option
			 $('body').append(
			 	'<div class="subscribeBox">' + 
			 		'<h4 style="padding: 2px 10px; margin: 8px;"><i class="fa fa-comment-o"></i> Welcome to church</h5>' + 
			 		'<hr style="margin: 0px;" />' + 
			 		'<div class="subscribeTextBox"><input type="text" class="form-control canDisable" placeholder="full name" id="subscribeName"/></div>' + 
			 		'<div class="subscribeTextBox"><input type="email" class="form-control canDisable" placeholder="email" id="subscribeEmail"/></div>' +
			 		'<div class="subscribeTextBox" style="display:none;"><div style="width: 25%;">DOB: </div><div style="width: 25%;"><select class="addDays" id="dobDate"><option>DD</option></select></div><div style="width: 25%;"><select class="addMonths" id="dobMonth"><option>MM</option></select></div><div style="width: 25%;"><select class="addYears" id="dobYear"><option>YYYY</option></select></div></div>' +
			 		'<div class="subscribeTextBox" style="float:left; width:100%"><button class="btn btn-block btn-info submitReg canDisable">That\'s Me!</button></div>' +
			 		'<div style="clear:both"></div>' + 
			 	'</div>'
			 );
			 block = $('<div class="coverer registerCoverer"></div>');
			 block.css('display', 'block');
			 $('body').append(block);
			 $('.subscribeBox').css({
				 'top': 0
			 });
			 $('.coverer').css({
				'background-color': 'rgba(0,0,0,0.8)'
			 }, 200);
			 block.click(function(){
				$('.subscribeBox').animate({
					'top': -320
				}, 200, function(){
					$('.coverer').remove();
					$('.subscribeBox').remove();
					//linkToPage('home');
				});
				$('.coverer').animate({
					'background-color': 'rgba(0,0,0,0)'
				}, 200);
			 });
			 for(i=0; i<31; i++){
				 $('.addDays').append('<option>' + (i+1) + '</option>');
			 }
			 for(i=0; i<12; i++){
				 $('.addMonths').append('<option>' + (i+1) + '</option>');
			 }
			 year = moment().format('YYYY');
			 start = year-110;
			 for(i=year; i>start; i--){
				 $('.addYears').append('<option>' + i + '</option>');
			 }
	    });
	}else{
		setTimeout("build_home()", 10);
	}
}
function fillHomePage(){
		$('.startupprocess').append('Filling home page<br>');
		var homeData = $.jStorage.get('home');
		clearContent('.paddedContent');		
		$('.paddedContent').html('<div class="pulToRefreshDiv"><i class="fa fa-chevron-down"></i> Pull To Refresh <i class="fa fa-chevron-down"></i>');
		if(device.platform!='iOS'){
			$('.paddedContent').append('<button class="btn btn-success btn-block pullToRefreshEmulate" style="margin-bottom:5px;">Refresh Content</button>');
		}
		if($.jStorage.get('loggedInUser')=='null'){
			//user can login or register!!
			$('.paddedContent').append(loggedOutTemp());
		}else{
			$('.paddedContent').append('<h2 class="text-info welcome_message" style="font-weight:bold">Hi ' + $.jStorage.get('firstname') + '!</h4>');
		}
		$.each(homeData, function(key, val){
			if(val.type=='block'){
				var html = blockTemplate(val);
				addContent('.paddedContent', html);
			}else if(val.type=='votd'){
				var html = votdTemplate(val);
				addContent('.paddedContent', html);
			}else if(val.type=='blog'){
				$.jStorage.set('blog-home-' + key, val.data);
				var html = $(blogTemplate(null));
				$.each(val.data, function(i, blog){
					if($.jStorage.get('blog-home-' + key + '-read-' + blog.id)){
						blog['read'] = 'yes';
					}else{
						blog['read'] = 'no';
					}
					shortened = htmlEntities(blog.content);
					shortened = shortened.substr(0, 50);
					blog['shortened'] = shortened;
					blog['actionClass'] = 'viewBlog'
					blog['blogId'] = key;
					blog['blogType'] = 'home';
					var bloghtml = invBlogTemplate(blog);
					html.append(bloghtml);
				});
				j = new Object;
				j['style'] = val.style;
				j['title'] = val.title;
				var container = $(blockContTemplate(j));
				container.append(html);
				addContent('.paddedContent', container);
			}else if(val.type=='scroller'){
				var width = $('body').width()-10;
				var container = $('<div class="scrollerSlider" style="height:' + width + 'px; width:' + width + 'px"></div>');
				var count = 0;
				$.each(val.data, function(k, v){
					var imageSrc = supplyImage(v.image);
					if(v.item_link!=null && v.item_link.length>0){
						var img = '<a href="' + v.item_link + '"><img src="' + imageSrc + '" style="height:' + width + 'px; width:' + width + 'px""></a>';	
					}else{
						var img = '<img src="' + imageSrc + '" style="height:' + width + 'px; width:' + width + 'px"" />';
					}
					count++;
					container.append(img);
				});
				if(count>0){
					addContent('.paddedContent', container);
				}
			}else if(val.type=='event'){
				imageSrc = supplyImage(val.data.image);
				image = $('<img src="' + imageSrc + '" class="dashticket_block" data-eventhost="dashboard" data-churchid="' + val.data.church_id + '" data-eventid="' + val.data.event_id + '" data-eventname="' + val.data.event_name + '"/>');
				addContent('.paddedContent', image);
			}else if(val.type=='link'){
				var calc_width = parseInt($('body').width())-20;
				var calc_height = calc_width/parseFloat(val.data.height);
				imageSrc = supplyImage(val.data.image);
				image = $('<span class="leaveapplink" data-href="' + val.data.url + '"><img src="' + imageSrc + '" class="dash_image" style="height:' + calc_height + 'px"/></span>');
				addContent('.paddedContent', image);
			}else if(val.type=='giving'){
				imageSrc = supplyImage(val.data.image);
				image = $('<img src="' + imageSrc + '" class="dash_image givingLink" data-campaignid="' + val.data.campaign_id + '" />');
				addContent('.paddedContent', image);
			}
			$('.scrollerSlider').slidesjs({
				height: $('body').width()-10,
				width: $('body').width()-10,
			    navigation: {
			    	active: false
			    },
				pagination: {
					active: false
				},
				play: {
					active: false,
					effect: "slide",
					interval: 5000,
					auto: true,
					swap: false,
					pauseOnHover: false,
					restartDelay: 2500
				}
			});
		});	
	//	addContent('.paddedContent', '<button class="btn pullToRefreshEmulate btn-block btn-info">Refresh Content</button>');
}

function buildStream(sid){
	$('#podcastListCont').html('<div class="podcastPlayerFiller"></div>');
	$('#podcastListCont').append('<h5 style="color:#fff">just a sec...</h5>');
	setTimeout(function(){
		var width = $(window).width();
		var square = width/3;
		$.each($.jStorage.get('mediastreams'), function(k, v){
			if(v.stream_id==sid){
				$.each(v.series, function(series, seriesdata){
					image1 = $('<div class="seriesImageLoose looseSeries' + series + '" style="background-image:url(' + supplyImage(seriesdata.image) + ')" data-series="' + seriesdata.series_id + '" data-array="' + series + '" data-stream="' + sid + '"></div>');
					$('#podcastListCont').append(image1);
					image1.css({
						'width': square,
						'height': square
					});
				});
				addContent('#podcastListCont', '<div class="scrollerPadd" style="height: 0px;"></div>');
				$('#podcastListCont').find('h5').remove();
			}
		});
	}, 600);
		
}
function tmp_page_home(){
	var tmp = [
		'<div class="main-content-scroller" id="homeScroll">' + 
			'<div class="paddedContent">' +	
				'<div class="appmod appmod-default">' +
					'<div class="appmod-heading">' +
						'<h3 class="appmod-title"><i class="fa fa-spin fa-spinner"></i> Loading Initial Content!</h3>' +
					'</div>' +
					'<div class="appmod-body">' +
						'<div class="startupprocess">Initialising themes<br></div>' +
						'Initial Load Finished. <br>Tap the home button.' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}




function build_map(){
	//set the map preferences
	addTitle('Live Map');
	if(livemap!=null){
		livemap.remove();
		livemap = null;
	}
		livemap = L.map('livemap');
	var cloudmadeUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
		subDomains = ['otile1','otile2','otile3','otile4'],
		cloudmadeAttrib = 'iKnow Church';
	var cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttrib, subdomains: subDomains});
		meLayer = 	new L.layerGroup();
		mymarker = L.marker([lat, lng], {icon: redIcon}).addTo(meLayer);
		livemap.setView(new L.LatLng(lat, lng), 14).addLayer(cloudmade);
		livemap.addLayer(meLayer);
	var prefs = $.jStorage.get('appPref');
		mapPref = prefs['map'];
	$.each(mapPref, function(key, val){
		if(val==1){
			$('.' + key).removeClass('off');
			$('.' + key).addClass('on');
			$('.' + key).find('i').addClass('fa-check-square-o');
			$('.' + key).find('i').removeClass('fa-square-o');
		}else{
			$('.' + key).removeClass('on');
			$('.' + key).addClass('off');
			$('.' + key).find('i').addClass('fa-square-o');
			$('.' + key).find('i').removeClass('fa-check-square-o');
		}
	});
	$('.myTagText').val(mapPref['my_tag']);
	len = $('.myTagText').val().length;
	left = 140-len;
	$('.textCounter').html(left);
	$('.showMeTo').hammer().off('tap', '.showMeOption');
	$('.showMeTo').hammer().on('tap', '.showMeOption', function(){
		if($(this).hasClass('on')){
			updatePref('map', $(this).attr('data-pref'), 0);
			$(this).removeClass('on');
			$(this).addClass('off');
			$(this).find('i').addClass('fa-square-o');
			$(this).find('i').removeClass('fa-check-square-o');
		}else{
			updatePref('map', $(this).attr('data-pref'), 1);
			$(this).removeClass('off');
			$(this).addClass('on');
			$(this).find('i').addClass('fa-check-square-o');
			$(this).find('i').removeClass('fa-square-o');
		}
	});
	$('#main-content').hammer().off('tap', '.showme_pref_btn');
	$('#main-content').hammer().on('tap', '.showme_pref_btn', function(){
		if($('.showMeTo').hasClass('closed')){
			$('.showMeTo').removeClass('closed');
			$('.showMeTo').fadeIn(100);
		}else{
			$('.showMeTo').addClass('closed');
			$('.showMeTo').fadeOut(100);
			$('.myTag').addClass('closed');
			$('.myTag').fadeOut(100);
			sendLoc('true');
		}
	});
	$('#main-content').hammer().off('tap', '.showme_tag_btn');
	$('#main-content').hammer().on('tap', '.showme_tag_btn', function(){
		if($('.myTag').hasClass('closed')){
			$('.myTag').removeClass('closed');
			$('.myTag').fadeIn(100);
		}else{
			var myTag = $('.myTagText').val();
			updatePref('map', 'my_tag', myTag);
			$('.myTag').addClass('closed');
			$('.myTag').fadeOut(100);
			$('.showMeTo').addClass('closed');
			$('.showMeTo').fadeOut(100);
			//send the mega settings
			sendLoc('true')
		}
	});
	$('#main-content').hammer().off('tap', '.showme_refresh_btn');
	$('#main-content').hammer().on('tap', '.showme_refresh_btn', function(){
		$(this).find('i').addClass('fa-spin');
		sendLoc('true');
	});
	$('#main-content').on('keyup', '.myTagText', function(){
		len = $(this).val().length;
		left = 140-len;
		$('.textCounter').html(left);
	});
	populateMap();
	sendLoc('true');
}
function tmp_page_map(){
	var tmp = [
		'<div style="box-sizing: border-box; padding: 6px; position:relative; z-index:10; width: 33%;float:left"><button class="btn btn-info paddedBtn btn-block showme_pref_btn">Who?</button></div>' + 
		'<div style="box-sizing: border-box; padding: 6px; position:relative; z-index:10; width: 33%;float:left"><button class="btn btn-info paddedBtn btn-block showme_tag_btn">My Tag</button></div>' + 
		'<div style="box-sizing: border-box; padding: 6px; position:relative; z-index:10; width: 33%;float:left"><button class="btn btn-info paddedBtn btn-block showme_refresh_btn"><i class="fa fa-spin fa-refresh"></i></button></div>' + 
		'<div class="showMeTo scroller-container closed">' +
			'<div>' +
				'<div style="padding: 10px 10px 2px 10px;"><div class="alert alert-info" style="padding: 3px; margin-bottom: 2px;">Choose who you want to share your location with</div></div>' +
				'<div class="showMeOption showme_teams" data-pref="showme_teams"><div class="showMeIcon"><i class="fa checkpref"></i></div><div class="showMeTitle">My Teams</div></div>' + 
				'<div class="showMeOption showme_groups" data-pref="showme_groups"><div class="showMeIcon"><i class="fa checkpref"></i></div><div class="showMeTitle">My Groups</div></div>' +
				'<div class="showMeOption showme_church" data-pref="showme_church"><div class="showMeIcon"><i class="fa checkpref"></i></div><div class="showMeTitle">Whole Church</div></div>' +  
				'<div class="showMetest"><button class="btn btn-success btn-block showme_pref_btn savealso">Close</button></div>' +  
			'</div>' +
		'</div>' +
		'<div class="myTag scroller-container closed">' +
			'<div>' +
				'<div style="margin:10px;"><textarea class="form-control myTagText" style="height: 140px;" maxlength="140"></textarea></div>' +  
				'<div class="textCounter">140</div>' +  
				'<div class="showMetest"><button class="btn btn-success btn-block showme_tag_btn savealso">Close</button></div>' +  
			'</div>' +
		'</div>' +
		'<div class="mapContainer">' +
			'<div id="livemap"></div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function build_live(){
	addTitle('EC* Live');
}
function build_give(){
	addTitle('Give');
	$.ajax({
		url: apiUrl + '/finance/giving_ids',
		dataType: 'json',
		type: 'GET',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(gids){
			$('.newPayment').html('Make A Donation');
			$('.newPayment').removeAttr('disabled');
			if(gids.data.length>0){
				var html = [
					'<ul class="list-group">',
						'<li class="list-group-item">',
							'<strong>My Giving ID(s)</strong>',
						'</li>'];
						$.each(gids.data, function(i, gid){
							if(gid.tax_payer=='yes'){
								html.push('<li class="list-group-item">' + gid.giving_id + ' (GA)</li>');
							}else{
								html.push('<li class="list-group-item">' + gid.giving_id + ' (NGA)</li>');
							}
						});
				html.push('</ul>');
				html = html.join(" ");
				$('.showMyGids').html(html);
			}
		},
		error: function(){
			$('.newPayment').html('Unavailable');
			navigator.notification.alert('It looks like there was a problem with your request.', false, 'There was a problem', 'Ok');
		}
	});

	$('.main-content-scroller').hammer().off('tap', '.newPayment');
	$('.main-content-scroller').hammer().on('tap', '.newPayment', function(){
		buildDonationCreation();
	});
}
function buildDonationCreation(){
	/*	$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
		$('.disabledCover').css('display', 'block');
		$('.disabledCover').animate({
			'opacity': 0.8
		},200);
		$('body').append('<div class="fullScreenOverlay paddedContent main-content-scroller newDonationOverlay"></div>');
		$('.newDonationOverlay').append('<div class="newDonationContent"></div>');
	*/
		var html = 	
				'<h4 class="text-info">New Donation</h4>' + 
				'<div>' + 
					'<div class="input-group">'+
						'<span class="input-group-addon">&pound;</span>'+
						'<input type="text" class="form-control donationPart donation-amount" data-field="amount" value="10.00">'+
					'</div>'+
				'</div>' +
				'<div style="margin-top: 15px;">' +
					'<h5 class="text-muted">Campaign</h5>' + 
					'<div style="display:block;">' + 
						'<select class="form-control campaigndrop donationPart changeSummary" data-field="campaign_id"><option value="0">No Preference</option></select>' +
					'</div>' +
				'</div>' +
				'<div class="alert alert-warning donationSummary" style="margin-top: 15px;">You are making <span class="sum-occs">a</span> <span class="sum-type">single</span> <span class="sum-plural">donation</span> of &pound;<span class="sum-amount">10.00</span><span class="sum-camp"></span>.</div>' + 
				'<div style="margin-top: 15px;">' +
					'<h5 class="text-muted">Can you Gift Aid?</h5>' + 
					'<div class="btn-group buttonradio donationPartHtml" style="display:block;" data-value="0" data-field="giftaid">' +
						'<button type="button" class="btn btn-info" style="width:50%" data-value="1">Yes</button>' +
						'<button type="button" class="btn btn-info active" style="width:50%" data-value="0">No</button>' +
					'</div>' +
					'<div style="clear:both"></div>' + 
				'</div>' +
				'<div style="margin-top: 15px;">' + 
					'<p style="font-size: 5pt; line-height:7pt; font-style:italic; color: #A4A4A4">' +
						'If you are a UK tax payer we are able to claim Gift Aid on your behalf. This means that we receive 25p from the government for every &pound;1 you give.<br>You must make sure that the total Gift Aid that is claimed on your behalf is less than or equal to the total income tax you pay.' +
					'</p>' +
				'</div>' +
				'<div style="margin-top: 15px;">' + 
					'<button class="btn btn-block btn-success submitDonation">Donate</button>' +
				'</div>';
	$('#givecontent').addClass('paddedContent');
	$('#givecontent').html(html);
	campaigns = $.jStorage.get('campaigns');
	$.each(campaigns, function(a, b){
		$('.campaigndrop').append('<option value="' + b.campaign_id + '">' + b.campaign_name + '</option>');
	});
	$('.newDonationContent').hammer().off('tap', '.changeSummary');
	$('.newDonationContent').hammer().on('tap', '.changeSummary', function(){
		if($(this).hasClass('changeType')){
			if($(this).attr('data-value')=='single'){
				$('#showRepeatOpts').animate({
					'height': '0px',
					'margin-top': '0px'
				}, 200);
				$('.sum-occs').html('a');
				$('.sum-type').html('single');
				$('.sum-plural').html('donation');
			}else{
				$('#showRepeatOpts').animate({
					'height': '160px',
					'margin-top': '15px'
				}, 200);
				if($('.occurences_number').val().length==0){
					$('.sum-occs').html("ongoing " + $('#period').attr('data-value'));
				}else{
					$('.sum-occs').html($('.occurences_number').val() + " " + $('#period').attr('data-value'));
				}
				$('.sum-type').html('');
				$('.sum-plural').html('donations');
			}
		}else if($(this).hasClass('changePeriod')){
			if($('.occurences_number').val().length==0){
				$('.sum-occs').html($(this).attr('data-value'));
			}else{
				$('.sum-occs').html($('.occurences_number').val() + " " + $(this).attr('data-value'));
			}
		}
	});
	$('.changeSummary').unbind('keyup');
	$('.changeSummary').on('keyup', function(){
		if($(this).hasClass('occurences_number')){
			if($('.occurences_number').val().length==0){
				$('.sum-occs').html($('#period').attr('data-value'));
			}else{
				$('.sum-occs').html($(this).val() + " " + $('#period').attr('data-value'));
			}
		}
	});
	$('.changeSummary').unbind('change');
	$('.changeSummary').on('change', function(){
		if($(this).hasClass('campaigndrop')){
			if($(this).val()=='0'){
				$('.sum-camp').html('');
			}else{
				$('.sum-camp').html(' to ' + $('.campaigndrop option:selected').text());
			}
		}
	});
	$('.donation-amount').unbind('blur');
	$('.donation-amount').blur(function(){
		amount = numeral($(this).val()).format('0.00')
		$(this).val(amount);
		$('.sum-amount').html(amount);
	});
	$('#givecontent').hammer().on('tap', '.cancelDonation', function(){
		linkToPage('give');
	});
	$('#givecontent').hammer().on('tap', '.submitDonation', function(){
		var load = new Object;
		$('.donationPartHtml').each(function(){
			load[$(this).attr('data-field')] = $(this).attr('data-value');
		});
		$('.donationPart').each(function(){
			load[$(this).attr('data-field')] = $(this).val();
		});
		$('body').append('<div class="disabledCover wait" style="line-height: ' + $(window).height() + 'px; z-index: 6000;"><i class="fa fa-spin fa-spinner"></i></div>');
		$('.wait').css('display', 'block');
		$('.wait').css({
			'background-color': 'rgba(0,0,0,0.8)'
		},200);
		
		//my my gids and put them in
		var my = $.jStorage.get('my');
		var ids = my['giving_ids'];
		if(ids!=null && typeof ids != 'null'){
			if(ids.length>1){
				var gids = new Array;
				$.each(ids, function(a, b){
					gids.push(b.giving_id);
				});
				gids.push('Cancel');
				buttonList = gids.join(',');
				navigator.notification.confirm(
			        'Please select a giving ID.',
			        function(btn){
			        	if(btn==(gids.length)){
							$('.wait').animate({
								'background-color': 'rgba(0,0,0,0)'
							},200, function(){
								$('.wait').remove();
							});
			        	}else{
			        		load['giving_id'] = gids[btn-1];
		        			submitDonation(load);
			        	}
			        },
			        'Which giving ID?',
			        buttonList
			    );
			}else if(ids.length==1){
				load['giving_id'] = ids[0]['giving_id'];
				submitDonation(load);
			}else{
				load['giving_id'] = null;
				submitDonation(load);
			}
		}else{
			load['giving_id'] = null;
			submitDonation(load);
		}
	});
}
function submitDonation(load){
	$.ajax({
		url: apiUrl + '/finance/donations',
		dataType: 'json',
		type: 'POST',
		data: load,
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(data){
			$('.wait').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.wait').remove();
			});
			//this is the form for the donation payment
			var html = new Array;
			$('#givecontent').html('');
			html.push('<div class="indentedOption"><h4 class="text-info">Card Details</h4></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>First Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required input-billing formduplicate" value="' + removeNullVal(data.names.ppl_fname) + '" data-dupe="fname" data-field="card_fname" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Last Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required input-billing formduplicate" value="' + removeNullVal(data.names.ppl_sname) + '" data-dupe="sname" data-field="card_sname" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Card Number <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required input-billing" data-field="card_number" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Start Month</small></h5></div>');
			html.push('<div class="indentedOption"><input type="tel" class="form-control input-billing" style="width:40%; float:left;" placeholder="MM" maxlength="2" data-field="card_start_m" /> <input type="tel" class="form-control input-billing" data-field="card_start_y" style="width:40%; margin-left:10px; float:left;" placeholder="YY" maxlength="2" /><div style="clear:both"></div></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Expiry Month <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="tel" class="form-control required input-billing" style="width:40%; float:left;" placeholder="MM" maxlength="2" data-field="card_expiry_m" /> <input type="tel" data-field="card_expiry_y" class="form-control required input-billing" style="width:40%; margin-left:10px; float:left;" placeholder="YY" maxlength="2" /><div style="clear:both"></div></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Issue Number</small></h5></div>');
			html.push('<div class="indentedOption"><input type="tel" class="form-control input-billing" style="width:30%" maxlength="2" data-field="card_issue" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>CVV Number <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="tel" class="form-control required input-billing" style="width:50%" maxlength="3" data-field="card_cvv" /></div>');
			html.push('<div class="indentedOption"><h4 class="text-info">Billing Address</h4></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 1 <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required input-billing formduplicate" value="' + removeNullVal(data.addresses.home.hh_line1) + '" data-dupe="address1" data-field="card_line1" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 2</small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control input-billing" value="' + removeNullVal(data.addresses.home.hh_line2) + '" data-field="card_line2" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 3</small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control input-billing" value="' + removeNullVal(data.addresses.home.hh_line3) + '" data-field="card_line3" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>City</small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control input-billing" value="' + removeNullVal(data.addresses.home.hh_town) + '" data-field="card_city" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>County</small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control input-billing" value="' + removeNullVal(data.addresses.home.hh_county) + '" data-field="card_county" /></div>');
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Postcode <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required input-billing formduplicate" value="' + removeNullVal(data.addresses.home.hh_postcode) + '" data-dupe="addresspostcode" data-field="card_postcode" /></div>');
			if(load.giftaid=="1"){
				html.push('<div class="indentedOption"><h4 class="text-info">Gift Aid Details</h4></div>');
				html.push('<div class="indentedOption"><h5 class="text-muted"><small>First Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
				html.push('<div class="indentedOption"><input type="text" class="form-control required input-ga formduplicate" value="' + removeNullVal(data.names.ppl_fname) + '" data-dupe="fname" data-field="fore_name" /></div>');
				html.push('<div class="indentedOption"><h5 class="text-muted"><small>Last Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
				html.push('<div class="indentedOption"><input type="text" class="form-control required input-ga formduplicate" value="' + removeNullVal(data.names.ppl_sname) + '" data-dupe="sname" data-field="sur_sname" /></div>');
				html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address (first line only) <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
				html.push('<div class="indentedOption"><input type="text" class="form-control required input-ga formduplicate" value="' + removeNullVal(data.addresses.giving.address_number) + '" data-dupe="address1" data-field="address_number" /></div>');
				html.push('<div class="indentedOption"><h5 class="text-muted"><small>Postcode <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
				html.push('<div class="indentedOption"><input type="text" class="form-control required input-ga formduplicate" value="' + removeNullVal(data.addresses.giving.address_postcode) + '" data-dupe="addresspostcode" data-field="address_postcode" /></div>');
			}
			html.push('<div class="indentedOption"><h5 class="text-muted"><small>Email <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
			html.push('<div class="indentedOption"><input type="text" class="form-control required  input-ga" value="' + removeNullVal(data.email) + '" data-field="email" /></div>');
			html.push('<div class="indentedOption" style="margin-top: 10px; margin-bottom:10px"><button class="btn btn-info btn-block completeDonation">Complete</button></div>');
			html.push('<div class="indentedOption" style="margin-top: 10px; margin-bottom:10px"><button class="btn btn-danger btn-block cancelDonation">Cancel</button></div>');
			html.push('<input type="hidden" class="input-billing" data-field="invoice" value="' + data.invoice + '" />');
			html.push('<input type="hidden" class="input-billing" data-field="system_id" value="' + data.system_id + '" />');
			html.push('<input type="hidden" class="input-billing" data-field="available_date" value="" />');
			html.push('<input type="hidden" class="input-billing" data-field="amount" value="' + load.amount + '" />');
			html.push('<input type="hidden" class="input-billing" data-field="desc" value="iKnow App Giving" />');
			html.push('<input type="hidden" class="input-billing" data-field="url" value="' + apiUrl + '/finance/donations/ipn" />');
			html.push('<input type="hidden" class="input-billing" data-field="account_id" value="' + data.passport_id + '" />');
			html = html.join(" ");
			transaction_passid = data.passport_id;
			transaction_invoice = data.invoice;
			transaction_type = "donation";
			$('.main-content-scroller').scrollTop(0);
			$('#givecontent').html(html);

			$('.formduplicate').unbind('blur');
			$('.formduplicate').bind('blur', function(){
				var value = $(this).val();
				var field = $(this).attr('data-dupe');
				$('.formduplicate[data-dupe="' + field + '"]').each(function(){
					if($(this).val()=='' || $(this).val().length==0){
						$(this).val(value);
					}
				});
			});
			$('#givecontent').hammer().off('tap', '.completeDonation');
			$('#givecontent').hammer().on('tap', '.completeDonation', function(){
				tmp = $(this);
				$(this).html('<i class="fa fa-spinner fa-spin"></i>');
				$(this).attr('disabled', 'disabled');
				var er = 0;
				$('#givecontent .required').each(function(){
					$(this).removeClass('failed');
					if($(this).val().length==0 || $(this).val()==''){
						er++;
						$(this).addClass('failed');
					}
				});
				if(er==0){
					$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px; z-index:10001"><i class="fa fa-spin fa-spinner"></i></div>');
					$('.disabledCover').css('display', 'block');
					$('.disabledCover').css({
						'background-color': 'rgba(0,0,0,0.8)'
					},200);
					//sending the requests
					//first update the 
					var iknow = new Object;
					$('.input-ga').each(function(){
						iknow[$(this).attr('data-field')] = $(this).val();
					});
					iknow['invoice'] = data.invoice;
					var billing = new Object;
					$('.input-billing').each(function(){
						billing[$(this).attr('data-field')] = $(this).val();
					});
					$.ajax({
						url: apiUrl + '/finance/details',
						dataType: 'json',
						type: 'PUT',
						data: iknow,
						headers: { 'iknow-api-key': $.jStorage.get('api_key') },
						success: function(data){
							if(data.status==true){
								$.ajax({
									url: 'https://api.divinepassport.com/1/pay',
									dataType: 'json',
									type: 'POST',
									data: billing,
									headers: { 'iknow-api-key': $.jStorage.get('api_key') },
									success: function(data){
										if(data.status=='error'){
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 101. \r\nWe couldn't connect you to our payment service.", removeDisabledCover, 'There was a problem', 'Try Again');
								    	}else if(data.status==false || data.status=='false' || data.status=="false"){
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 102.\t\n" + data.msg, removeDisabledCover, 'There was a problem', 'Try Again');
								    	}else if(data.status=='redirect'){
								    		$('.main-content-scroller').scrollTop(0);
								    		$('.disabledCover').animate({
												'background-color': 'rgba(0,0,0,0)'
											},200, function(){
												$('.disabledCover').remove();
											});
								    		$('#givecontent').html('');
								    		$('#givecontent').removeClass('paddedContent');
								    		var html = new Array;
								    		html.push('<form method="post" target="3dsecureframe" id="3dsecureform" action="' + data.url + '"></form>');
											html.push('<iframe id="3dsecureframe" class="secureframe" scrolling="no" name="3dsecureframe" style="border: none; width:370px; overflow: hidden;" frameborder="0"></iframe>');
								    		html = html.join(" ");
											$('#givecontent').html(html);
											$.each(data.data, function(key, val){
								    			$('#3dsecureform').append('<input type="hidden" name="' + key + '" value="' + val + '" />');
								    		});
											//assume the width of the 3d secure page 370px
											var scale = (Math.floor(($(window).width()/370)*100))/100;
											if(scale<1){
												$('.secureframe').css({
													'-webkit-transform': 'scale(' + scale + ', ' + scale + ')', 
													'transform': 'scale(' + scale + ', ' + scale + ')', 
													'-webkit-transform-origin': 'top left',
													'transform-origin': 'top left'
												});
												$('#givecontent').css('overflow', 'hidden');
											}
											$('#3dsecureform').submit();
											check3dSecureStatus();
								    	}else if(data.status==true || data.status=='true' || data.status=="true"){
											html = donationThankYou();
											$('.disabledCover').animate({
												'background-color': 'rgba(0,0,0,0)'
											},200, function(){
												$('.disabledCover').remove();
											});
											linkToPage('give');
											$('.donationthankyou').html(html);
								    	}else{
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 105.\r\nThere was a problem with the payment request. \r\n Status: " + data.status, removeDisabledCover, 'There was a problem', 'Try Again');
								    	}
									},
									error: function(data){
								    	navigator.notification.vibrate(100);
								    	navigator.notification.alert("Error 106.\r\nWe couldn't connect you to our payment service.", removeDisabledCover, 'There was a problem', 'Try Again');
								    	tmp.html('Complete');
										tmp.removeAttr('disabled');
								    }
								});
							}else{
								tmp.html('An error occured 2');
								tmp.removeAttr('disabled');
								$('input').removeAttr('readonly');
							}
						}
					});

				}else{
					$(this).html('Some errors occured');
					setTimeout(function(){
						tmp.html('Complete');
						tmp.removeAttr('disabled');
					}, 1500);
				}
			});



		},
		error: function(){
			$('.wait').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.wait').remove();
			});
			navigator.notification.alert('It looks like there was a problem with your request.', false, 'There was a problem', 'Ok');
		}
	});
}



function tmp_page_give(){
	var tmp = [
		'<div class="main-content-scroller">' + 
			'<div id="givecontent">' +
				'<div class="paddedContent"><button class="btn btn-block btn-info newPayment" disabled="disabled"><i class="fa fa-spin fa-spinner"></i></button></div>' +
				'<div class="paddedContent"><hr style="margin:10px;" /></div>' +
				'<div class="donationthankyou paddedContent"></div>' + 
				'<div class="showMyGids paddedContent"></div>' + 
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function build_featured(){
	addTitle('Featured');
	var featData = $.jStorage.get('featured');
	addContent('.paddedContent');		
	$.each(featData, function(key, val){
		if(val.type=='block'){
			var html = blockTemplate(val);
			addContent('.paddedContent', html);
		}else if(val.type=='votd'){
			var html = votdTemplate(val);
			addContent('.paddedContent', html);
		}else if(val.type=='blog'){
			$.jStorage.set('blog-featured-' + key, val.data);
			var html = $(blogTemplate(null));
			$.each(val.data, function(i, blog){
				if($.jStorage.get('blog-featured-' + key + '-read-' + blog.id)){
					blog['read'] = 'yes';
				}else{
					blog['read'] = 'no';
				}
				shortened = htmlEntities(blog.content);
				shortened = shortened.substr(0, 50);
				blog['shortened'] = shortened;
				blog['actionClass'] = 'viewBlog'
				blog['blogId'] = key;
				blog['blogType'] = 'featured';
				var bloghtml = invBlogTemplate(blog);
				html.append(bloghtml);
			});
			j = new Object;
			j['style'] = val.style;
			j['title'] = val.title;
			var container = $(blockContTemplate(j));
			container.append(html);
			addContent('.paddedContent', container);
		}else if(val.type=='scroller'){
			var container = $('<div class="scrollerSlider"></div>');
			$.each(val.data, function(k, v){
				var imageSrc = supplyImage(v.image);
				var img = '<img src="' + imageSrc + '" />';
				container.append(img);
			});
			addContent('.paddedContent', container);
		}else if(val.type=='event'){
			imageSrc = supplyImage(val.data.image);
			image = $('<img src="' + imageSrc + '" class="dashticket_block" data-eventhost="dashboard" data-churchid="' + val.data.church_id + '" data-eventid="' + val.data.event_id + '" data-eventname="' + val.data.event_name + '"/>');
			addContent('.paddedContent', image);
		}else if(val.type=='link'){
			imageSrc = supplyImage(val.data.image);
			image = $('<span class="leaveapplink" data-href="' + val.data.url + '"><img src="' + imageSrc + '" class="dash_image" /></span>');
			addContent('.paddedContent', image);
		}else if(val.type=='giving'){
			imageSrc = supplyImage(val.data.image);
			image = $('<img src="' + imageSrc + '" class="dash_image givingLink" data-campaignid="' + val.data.campaign_id + '" />');
			addContent('.paddedContent', image);
		}
		$('.scrollerSlider').slidesjs({
		    navigation: {
		    	active: false
		    },
			pagination: {
				active: false
			},
			play: {
				active: false,
				effect: "slide",
				interval: 5000,
				auto: true,
				swap: false,
				pauseOnHover: false,
				restartDelay: 2500
			}
		});
	});	
	addContent('.paddedContent', '<div class="scrollerPadd"></div>');

}
function build_podcasts(){
	addTitle('Podcasts');
	$('#podcastScroll').css('background-color', 'white');
	$('.podcastPlayer').css('display', 'block');
	//add the player
	$('#podcastListCont').html('<div class="podcastPlayerFiller"></div>');
	$('#podcastListCont').append('<h5 class="waitingText" style="color:#000">just a sec...</h5>');
	setTimeout(function(){
		podcastUpdateTime = setTimeout("updatePlayerSlider()", 100);
		var podcasts = $.jStorage.get('mediastreams');
		i = 0;
		console.log(podcasts);
		$.each(podcasts, function(key, val){
			if(i==0){
				firstCast = key;
			}
			i++;
		});
		if(i==0){
			$('#podcastListCont').html('<div class="nts">there are no podcast streams available</div>');
			$('.waitingText').remove();
		}else if(i==1){
			$('#podcastScroll').css('background-color', 'black');
			buildStream(firstCast);
			$('.waitingText').remove();
		}else{
			
			$.each(podcasts, function(key, val){
				i = 0;
				$.each(val.series, function(k, v){
				//	if(i==0){
				//		img = supplyImage(v.image);
				//	}
					i++;
				});
				context = new Object;
				context['image'] = supplyImage(val.image)
				context['sid'] = key;
				context['series_title'] = val.stream_title;
				context['date_range'] = val.stream_subtitle;
				context['count'] = '4';
				var html = podcastStreamTemplate(context);
				$('#podcastListCont').append(html);
				$('.waitingText').remove();
			});
		}
	}, 600);
}
function tmp_page_podcasts(){
	var tmp = [
		'<div class="main-content-scroller" id="podcastScroll"><div id="podcastListCont"><div class="list-group"></div></div></div>' 
	];
	return tmp.join(" ");
}
function build_tickets(){
	addTitle('Buy Tickets');	
	var width = $('body').width();
	$('#showTicketsHere').hammer().on('tap', '.eventOption', function(){
		currentPage = 'tickets';
		linkObj = $(this);
		$('#showTicketsHere').width(width);
		$('#showTicketsHere').animate({
			marginLeft: '-' + width + 'px'
		}, 200, function(){
			$('.main-content-scroller').scrollTop(0);
			$('#showTicketsHere').html('<div class="loadingHolder"><i class="fa fa-spin fa-spinner"></i></div>');
			$('#showTicketsHere').css({
				marginLeft: '0px'
			});
			showTicketInfo(linkObj);
			console.log('ting')
		});
	});
	tickets = $.jStorage.get('ticketing');
	$('#showTicketsHere').html('<div class="list-header-separator">Our Events</div>');
	if(tickets.local.length==0){
		$('#showTicketsHere').append('<div class="nts">no events to buy tickets for!</div>');
	}else{
		$('#showTicketsHere').append('<div class="rowOptionSingleCont" id="localEvents"></div>');
		$.each(tickets.local, function(i, event){
			eventStart = moment(event.start_date, "YYYY-MM-DD HH:mm:ss");
			rightNow = new moment();
			diff = eventStart.diff(rightNow, 'days');
			var html = $('<div class="rowOptionSingle eventOption" data-eventhost="local" data-eventid="' + event.id + '"><div style="width: 30px; font-size: 16pt;"><i class="fa fa-ticket"></i></div><div class="eventOptionTitle"><p>' + event.name + '</p><p class="listSubHead">' + eventStart.format('MMMM Do YYYY, h:mma') + '</p></div><div class="eventOptionDays"><p class="days">' + diff + '</p><p class="dlabel">days</p></div></div>');
			$('#localEvents').append(html);
		});
	}
	fe = 0;
	$.each(tickets.foreign, function(eventchurchid, churchevents){
		//each of these is a church
		if(fe==0){
			$('#showTicketsHere').append('<div class="list-header-separator">Other Events</div>');
		}
		$('#showTicketsHere').append('<div class="rowOptionSingleCont" id="foreignEvents"></div>');
		$.each(churchevents, function(i, event){
			eventStart = moment(event.start_date, "YYYY-MM-DD HH:mm:ss");
			rightNow = new moment();
			diff = eventStart.diff(rightNow, 'days');
			var html = $('<div class="rowOptionSingle eventOption" data-eventhost="' + eventchurchid + '"  data-eventid="' + event.id + '"><div style="width: 30px; font-size: 16pt;"><i class="fa fa-ticket"></i></div><div class="eventOptionTitle"><p>' + event.name + '</p><p class="listSubHead">' + eventStart.format('MMMM Do YYYY, h:mma') + '</p></div><div class="eventOptionDays"><p class="days">' + diff + '</p><p class="dlabel">days</p></div></div>');
			$('#foreignEvents').append(html);
			fe++;
		});
	});
}
function tmp_page_tickets(){
	var tmp = [
		'<div class="main-content-scroller">' +
			'<div id="showTicketsHere"></div>' +  
		'</div>'
	];
	return tmp.join(" ");
}
function showTicketInfo(linkObj){
	$('body').prepend('<div class="infoBarDrop"><h4>Total: <span class="ticketBasketTotalTopShow"></span></h4></div>');
	var id = linkObj.attr('data-eventid');
	var host = linkObj.attr('data-eventhost');
	var source_church = globJson.init.church_id;
	if(host=='local'){
		var name = $.jStorage.get('ticketing')['local'][id].name;
		var ticketurl = apiUrl;
	}else if(host=='dashboard'){
		var eventchurchid = linkObj.attr('data-churchid');
		var name = linkObj.attr('data-eventname');
		ticketurl = 'https://iknowapi.divinepassport.com/1/' + eventchurchid;
	}else{
		var eventchurchid = linkObj.attr('data-eventhost');
		var name = $.jStorage.get('ticketing')['foreign'][eventchurchid][id].name;
		ticketurl = 'https://iknowapi.divinepassport.com/1/' + eventchurchid;
	}
	addTitle(name);
	$.ajax({
		url: ticketurl + '/ticketing/' + id,
		dataType: 'json',
		type: 'GET',
		success: function(event){
			var h = $('<div style="margin: 10px;"></div>');
			ev = new Object;
			ev['style'] = 'primary';
			ev['title'] = 'About';
			ev['data'] = event.event.description;
			var html = blockTemplate(ev);
			eventAvailableDate = event.event.available_date;
			h.append(html);
		/*	if(!$.jStorage.get('calendarAddButton' + id)){
				var button = $('<button class="btn btn-danger btn-block" style="margin-bottom: 15px;"><i class="fa fa-calendar"></i> Add To Calendar </button>');
				button.click(function(){
					button.html('<i class="fa fa-spin fa-spinner"></i>');
					var s_date = moment(event.event.start_date, "YYYY-MM-DD HH:mm:ss").format("MMMM D, YYYY HH:mm:ss");
					var e_date = moment(event.event.end_date, "YYYY-MM-DD HH:mm:ss").format("MMMM D, YYYY HH:mm:ss");
					var startDate = new Date(s_date);
					var endDate = new Date(e_date);
					var title = event.event.name;
					var location = event.venue.name;
					var notes = event.event.description;
					var success = function(message) { 
							button.unbind('all');
							button.wrap( "<div class='buttonWrapper'></div>" );
							$('.buttonWrapper').each(function(){
								$(this).css('height', $('.buttonWrapper').height()+15);
							});
							$.jStorage.set('calendarAddButton' + id, 'set');
							setTimeout(function(){
								button.fadeOut('slow', function(){
									$('.buttonWrapper').animate({
										'height' : 0
									}, 400, function(){
										$('.buttonWrapper').remove();
									});
								});
							},1000);
							setTimeout(function(){
								button.html('All Done! <i class="fa fa-smile-o"></i>');
							}, 500); 
					};
					var error = function(message) { button.html('Failed. Try Again'); };
					window.plugins.calendar.createEvent(title,location,notes,startDate,endDate,success,error);
				});
			}
			h.append(button);
			*/
			if(typeof event.venue.phone != 'null'){
				ephone = '';
			}else{
				ephone = event.venue.phone;
			}
			if(typeof event.venue.email != 'null'){
				eemail = '';
			}else{
				eemail = event.venue.email;
			}
			var tmp = [
				'<div class="appmod appmod-primary">' +
					'<div class="appmod-heading">' +
						'<h3 class="appmod-title">Details</h3>' +
					'</div>' +
					'<div class="appmod-body">' + 
						moment(event.event.start_date, "YYYY-MM-DD HH:mm:ss").format('MMMM Do YYYY, h:mma') + 
						'<hr style="margin:10px;"/>' +
						event.venue.address_html +
						'<hr style="margin:10px;"/>' +
						event.venue.website + '<br>' + 
						'<span class="leaveapplink" data-href="tel:' + ephone + '">' + ephone + '</span><br>' + 
						'<a href="mailto:' + eemail + '">' + eemail + '</a>' + 
					'</div>' +
				'</div>'
			];
			var html = tmp.join(" ");
			h.append(html);
			var button1 = $('<button class="btn btn-info btn-block">Tickets <i class="fa fa-chevron-right"></i> </button>');
			h.append(button1);
			h.append('<div style="height: 20px;"></div>');
			$('#showTicketsHere').html(h);
			button1.hammer().off('click, touchstart');
			button1.hammer().on('click, touchstart', function(){
				var width = $('body').width();
				$('#showTicketsHere').fadeIn(200, function(){
					$('.main-content-scroller').scrollTop(0);
					$('#showTicketsHere').html('<div class="loadingHolder"><i class="fa fa-spin fa-spinner"></i></div>');
					$('#showTicketsHere').css({
						opacity: 1
					});
					$('#showTicketsHere').html('<div class="alert alert-info" style="margin: 10px;"><strong>Note:</strong> maxmimum tickets available on a mobile device is 5</div>');
					tmps = [];
					$.each(event.event.tickets, function(i, ticket){
						if(ticket.status=='present' && ticket.type_id==1){
							additionalFee = parseFloat(ticket.ticket_fee_flat)+(parseFloat(ticket.ticket_fee_perc)*parseFloat(ticket.price)/100);
							if(additionalFee>0){
								additionalFeeView = ' (+ &pound' + numeral(additionalFee).format('0.00') + ')';
							}else{
								additionalFeeView = '';
							}
							fullFee = additionalFee+parseFloat(ticket.price);
							tmp = '<div class="ticketOption">' +
									'<p class="ticketTitle">' + ticket.name + '</p>' +
									'<p class="ticketSubtitle"><i class="fa fa-chevron-right"></i> &pound;' + numeral(ticket.price).format('0.00') + additionalFeeView + '</p>' +
									'<div class="ticketOptionCounter">' +
										'<input type="hidden" class="totalTicketFee" value="' + fullFee + '" />' +
										'<input type="hidden" class="ticketId" value="' + ticket.id + '" />' +
										'<div class="ticketOptQtyBtn minus person"><i class="fa fa-minus-circle"></i></div>' +
										'<div class="ticketOptQty">0</div>' +
										'<div class="ticketOptQtyBtn add person" style="float:right"><i class="fa fa-plus-circle"></i></div>' +
									'</div>' + 
								'</div>';
							tmps.push(tmp);
						}
					});
					extras = 0;
					$.each(event.event.tickets, function(i, ticket){
						if(ticket.status=='present' && ticket.type_id==2){
							if(extras==0){
								tmps.push('<hr style="margin: 0 10px" /><h4 class="text-info">&nbsp;&nbsp;Additional Extras</h4><hr style="margin: 0 10px" />');
							}
							extras++;
							additionalFee = parseFloat(ticket.ticket_fee_flat)+(parseFloat(ticket.ticket_fee_perc)*parseFloat(ticket.price)/100);
							if(additionalFee>0){
								additionalFeeView = ' (+ &pound' + numeral(additionalFee).format('0.00') + ')';
							}else{
								additionalFeeView = '';
							}
							fullFee = additionalFee+parseFloat(ticket.price);
							tmp = '<div class="ticketOption">' +
									'<p class="ticketTitle">' + ticket.name + '</p>' +
									'<p class="ticketSubtitle"><i class="fa fa-chevron-right"></i> &pound;' + numeral(ticket.price).format('0.00') + additionalFeeView + '</p>' +
									'<div class="ticketOptionCounter">' +
										'<input type="hidden" class="totalTicketFee" value="' + fullFee + '" />' +
										'<input type="hidden" class="ticketId" value="' + ticket.id + '" />' +
										'<div class="ticketOptQtyBtn minus"><i class="fa fa-minus-circle"></i></div>' +
										'<div class="ticketOptQty">0</div>' +
										'<div class="ticketOptQtyBtn add" style="float:right"><i class="fa fa-plus-circle"></i></div>' +
									'</div>' + 
								'</div>';
							tmps.push(tmp);
						}
					});

					tmps = tmps.join('<hr style="margin:10px;"/>');
					$('#showTicketsHere').append(tmps);
					$('#showTicketsHere').append('<hr style="margin:10px;"/>');
					$('#showTicketsHere').append('<input type="hidden" class="ticketsTotalBought" value="0" />');
					$('#showTicketsHere').append('<div class="ticketBasketTotal">&pound;0.00</div>');
					$('#showTicketsHere').append('<div class="ticketBuyBtn couponBtnDiv"><button class="btn btn-block btn-success addCouponBtn btn-nospace">I\'ve Got A Coupon</button></div>');
					$('#showTicketsHere').append('<div class="ticketBuyBtn"><button class="btn btn-block btn-info submitTicketRequest btn-nospace getTickets" disabled="disabled">Great, Get Tickets!</button></div>');
					$('#showTicketsHere').hammer().off('tap', '.addCouponBtn');
					$('#showTicketsHere').hammer().on('tap', '.addCouponBtn', function(){
						$('.userEntryBox').find('.userEntryTitle').html('Enter Your Coupon Code');
						$('.userEntryBox').find('.userEntryBodyHtml').html('<div class="paddedCell"><input class="form-control couponBox" type="text" style="text-align:center" placeholder="coupon code" /></div>');
						$('.userEntryBox').find('.userEntryBodyHtml').append('<div class="paddedCell"><button class="btn btn-block btn-info addCouponBtnSub">Add!</button></div>');
						$('.userEntryCoverer').css('display', 'block');
						$('.userEntryCoverer').css({'background-color': 'rgba(0,0,0,0.8)'}, 200);
						$('.userEntryBox').animate({'top': 0}, 200);
						setTimeout(function(){
							$('input.couponBox').focus();
						}, 400);
						$('.userEntryBox').hammer().off('tap', '.addCouponBtnSub');
						$('.userEntryBox').hammer().on('tap', '.addCouponBtnSub', function(){
							var coup = $('.couponBox').val();
							$('.couponBox').val('');
							$('input').blur();
							$('.userEntryCoverer').animate({'background-color': 'rgba(0,0,0,0)'}, 200, function(){
								$('.userEntryCoverer').css('display', 'none');
							});
							if(coup!='' && coup.length>0){
								//add this coupon to the list
								couponHtml = $('<div class="label label-danger TicketCoupon">' + coup + '</div>');
								$('.couponBtnDiv').after(couponHtml);
							}
							$('.userEntryBox').animate({'top': -240}, 200);
						});
						$('#showTicketsHere').hammer().off('tap', '.TicketCoupon');
						$('#showTicketsHere').hammer().on('tap', '.TicketCoupon', function(){
							$(this).addClass('couponToDelete');
							navigator.notification.confirm(
							    'Do you really want to remove this coupon?',
							    removeCoupon,
							    'Sure?',
							    'Yep,No'
							);
						});
						function removeCoupon(btn){
							if(btn==1){
								$('.couponToDelete').remove();
							}else{
								$('.couponToDelete').removeClass('couponToDelete');
							}
						}
					});
					$('#showTicketsHere').off('tap', '.getTickets');
					$('#showTicketsHere').on('tap', '.getTickets', function(){
						//get ticket quantities :-)
						Tickets = {}
						$('.ticketOptionCounter').each(function(){
							var id = $(this).find('.ticketId').val();
							Tickets[id] = {}
							Tickets[id]['ticket_id'] = id;
							Tickets[id]['quantity'] = parseInt($(this).find('.ticketOptQty').html());
						});
						Vouchers = new Array();
						var i = 0;
						$('.TicketCoupon').each(function(){
							Vouchers.push($(this).html());
							i++;
						});
						Vouchers = Vouchers.join(',');
						var PostObject = {}
							PostObject['tickets'] = Tickets;
							PostObject['vouchers'] = Vouchers;
						Json = JSON.stringify(PostObject);
						var sendGet = {};
						sendGet['json'] = Json;
						sendGet['source_church'] = source_church;
						$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
						$('.disabledCover').css('display', 'block');
						$('.disabledCover').css({
							'background-color': 'rgba(0,0,0,0.8)'
						},200);
						$.ajax({
						    type: "POST",
						    url: ticketurl + '/ticketing/' + id + '/order',
						    data: sendGet,
						    dataType: 'jsonp',
					   		cache: false,
					   		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
						    success: function(data) {
								$('.main-content-scroller').on('scroll', function(){
									var scrollT = $('.main-content-scroller').scrollTop();
									if(scrollT>($('.ticketBasket').height()+100)){
										$('.infoBarDrop').addClass('showing');
									}else{
										$('.infoBarDrop').removeClass('showing')
									}
								});
								eventFinalAmount = data.prices.total;
								$('.main-content-scroller').scrollTop(0);
							    if(data.status==true){
							    	var padded = $('<div class="paddedContent"</div>');
										basket = 
										'<div class="appmod appmod-info ticketBasket">' +
												'<div class="appmod-heading"><h3 class="appmod-title">Ticket Basket</h3></div>' +
											'<div class="appmod-body basketList"></div>' +
										'</div>';
									padded.append(basket);
							    	$('#showTicketsHere').html(padded);
							    	$.each(data.summary, function(i, t_entry){
										if(t_entry.quantity>0){
											$('.basketList').append(
												'<h5 class="pull-left text-warning">' + t_entry.name + '</h5>' +
												'<h5 class="pull-right text-warning">' + t_entry.quantity + '</h5>' +
							    				'<div class="clearfix"></div>'
											);
										}
									});
									//ad a small thing about how much time they have;
									t = moment().add('minutes', 30).format('HH:mm');
									padded.append('<div class="alert alert-warning"><p><strong>Please Note:</strong> You have 30 minutes to complete this order before it expires</p><p>That gives you until ' + t + '</p></div>');
									if(data.questions.Order.length>0){
										$('#showTicketsHere').append('<hr style="margin: 2px 10px" />');
										$('#showTicketsHere').append('<h4 class="text-info paddedHead">Order Details</h4>');
										$('#showTicketsHere').append(getTicketUserHtml(null, data.questions.Order, null, 'order'));
									}

									$.each(data.tickets, function(id, ticket){
										//this is a ticket, could be a group or individual
										//add the title
										$('#showTicketsHere').append('<hr style="margin: 2px 10px" />');
										$('#showTicketsHere').append('<h4 class="text-info paddedHead">' + ticket.name + '</h4>');
										if(ticket.people){
											//this is a group ticket...eek!
											$.each(ticket.people, function(i, person){
												$.each(person.ids, function(e, ti){
													$('#showTicketsHere').append(getTicketUserHtml(ti.id, data.questions.Person, person.ticket_name, 'person'));
												});
											});
										}else{
											//single ticket
											$('#showTicketsHere').append(getTicketUserHtml(ticket.id, data.questions.Person, null, 'person'));
										}
									});
									$('#showTicketsHere').append('<hr style="margin: 2px 10px" />');
									$('#showTicketsHere').append('<div class="indentedOption"><h5 class="text-warning">Order Email Address <i class="fa fa-asterisk"></i> <i class="fa fa-envelope"></i></h5></div>');
									$('#showTicketsHere').append('<div class="indentedOption" style="margin-bottom: 5px;"><input type="email" class="form-control ticketquestion required email myEmailAddress"/></div>');
									$('#showTicketsHere').append('<input type="hidden" class="theOrderId" value="' + data.order_id + '"/>');
									$('#showTicketsHere').append('<div class="indentedOption" style="margin-bottom: 5px;"><button class="btn btn-block btn-success orderTickets">Proceed</button></div>');
							    	$('.basketList').append('<hr style="margin:8px" />');
							    	$('.basketList').append('<h5 class="pull-left text-success">Subtotal</h5>');
							    	$('.basketList').append('<h5 class="pull-right text-success ticketBasketSubTotalTop" data-value="' + data.prices.total +'">&pound;' + numeral(data.prices.total).format('0,00.00') + '</h5>');
							    	$('.basketList').append('<div class="clearfix"></div>');
							    	$('.basketList').append('<hr style="margin:8px" />');
							    	$('.basketList').append('<div class="show-extras"></div>');
							    	$('.basketList').append('<h4 class="pull-left text-success">Total</h4>');
							    	$('.basketList').append('<h4 class="pull-right text-success ticketBasketTotalTopShow ticketBasketTotalTop" data-value="' + data.prices.total +'">&pound;' + numeral(data.prices.total).format('0,00.00') + '</h4>');
							    	$('.basketList').append('<div class="clearfix"></div>');
							    	$('.disabledCover').animate({
										'background-color': 'rgba(0,0,0,0)'
									},200, function(){
										$('.disabledCover').remove();
									});
									$('.ticketBasketTotalTopShow').html('&pound;' + numeral(data.prices.total).format('0,00.00'));
									//////////////////
									//////////////////
									$('.paidItem[type="checkbox"]').on('change', function(){
										var originalHeight = $('.show-extras').height();
										console.log('got the command');
										$('.show-extras').find('hr').remove();
										var id = $(this).attr('data-ticket') + $(this).attr('data-question');
										var val = $(this).attr('data-price');
										var qid = $(this).attr('data-question');
										var label = $(this).attr('data-name');
										if($(this).is(':checked')){
											console.log('checked the box');
											//add the extra to the extras div
											//first find if there is an existing div for that question item?
											if($('.show-extras .extraquestionrow.extraquestion' + qid).length>0){
												//there is a row for this already
												var existingqty =parseInt($('.extraquestionrow.extraquestion' + qid).find('.extraqty').html());
												var newqty = existingqty+1;
												var newrowtotal = newqty*parseFloat(val);
												$('.extraquestionrow.extraquestion' + qid).find('.extratotal').html('&pound;' + numeral(newrowtotal).format('0,00.00'));
												$('.extraquestionrow.extraquestion' + qid).find('.extratotal').attr('data-value', newrowtotal);
												$('.extraquestionrow.extraquestion' + qid).find('.extraqty').html(newqty);
											}else{
												//this is the first time we're adding this item, so create a new row
												var newRow = $('<div class="extraquestionrow extraquestion' + qid + '"></div>');
													newRow.append('<h5 class="text-info extratitle" style="float:left; width: 60%">' + label + '</h5>');
													newRow.append('<h5 class="extraqty text-info" style="float:left; width: 15%">1</h5>');
													newRow.append('<h5 class="extratotal text-info" data-value="' + val + '" style="float:left; text-align:right; width: 25%">&pound;' + numeral(val).format('0,00.00') +'</h5>');
													newRow.append('<div style="clear:both"></div>');
												$('.show-extras').append(newRow);
											}

										}else{
											var existingqty =parseInt($('.extraquestionrow.extraquestion' + qid).find('.extraqty').html());
											var newqty = existingqty-1;
											if(newqty==0){
												$('.extraquestionrow.extraquestion' + qid).remove();
											}else{	
												var newrowtotal = newqty*parseFloat(val);
												$('.extraquestionrow.extraquestion' + qid).find('.extratotal').html('&pound;' + numeral(newrowtotal).format('0,00.00'));
												$('.extraquestionrow.extraquestion' + qid).find('.extratotal').attr('data-value', newrowtotal);
												$('.extraquestionrow.extraquestion' + qid).find('.extraqty').html(newqty);
											}
										}	
										if($('.show-extras .extraquestionrow').length>0){
											//add the hr
											$('.show-extras').append('<hr style="margin: 5px 20px;" />');
										}
										//make changes to the total
										var subtotal = parseFloat($('.ticketBasketSubTotalTop').attr('data-value'));
										$('.extratotal').each(function(){
											subtotal = subtotal + parseFloat($(this).attr('data-value'));
										});
										$('.ticketBasketTotalTop').attr('data-value', subtotal);
										$('.ticketBasketTotalTopShow').html('&pound;' + numeral(subtotal).format('0,00.00'));
										var newHeight = $('.show-extras').height();
										var diff = newHeight-originalHeight;
										var scrollTop = $('.main-content-scroller').scrollTop();
										var newScrollHeight = scrollTop+diff;
										$('.main-content-scroller').scrollTop(newScrollHeight);
									});
									$('select.paidItem').on('change', function(){
										$('.show-extras').find('hr').remove();
										var was = $(this).attr('data-currentvalue');
										var selected = $(this).val();
										var selectedSel = $(this).find($('option[value="' + selected + '"]'));
										var val = selectedSel.attr('data-price');
										var optid = selectedSel.attr('data-id');
										var label = selectedSel.attr('data-label');
										var qid = $(this).attr('data-question');
										var tid = $(this).attr('data-ticket');
										var uniqueRowId = 'extra' + qid + optid;
										$(this).attr('data-currentvalue', optid);
										if(was!='none'){
											//there used to be an option, so now remove it
											var wasRowId = qid +'-'+ was;
											var existingqty =parseInt($('.extraquestionrow.extraquestion' + wasRowId).find('.extraqty').html());
											var newqty = existingqty-1;
											if(newqty==0){
												$('.extraquestionrow.extraquestion' + wasRowId).remove();
											}else{	
												var oldval = $(this).find($('option[data-id="' + was + '"]')).attr('data-price');
												var newrowtotal = newqty*parseFloat(oldval);
												$('.extraquestionrow.extraquestion' + wasRowId).find('.extratotal').html('&pound;' + numeral(newrowtotal).format('0,00.00'));
												$('.extraquestionrow.extraquestion' + wasRowId).find('.extratotal').attr('data-value', newrowtotal);
												$('.extraquestionrow.extraquestion' + wasRowId).find('.extraqty').html(newqty);
											}
										}
										if(optid!='none'){
											var qidRowId = qid +'-'+ optid;
											if($('.show-extras .extraquestionrow.extraquestion' + qidRowId).length>0){
												//there is a row for this already
												var existingqty =parseInt($('.extraquestionrow.extraquestion' + qidRowId).find('.extraqty').html());
												var newqty = existingqty+1;
												var newrowtotal = newqty*parseFloat(val);
												$('.extraquestionrow.extraquestion' + qidRowId).find('.extratotal').html('&pound;' + numeral(newrowtotal).format('0,00.00'));
												$('.extraquestionrow.extraquestion' + qidRowId).find('.extratotal').attr('data-value', newrowtotal);
												$('.extraquestionrow.extraquestion' + qidRowId).find('.extraqty').html(newqty);

											}else{
												var newRow = $('<div class="extraquestionrow extraquestion' + qidRowId + '"></div>');
													newRow.append('<h5 class="text-info extratitle" style="float:left; width: 60%">' + selected + ' <small>(' + label + ')</small></h5>');
													newRow.append('<h5 class="text-info extraqty" style="float:left; width: 15%">1</h5>');
													newRow.append('<h5 class="text-info extratotal" style="float:left; width: 25%; text-align:right" data-value="' + val + '">&pound;' + numeral(val).format('0,00.00') +'</h5>');
													newRow.append('<div style="clear:both"></div>');
												$('.show-extras').append(newRow);
											}
										}	
										if($('.show-extras .extraquestionrow').length>0){
											//add the hr
											$('.show-extras').append('<hr style="margin: 5px 20px;" />');
										}
										//make changes to the total
										var subtotal = parseFloat($('.ticketBasketSubTotalTop').attr('data-value'));
										$('.extratotal').each(function(){
											subtotal = subtotal + parseFloat($(this).attr('data-value'));
										});
										$('.ticketBasketTotalTop').attr('data-value', subtotal);
										$('.ticketBasketTotalTopShow').html('&pound;' + numeral(subtotal).format('0,00.00'));
										var newHeight = $('.show-extras').height();
										var diff = newHeight-originalHeight;
										var scrollTop = $('.main-content-scroller').scrollTop();
										var newScrollHeight = scrollTop+diff;
										$('.main-content-scroller').scrollTop(newScrollHeight);

									});
								//////////////////
								//////////////////
								}else{
									$('#showTicketsHere').html(data.msg);
									$('.disabledCover').animate({
										'background-color': 'rgba(0,0,0,0)'
									},200, function(){
										$('.disabledCover').remove();
									});
								}
						    },
						    error: function(){
								navigator.notification.vibrate(100);
						    	navigator.notification.alert('It looks like there was a problem with your request. We\'re going to take you back to the ticket page.', linkToPage('tickets'), 'There was a problem', 'Ok')
						    	$('.disabledCover').animate({
									'background-color': 'rgba(0,0,0,0)'
								},200, function(){
									$('.disabledCover').remove();
								});
						    }
						});
						function getTicketUserHtml(id, questions, title, questiontype){
							var html = new Array;
							//first see if a sub title exsists (group tickets only)
							if(title!=null){
								html.push('<h5 class="text-info paddedHead">' + title + '</h5>');
							}
							qus = 0;
							$.each(questions, function(i, question){
								qus++;
								//set class string
								clases = new Array();
								ast = new Array();
								texttype = 'text';
								if(questiontype=='person'){
									clases.push('ticketquestion');
								}else if(questiontype=='order'){
									clases.push('orderquestion');
								}
								if(question.required=='1'){
									clases.push('required');
									ast.push(' <i class="fa fa-asterisk"></i> ');
								}
								if(question.email=='1'){
									clases.push('email');
									ast.push(' <i class="fa fa-envelope"></i> ');
									texttype = 'email';
								}
								clases = clases.join(" ");
								ast = ast.join(" ");
								if(question.input_type_id==308){
									//textbox
									html.push('<div class="indentedOption"><h5 class="text-muted"><small>' + question.label + ' ' + ast+ '</small></h5></div>');
									html.push('<div class="indentedOption"><input type="' + texttype + '" class="form-control ' + clases + '" data-ticket="' + id + '" data-question="' + question.id + '" /></div>');
								}else if(question.input_type_id==309){
									//drop down
									if(question.paid==0){
										html.push('<div class="indentedOption"><h5 class="text-muted"><small>' + question.label + ' ' + ast+ '</small></h5></div>');
										html.push('<div class="indentedOption">');
											html.push('<select class="form-control ' + clases + '" data-ticket="' + id + '" data-question="' + question.id + '">');
												$.each(question.options_array, function(key, val){
													html.push('<option value="' + key + '">' + val + '</option>');
												});	
											html.push('</select>');
										html.push('</div>');
									}else if(question.paid==1){
										html.push('<div class="indentedOption"><h5 class="text-muted"><small>' + question.label + ' ' + ast+ '</small></h5></div>');
										html.push('<div class="indentedOption">');
											html.push('<select class="form-control ' + clases + ' paidItem" data-ticket="' + id + '" data-question="' + question.id + '" id="I-' + id + '-' + question.id + '" data-currentvalue="none">');
												html.push('<option data-id="none" value="none">Select</option>');
												$.each(question.options_array, function(it, opt){
													html.push('<option value="' + opt.label + '" data-id="' + it + '" data-label="' + question.label + '" data-price="' + opt.price + '">' + opt.label + ' (+&pound' + numeral(opt.price).format('0,00.00') + ')</option>');
												});	
											html.push('</select>');
										html.push('</div>');
									}
								}else if(question.input_type_id==310){
									//textarea
									html.push('<div class="indentedOption"><h5 class="text-muted"><small>' + question.label + ' ' + ast+ '</small></h5></div>');
									html.push('<div class="indentedOption"><textarea class="form-control ' + clases + '" style="height: 140px;" data-ticket="' + id + '" data-question="' + question.id + '"></textarea></div>');
								}else if(question.input_type_id==314){
									//checkbox
									html.push('<div class="indentedOption"><h5 class="text-muted"><small>' + question.label + ' ' + ast+ '</small></h5></div>');
									html.push('<div class="indentedOption">');
									if(question.paid==0){
										input = '<input type="checkbox" value="1" class="ticketInfo" data-question="' + question.id + '" data-ticket="' + ticket.id + '" data-name="' + question.label +'"/>';
									}else if(question.paid==1){
										input = '<input type="checkbox" value="1" class="paidItem ticketInfo" id="i' + question.id + id + '" data-price="' + question.price + '" data-question="' + question.id + '" data-ticket="' + id + '" data-name="' + question.label +'"/>';
									}
									html.push(input);
									html.push('<label for="i' + question.id + id + '" class="text-info">+&pound' + numeral(question.price).format('0,00.00') + '</label></div>');
								}
							});
							if(qus==0){
								html.push('<div class="indentedOption"><h5 class="text-muted">no questions for this ticket</h5></div>');
							}
							html.push('<div style="height: 20px;"></div>');
							html = html.join(" ");
							return html;
						}
						$('#showTicketsHere').hammer().off('tap', '.orderTickets');
						$('#showTicketsHere').hammer().on('tap', '.orderTickets', function(){
							$('.infoBarDrop').remove();
							$('input').blur();
							var er = 0;
							$('.ticketquestion .orderquestion').each(function(i, obj){
								$(this).removeClass('failed');
								if($(this).hasClass('required') && ($(this).val().length==0 || $(this).val()=='None')){
									$(this).addClass('failed');
									er++;
								}else if($(this).hasClass('email') && validEmail($(this).val())==false){
									$(this).addClass('failed');
									er++;
								}
							});
							if(er==0){
								$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
								$('.disabledCover').css('display', 'block');
								$('.disabledCover').css({
									'background-color': 'rgba(0,0,0,0.8)'
								},200);
								post = {};
								post['tickets'] = {};
								post['order'] = {}
								//there are no errors!! whoop whoop!!
								//now compile the mega post request
								$('.ticketquestion').each(function(i, obj){
									if(!$(this).hasClass('myEmailAddress')){
										if(!post['tickets'][$(this).attr('data-ticket')]){
											post['tickets'][$(this).attr('data-ticket')] = {}
										}
										if($(this).attr('type')=='checkbox'){
											if($(this).is(':checked')){
												post['tickets'][$(this).attr('data-ticket')][$(this).attr('data-question')] = 1;	
											}else{
											//	post['tickets'][$(this).attr('data-ticket')][$(this).attr('data-question')] = 0;
											}
										}else{
											post['tickets'][$(this).attr('data-ticket')][$(this).attr('data-question')] = $(this).val();
										}
									}
								});
								$('.orderquestion').each(function(i, obj){
									if(!$(this).hasClass('myEmailAddress')){
										qid = $(this).attr('data-question');
										if($(this).attr('type')=='checkbox'){
											if($(this).is(':checked')){
												post['order'][qid] = 1;	
											}else{
											//	post['tickets'][$(this).attr('data-ticket')][$(this).attr('data-question')] = 0;
											}
										}else{
											post['order'][qid] = $(this).val();
										}
									}
								});



								post['email'] = $('.myEmailAddress').val();
								post['oid'] = $('.theOrderId').val();
								Json = JSON.stringify(post);
								var sendGet = {};
								sendGet['json'] = Json;
								if(host=='local'){
									tmpApiKey = $.jStorage.get('api_key');
								}else{
									tmpApiKey = null;
								}
								$.ajax({
								    type: "POST",
								    url: ticketurl + '/ticketing/' + id + '/questions',
								    data: sendGet,
								    dataType: 'json',
					   				cache: false,
									headers: { 'iknow-api-key': tmpApiKey},
								    success: function(data) {
								    	if(data.status==false){
								    		navigator.notification.vibrate(100);
									    	navigator.notification.alert(data.msg, linkToPage('tickets'), 'There was a problem', 'Ok')
									    	$('.disabledCover').css({
												'background-color': 'rgba(0,0,0,0.8)'
											},200, function(){
												$('.disabledCover').remove();
											});
								    	}else{
								    		$('.disabledCover').animate({
												'background-color': 'rgba(0,0,0,0)'
											},200, function(){
												$('.disabledCover').remove();
											});
											if(data.free==false){
												var html = new Array;
												$('#showTicketsHere').html('');
												$('#showTicketsHere').scrollTop(0);
												html.push('<h3 class="text-info" style="text-align:center">Total: &pound;' + numeral(data.total).format('0,00.00') + '</h4>')
												html.push('<div class="indentedOption"><h5 class="text-info">Card Details</h5></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>First Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control required" value="' + data.person.ppl_fname + '" data-field="card_fname" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Last Name <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control required" value="' + data.person.ppl_sname + '" data-field="card_sname" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Card Number <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control required" data-field="card_number" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Start Month</small></h5></div>');
												html.push('<div class="indentedOption"><input type="tel" class="form-control" style="width:40%; float:left;" placeholder="MM" maxlength="2" data-field="card_start_m" /> <input type="tel" class="form-control" data-field="card_start_y" style="width:40%; margin-left:10px; float:left;" placeholder="YY" maxlength="2" /><div style="clear:both"></div></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Expiry Month <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="tel" class="form-control required" style="width:40%; float:left;" placeholder="MM" maxlength="2" data-field="card_expiry_m" /> <input type="tel" data-field="card_expiry_y" class="form-control required" style="width:40%; margin-left:10px; float:left;" placeholder="YY" maxlength="2" /><div style="clear:both"></div></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Issue Number</small></h5></div>');
												html.push('<div class="indentedOption"><input type="tel" class="form-control" style="width:30%" maxlength="2" data-field="card_issue" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>CVV Number <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="tel" class="form-control required" style="width:50%" maxlength="3" data-field="card_cvv" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-info">Billing Address</h5></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 1 <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control required" value="' + data.person.hh_line1 + '" data-field="card_line1" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 2</small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control" value="' + data.person.hh_line2 + '" data-field="card_line2" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Address Line 3</small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control" value="' + data.person.hh_line3 + '" data-field="card_line3" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>City</small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control" value="' + data.person.hh_town + '" data-field="card_city" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>County</small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control" value="' + data.person.hh_county + '" data-field="card_county" /></div>');
												html.push('<div class="indentedOption"><h5 class="text-muted"><small>Postcode <i class="fa fa-asterisk" style="color:red"></i></small></h5></div>');
												html.push('<div class="indentedOption"><input type="text" class="form-control required" value="' + data.person.hh_postcode + '" data-field="card_postcode" /></div>');
												html.push('<div class="indentedOption" style="margin-top: 10px; margin-bottom:10px"><button class="btn btn-info btn-block payForTickets">Pay Now</button></div>');
												html.push('<input type="hidden" data-field="invoice" value="' + data.invoice + '" />');
												html.push('<input type="hidden" data-field="system_id" value="' + data.system_id + '" />');
												html.push('<input type="hidden" data-field="available_date" value="' + eventAvailableDate + '" />');
												html.push('<input type="hidden" data-field="amount" value="' + data.total + '" />');
												html.push('<input type="hidden" data-field="desc" value="iKnow Ticketing (via mobile app)" />');
												html.push('<input type="hidden" data-field="url" value="' + ticketurl + '/ticketing/' + id + '/ipn" />');
												html.push('<input type="hidden" data-field="account_id" value="' + data.passport_id + '" />');
												html = html.join(" ");
												$('#showTicketsHere').html(html);
												transaction_passid = data.passport_id;
												transaction_invoice = data.invoice;
												transaction_type = "ticket";
											}else if(data.free==true){
												html = ticketThankYou();
												$('.main-content-scroller').scrollTop(0);
												$('#showTicketsHere').html(html);
											}
										}
									},
								    error: function(){
								    	navigator.notification.vibrate(100);
								    	navigator.notification.alert('It looks like there was a problem with your request. We\'re going to take you back to the ticket page.', linkToPage('tickets'), 'There was a problem', 'Ok')
								    	$('.disabledCover').animate({
											'background-color': 'rgba(0,0,0,0)'
										},200, function(){
											$('.disabledCover').remove();
										});
								    }
								});
							}else{
								navigator.notification.alert(
								    'Please make sure you have filled in the form correctly.',  // message
								    null,         // callback
								    'Small problem',            // title
								    'Try Again'                  // buttonName
								);
							}
						});	

						$('#showTicketsHere').hammer().off('tap', '.payForTickets');
						$('#showTicketsHere').hammer().on('tap', '.payForTickets', function(){
							var er = 0;
							$('#showTicketsHere').find('input').each(function(){
								$(this).removeClass('failed');
								if($(this).hasClass('required') && ($(this).val()=='' || $(this).val().length==0)){
									$(this).addClass('failed');
									er++;
								}
							});
							if(er==0){
								$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
								$('.disabledCover').css('display', 'block');
								$('.disabledCover').css({
									'background-color': 'rgba(0,0,0,0.8)'
								},200);
								var post = {};
								$('#showTicketsHere').find('input').each(function(){
									post[$(this).attr('data-field')] = $(this).val();
								});
								$.ajax({
								    type: "POST",
								    url: 'https://api.divinepassport.com/1/pay',
								    dataType: "json",
								    data: post,
								    success: function(data) {
								    	if(data.status=='error'){
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 101. \r\nWe couldn't connect you to our payment service.", removeDisabledCover, 'There was a problem', 'Try Again');
								    	}else if(data.status==false || data.status=='false' || data.status=="false"){
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 102.\t\n" + data.msg, removeDisabledCover, 'There was a problem', 'Try Again');
								    	}else if(data.status=='redirect'){
								    		$('.main-content-scroller').scrollTop(0);
								    		$('.disabledCover').animate({
												'background-color': 'rgba(0,0,0,0)'
											},200, function(){
												$('.disabledCover').remove();
											});
								    		$('#showTicketsHere').html('');
								    		var html = new Array;
								    		html.push('<form method="post" target="3dsecureframe" id="3dsecureform" action="' + data.url + '"></form>');
											html.push('<iframe id="3dsecureframe" class="secureframe" scrolling="no" name="3dsecureframe" style="border: none; width:370px; overflow: hidden;" frameborder="0"></iframe>');
								    		html = html.join(" ");
											$('#showTicketsHere').html(html);
											$.each(data.data, function(key, val){
								    			$('#3dsecureform').append('<input type="hidden" name="' + key + '" value="' + val + '" />');
								    		});
											//assume the width of the 3d secure page 370px
											var scale = (Math.floor(($(window).width()/370)*100))/100;
											if(scale<1){
												$('.secureframe').css({
													'-webkit-transform': 'scale(' + scale + ', ' + scale + ')', 
													'transform': 'scale(' + scale + ', ' + scale + ')', 
													'-webkit-transform-origin': 'top left',
													'transform-origin': 'top left'
												});
												$('#showTicketsHere').css('overflow', 'hidden');
											}
											$('#3dsecureform').submit();
											check3dSecureStatus();
								    	}else if(data.status==true || data.status=='true' || data.status=="true"){
											html = ticketThankYou();
											$('.disabledCover').animate({
												'background-color': 'rgba(0,0,0,0)'
											},200, function(){
												$('.disabledCover').remove();
											});
											$('#showTicketsHere').scrollTop(0);
											$('#showTicketsHere').html(html);
								    	}else{
								    		navigator.notification.vibrate(100);
								    		navigator.notification.alert("Error 105.\r\nThere was a problem with the payment request. \r\n Status: " + data.status, removeDisabledCover, 'There was a problem', 'Try Again');
								    	}
								    },
								    error: function(data){
								    	navigator.notification.vibrate(100);
								    	navigator.notification.alert("Error 106.\r\nWe couldn't connect you to our payment service.", removeDisabledCover, 'There was a problem', 'Try Again');
								    }
								});
							}
						});
					});
					$('.ticketOptionCounter').hammer().on('touchstart', '.ticketOptQtyBtn', function(){
						var ticketsTotal = parseInt($('.ticketsTotalBought').val());
						var current = parseInt($(this).parent().find('.ticketOptQty').html());
						var basket = parseFloat($('.ticketBasketTotal').html().substring(1, $('.ticketBasketTotal').html().length));
						var ticketPrice = parseFloat($(this).parent().find('.totalTicketFee').val());
						if($(this).hasClass('add')){
							if(ticketsTotal<5 || !$(this).hasClass('person')){
								if($(this).hasClass('person')){
									newTicketsTotal = ticketsTotal + 1;
								}
								newQty = current + 1;
								newBasket = basket + ticketPrice;
							//	navigator.notification.vibrate(100);
								$(this).parent().find('.ticketOptQty').html(newQty);
								$('.ticketBasketTotal').html('&pound;' + numeral(newBasket).format('0.00'));
								$('.ticketsTotalBought').val(newTicketsTotal);		
							}
						}else if($(this).hasClass('minus')){
							if(current>0){
								if($(this).hasClass('person')){
									newTicketsTotal = ticketsTotal - 1;
								}
								newQty = current - 1;
								newBasket = basket - ticketPrice;
							//	navigator.notification.vibrate(100);
								$(this).parent().find('.ticketOptQty').html(newQty);
								$('.ticketBasketTotal').html('&pound;' + numeral(newBasket).format('0.00'));
								$('.ticketsTotalBought').val(newTicketsTotal);
							}
						}
						if(newTicketsTotal>0){
							$('.ticketBuyBtn').find('button.getTickets').removeAttr('disabled');
						}else{
							$('.ticketBuyBtn').find('button.getTickets').attr('disabled', 'disabled');
						}
					});	
				});
			});
		},
		error: function(church){
			alert('error 4');
			linkToPage('home');
			$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
			$('.appmod-body').html('<p>Could Not Connect To Server</p>');
			$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
			$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
		}
	});
}
function build_notifications(){
	addTitle('Notifications');
	var notifications = $.jStorage.get('notifications');
	$.each(notifications, function(i, note){
		//work out what the time is
			var today = new moment();
			var event_start = new moment(note.date, 'YYYY-MM-DD HH:mm:ss');
			var diff = event_start.diff(today);
			if(diff>10){
				context = new Object;
				context['title'] = note.title;
				context['description'] = note.desc;
				context['icon'] = note.icon;
				if(diff>86400000){
					//it is more than one day, display in days
					context['quantity'] = event_start.diff(today, 'days');
					if(context['quantity']==1){
						context['units'] = 'day';
					}else{
						context['units'] = 'days';
					}
				}else if(note.type=='groupBirthdays' || note.type=='teamBirthdays'){
					context['units'] = ' ';
					context['quantity'] = 'Today';
				}else if(diff>3600000){
					//it is more than one hour, display in hours
					context['quantity'] = event_start.diff(today, 'hours');
					if(context['quantity']==1){
						context['units'] = 'hour';
					}else{
						context['units'] = 'hours';
					}
				}else if(diff>60000){
					//more than a minute, display in minutes
					context['quantity'] = event_start.diff(today, 'minutes');
					if(context['quantity']==1){
						context['units'] = 'minute';
					}else{
						context['units'] = 'minutes';
					}
				}else{
					//display in seconds
					context['quantity'] = event_start.diff(today, 'seconds');
					if(context['quantity']==1){
						context['units'] = 'second';
					}else{
						context['units'] = 'seconds';
					}
				}
				if(note.type=='groupEvents'){
					context['date'] = event_start.format('dddd Do MMM @ h:mma');
					context['class'] = 'notificationGroup';
					context['showing'] = $.jStorage.get('notificationGroup');
					context['type'] = 'groupNotification';
				}else if(note.type=='rotaReminders'){
					context['date'] = event_start.format('dddd Do MMM @ h:mma');
					context['class'] = 'notificationRota';
					context['showing'] = $.jStorage.get('notificationRota');
					context['type'] = 'rotaNotification'
				}else if(note.type=='groupBirthdays'){
					context['date'] = event_start.format('dddd Do MMMM');
					context['type'] = 'birthdayNotification'
					context['class'] = 'notificationBirthdays';
					context['showing'] = $.jStorage.get('notificationBirthdays');
				}else if(note.type=='teamBirthdays'){
					context['date'] = event_start.format('dddd Do MMMM');
					context['type'] = 'birthdayNotification'
					context['class'] = 'notificationBirthdays';
					context['showing'] = $.jStorage.get('notificationBirthdays');
				}else if(note.type=='invitedEvents'){
					context['date'] = event_start.format('dddd Do MMM @ h:mma');
					context['type'] = 'eventNotification'
					context['class'] = 'notificationEvents';
					context['showing'] = $.jStorage.get('notificationEvents');
				}
				var html = notificationTemplate(context);
				$('#showMyNotifications').append(html);
			}
	});
	$('#showMyNotifications').append('<div style="height: 60px;"></div>');
	$( ".noteDays:contains('Today')" ).css( "font-size", "12pt" );
	$('.notificationChoose').hammer().off('tap', '.chooseNotificationOpt');
	$('.notificationChoose').hammer().on('tap', '.chooseNotificationOpt', function(){
		var clas = $(this).attr('data-notetype');
		if($(this).hasClass('showing')){
			$.jStorage.set(clas, 'notshowing');
			$('.' + clas).removeClass('showing');
			$('.' + clas).addClass('notshowing');
			$(this).removeClass('showing');
			$(this).addClass('notshowing');
		}else{
			$.jStorage.set(clas, 'showing');
			$('.' + clas).addClass('showing');
			$('.' + clas).removeClass('notshowing');
			$(this).addClass('showing');
			$(this).removeClass('notshowing');
		}
	});
}
function tmp_page_notifications(){
	var tmp = [
		'<div class="notificationChoose">' +
			'<div class="notificationOptButton"><button type="button" class="btn btn-xs btn-block chooseNotificationOpt ' + $.jStorage.get('notificationGroup') + '" data-notetype="notificationGroup"><i class="fa fa-coffee notificationIcon"></i></button></div>' + 
			'<div class="notificationOptButton"><button type="button" class="btn btn-xs btn-block chooseNotificationOpt ' + $.jStorage.get('notificationRota') + '" data-notetype="notificationRota"><i class="fa fa-clock-o notificationIcon"></i></button></div>' + 
			'<div class="notificationOptButton"><button type="button" class="btn btn-xs btn-block chooseNotificationOpt ' + $.jStorage.get('notificationBirthdays') + '" data-notetype="notificationBirthdays"><i class="fa fa-gift notificationIcon"></i></button></div>' + 
			'<div class="notificationOptButton"><button type="button" class="btn btn-xs btn-block chooseNotificationOpt ' + $.jStorage.get('notificationEvents') + '" data-notetype="notificationEvents"><i class="fa fa-calendar notificationIcon"></i></button></div>' + 
		'</div>' + 
		'<div class="notificationsContainer main-content-scroller" id="notificationsContainer">' +
			'<div id="showMyNotifications"></div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function build_mydetails(){
	addTitle('My Details');
	$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
	$('.disabledCover').css('display', 'block');
	$('.disabledCover').css({
		'background-color': 'rgba(0,0,0,0.8)'
	},200);
	$.ajax({
		type: 'get',
		url: apiUrl + '/account',
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(me){
			//first fill all the select options in
			if(me.status==true){
				$.each(me.data.options, function(i, select){
					$.each(select.options, function(id, option){
						$('.' + select.key).append('<option value="' + id + '">' + option + '</option>');
					});
				});
				//quickly add the dates and months for dobs
				for (var i=1;i<32;i++){
					if(i<10){
						e = '0' + i;
					}else{
						e = i;
					}
					$('.DOBDD').append('<option value="' + e + '">' + e + '</option>');
				}
				for (var i=1;i<13;i++){
					if(i<10){
						e = '0' + i;
					}else{
						e = i;
					}
					$('.DOBMM').append('<option value="' + e + '">' + e + '</option>');
				}
				$.each(me.data.person, function(key, val){
					$('.' + key).val(val);
				});
				$('.disabledCover').animate({
					'background-color': 'rgba(0,0,0,0)'
				},200, function(){
					$('.disabledCover').remove();
				});
			}
		},
		error: function(){
			

		}
	});
	$('#main-content').hammer().off('tap', '.saveMyDetails');
	$('#main-content').hammer().on('tap', '.saveMyDetails', function(){
		post = new Object;
		$('.mydetails').each(function(){
			post[$(this).attr('data-field')] = $(this).val();
		});
		$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
		$('.disabledCover').css('display', 'block');
		$('.disabledCover').css({
			'background-color': 'rgba(0,0,0,0.8)'
		},200);
		send = new Object;
		send['data'] = post;
		$.ajax({
			type: 'put',
			url: apiUrl + '/account',
			dataType: 'json',
			data: send,
			headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			success: function(me){
				//first fill all the select options in
				$('.disabledCover').animate({
					'background-color': 'rgba(0,0,0,0)'
				},200, function(){
					$('.disabledCover').remove();
				});
			},
			error: function(){

			}
		});

	});
	
}
function tmp_page_mydetails(){
	var tmp = [
		'<div class="main-content-scroller">' +
			'<div id="showMyDetails" class="paddedContent">' + 
				'<h4 class="text-info">Personal Details</h4>' + 
				'<h5 class="text-muted"><small>Name</small></h5>' + 
				'<input type="text" class="form-control mydetails NAME" data-field="NAME" />' +
				'<h5 class="text-muted"><small>Email Address</small></h5>' + 
				'<input type="email" class="form-control mydetails EMAIL" data-field="EMAIL" />' + 
				'<h5 class="text-muted"><small>Mobile Number</small></h5>' + 
				'<input type="tel" class="form-control mydetails MOBILE" data-field="MOBILE" />' +
				'<h5 class="text-muted"><small>Facebook ID</small></h5>' + 
				'<div class="input-group"><span class="input-group-addon">facebook.com/</span><input type="text" class="form-control mydetails TWITTER" data-field="TWITTER" /></div>' +
				'<h5 class="text-muted"><small>Twitter Handle</small></h5>' + 
				'<div class="input-group"><span class="input-group-addon">@</span><input type="text" class="form-control mydetails TWITTER" data-field="TWITTER" /></div>' +     
				'<h5 class="text-muted"><small>Gender</small></h5>' + 
				'<select class="form-control mydetails GENDER" data-field="GENDER"><option value="0">Select</option></select>' +
				'<h5 class="text-muted"><small>Date Of Birth</small></h5>' + 
				'<div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control DOBDD mydetails" data-field="DOBDD"><option value="0">DD</option></select></div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control DOBMM mydetails" data-field="DOBMM"><option value="0">MM</option></select></div><div style="display:inline-block; width: 40%; padding: 2px; -webkit-box-sizing: border-box;"><input type="tel" class="form-control mydetails DOBYYYY" data-field="DOBYYYY" /></div><div style="clear:both">&nbsp;</div></div>' +
				'<hr style="margin: 10px;" />' + 
				'<h4 class="text-info">More Details</h4>' +      
				'<h5 class="text-muted"><small>Relationship Status</small></h5>' + 
				'<select class="form-control mydetails RELATION" data-field="RELATION"><option value="0">Select</option></select>' +
				'<h5 class="text-muted"><small>Language</small></h5>' + 
				'<select class="form-control mydetails LANGUAGE" data-field="LANGUAGE"><option value="0">Select</option></select>' +
				'<h5 class="text-muted"><small>Employment Status</small></h5>' + 
				'<select class="form-control mydetails EMPLOYMENT" data-field="EMPLOYMENT"><option value="0">Select</option></select>' +
				'<h5 class="text-muted"><small>Nationality</small></h5>' + 
				'<select class="form-control mydetails NATION" data-field="NATION"><option value="0">Select</option></select>' +
				'<div style="margin-top: 10px; margin-bottom:10px;"><button class="btn btn-block btn-success saveMyDetails">Save</button></div>' + 
			'</div>' +  
		'</div>'
	];
	return tmp.join(" ");
}

function build_qrscanner(){
	addTitle('QR Scanner');
	$('#showQrscanner').hammer().off('tap', '.openScanner');
	$('#showQrscanner').hammer().on('tap', '.openScanner', function(){
		$(this).html('<i class="fa fa-spin fa-spinner"></i>');
		cordova.plugins.barcodeScanner.scan(
	      function (result) {
	          useQr(result, true);
	      }, 
	      function (error) {
	          useQr(result, false);
	      }
	   );
	});
	var json = '{"t": "a", "u": "' + $.jStorage.get('loggedInUser') + '", "k":"' + $.jStorage.get('api_key') + '"}';
/*	var qrcode = new QRCode("myQrCode", {
	    text: json,
	    width: 200,
	    height: 200,
	    colorDark : "#000000",
	    colorLight : "#ffffff",
	    correctLevel : QRCode.CorrectLevel.H
	});
*/
}
function useQr(result, status){
	/* 
		types
		a: person's details, add to contacts!
		b: post request and respond
		c: secret message
		d: treasure hunt :P
	*/
	$('#theQrContent').removeClass('main-content-scroller');
	$('.openScanner').html('Scan QR Code!')
	var curHei = parseInt($(window).height())-20;
	$('body').css('margin-top', '20px');
	$('html').css('height', curHei);
	$('#viewMeta').attr('content', 'initial-scale=1.0, user-scalable=0, width=device-width, height=' + curHei + ', target-densityDpi=device-dpi');
	if(status==true){
		
	}
	$('#theQrContent').addClass('main-content-scroller');
}
function tmp_page_qrscanner(){
	var tmp = [
		'<div class="main-content-scroller" id="theQrContent">' +
			'<div id="showQrscanner" class="paddedContent">' + 
				'<button class="btn btn-block btn-success openScanner">Scan QR Code!</button>' + 
			//	'<br /><p>My Connect QR:</p>' + 
			//	'<div class="qrCode" id="myQrCode"></div>' + 
			//	'<h5 class="text-warning">What does this do?</h5>' + 
			//	'<p>Anyone who scans your Connect QR code will have access to the following details from iKnow:</p>' + 
				'<h5>What can I do?</h5>' + 
				'<ul>' + 
					'<li>Register your interest in events</li>' +
					'<li>Join circles</li>' + 
					'<li>Take part in treasure hunts</li>' + 
				'</ul>' +
			'</div>' +  
		'</div>'
	];
	return tmp.join(" ");
}


function build_prayer(){
	addTitle('Prayer &amp; Praise');
	var prayers = $.jStorage.get('prayers');
	$.each(prayers, function(i, prayer){
		dateMoment = moment(prayer.created_at, "YYYY-MM-DD HH:mm:ss")
		date = dateMoment.format('ddd Do MMM YYYY');
		timeAgo = dateMoment.from(moment());
		if(prayer.mine==true){
			if(prayer.type=='prayer'){
				icon = "fa-comment";
			}else if(prayer.type=='praise'){
				icon = 'fa-thumbs-up';
			}	
		}else{
			if(prayer.type=='prayer'){
				icon = "fa-comment-o";
			}else if(prayer.type=='praise'){
				icon = 'fa-thumbs-o-up';
			}
		}
		html = new Array;
		html.push('<div class="rowOptionSingle prayerEntry prayerid' + prayer.id + '" data-prayerkey="' + i + '" data-prayerid="' + prayer.id + '">');
			html.push('<div style="width: 30px; font-size: 16pt;">');
				html.push('<i class="fa ' + icon + '"></i>');
			html.push('</div>');
			html.push('<div class="rowOptionTitle"><p>' + prayer.title + '</p><p class="listSubHead">' + date + ' (' + timeAgo + ')</p></div>');
			html.push('<div class="rowOptionBig" data-holid="' + prayer.id + '"><p class="big"><i class="fa fa-chevron-right "></i></p><p class="blabel">&nbsp;</p></div>');
		html.push('</div>');
		html = html.join(' ');
		$('#listPrayers').append(html);
	});
	$('#main-content').hammer().off('tap', '.prayerEntry');
	$('#main-content').hammer().on('tap', '.prayerEntry', function(){
		width = $(window).width();
		key = $(this).attr('data-prayerkey');
		pid = $(this).attr('data-prayerid');
		$('#thePrayerContent').width(width);
		$('#thePrayerContent').animate({
			marginLeft: '-' + width + 'px'
		}, 200, function(){
			$('.main-content-scroller').scrollTop(0);
			$('#thePrayerContent').html('<div class="loadingHolder"><i class="fa fa-spin fa-spinner"></i></div>');
			$('#thePrayerContent').css({
				marginLeft: '0px'
			});
			setTimeout(function(){
				prayers = $.jStorage.get('prayers');
				prayer = prayers[key];
				if(prayer.mine!=true){
					if(prayer.intercessing==true){
						option = '<button class="btn btn-block btn-success" disabled="disabled">Already Praying</button>';
					}else{
						option = '<button class="btn btn-block btn-success intercess">I\'m Praying</button>';
					}
				}else{
					if(prayer.type=='prayer'){
						//remove or praise
						option = '<div style="padding: 5px; box-sizing: border-box; width:50%; float:left;"><button class="btn btn-block btn-danger removePrayer">Remove</button></div><div style="padding: 5px; box-sizing: border-box; width:50%; float:left;"><button class="btn btn-block btn-success reportPraise">Praise</button></div>';
					}else{
						//remove
						option = '<button class="btn btn-block btn-danger removePrayer">Remove Praise</button>';
					}
				}
				$('#thePrayerContent').html('');
				html = new Array;
				html.push('<div class="paddedContent">');
					html.push('<h4 class="text-info">' + prayer.title + '</h4>');
					html.push('<h5 class="text-muted">' + prayer.ppl_fname + ' ' + prayer.ppl_sname + '</h5>');
					html.push('<h5 class="text-muted">' + moment(prayer.created_at).format('ddd Do MMM YYYY') + '</h5>');
					html.push('<hr style="margin: 10px;">');
					html.push(option);
					html.push('<hr style="margin: 10px;">');
					html.push('<div class="paddedContent">');
						html.push(prayer.content);
					html.push('</div>');
				html.push('</div>');
				html = html.join(' ');
				$('#thePrayerContent').html(html);
				$('#thePrayerContent').hammer().off('tap', '.intercess');
				$('#thePrayerContent').hammer().on('tap', '.intercess', function(){
					var clickedBtn = $(this);
					clickedBtn.attr('disabled', 'disabled');
					clickedBtn.html('<i class="fa fa-spin fa-spinner"></i>');
					$.ajax({
						type: 'post',
						url: apiUrl + '/prayers/' + pid + '/intercessors',
						dataType: 'json',
						headers: { 'iknow-api-key': $.jStorage.get('api_key') },
						success: function(){
							clickedBtn.html('Thank You');
							//change my local version
							prayers = $.jStorage.get('prayers');
							prayers[key].intercessing = true;
							$.jStorage.deleteKey('prayers');
							$.jStorage.set('prayers', prayers);
						}
					});
				});
				$('#thePrayerContent').hammer().on('tap', '.removePrayer', function(){
					var clickedBtn = $(this);
					clickedBtn.attr('disabled', 'disabled');
					clickedBtn.html('<i class="fa fa-spin fa-spinner"></i>');
					navigator.notification.confirm(
	       				'Do you really want to remove this entry',
						function(btn){
							if(btn==1){
								json = new Object;
								json['task'] = 'remove';
								json['prayer_id'] = pid;
								$.ajax({
									type: 'put',
									url: apiUrl + '/prayers/' + pid,
									dataType: 'json',
									data: json,
									headers: { 'iknow-api-key': $.jStorage.get('api_key') },
									success: function(){
										clickedBtn.html('Removed');
										//change my local version
										prayers = $.jStorage.get('prayers');
										newPrayers = new Object;
										$.each(prayers, function(i, p){
											if(p.id!=pid){
												newPrayers[i] = p;
											}
										});
										$.jStorage.deleteKey('prayers');
										$.jStorage.set('prayers', newPrayers);
										linkToPage('prayer');
									}
								});
							}else{
								clickedBtn.removeAttr('disabled');
								clickedBtn.html('Remove');
							}
						},
						'Are you sure?',
				        'Yes,No'
				    );
				});

				$('#thePrayerContent').hammer().on('tap', '.reportPraise', function(){
					var clickedBtn = $(this);
					$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
					$('.disabledCover').css('display', 'block');
					$('.disabledCover').css({
						'background-color': 'rgba(0,0,0,0.8)'
					},200);
					$('body').append('<div class="fullScreenOverlay paddedContent main-content-scroller postPraiseOverlay"></div>');
					$('.fullScreenOverlay').html('<div class="addPraiseContent"></div>');
					$('.addPraiseContent').html('<h4 class="text-info">Report Praise!</h4>');
					$('.addPraiseContent').append('<hr style="margin: 10px;">');
					$('.addPraiseContent').append('<h5 class="text-muted">Message:</h5>');
					$('.addPraiseContent').append('<textarea class="form-control message newpraise" style="height: 180px; margin-bottom: 10px;" data-field="content"></textarea>');
					$('.addPraiseContent').append('<button class="btn btn-block btn-success postPraiseSubmit">Post Praise</button>');
					$('.addPraiseContent').append('<button class="btn btn-block btn-warning cancelPraise">Cancel</button>');
					$('.addPraiseContent').hammer().off('tap', '.cancelPraise');
					$('.addPraiseContent').hammer().on('tap', '.cancelPraise', function(){
						$('.disabledCover').animate({
							'background-color': 'rgba(0,0,0,0)'
						},200, function(){
							$('.disabledCover').remove();
						});
						$('.postPraiseOverlay').fadeOut(300, function(){
							$('.postPraiseOverlay').remove();
						})
					});
					$('.addPraiseContent').hammer().off('tap', '.postPraiseSubmit');
					$('.addPraiseContent').hammer().on('tap', '.postPraiseSubmit', function(){
						clickedBtn = $(this);
						clickedBtn.attr('disabled', 'disabled');
						clickedBtn.html('<i class="fa fa-spin fa-spinner"></i>');
						prayers = $.jStorage.get('prayers');
						tmpHoldPrayers = new Object;
						e=0;
						$.each(prayers, function(i, pray){
							if(i!=key){
								tmpHoldPrayers[e] = pray;
								e++;
							}else{
								praisedPrayer = pray;
							}
						});
						PostObject = new Object;
						PostObject['content'] = $('.newpraise').val();
						$.ajax({
							type: 'post',
							url: apiUrl + '/prayers/' + praisedPrayer.id + '/praise',
							dataType: 'json',
							data: PostObject,
							headers: { 'iknow-api-key': $.jStorage.get('api_key') },
							success: function(response){

								content = $('.newpraise').val() + '<hr style="margin: 10px;"><div class="quotedPrayer">' + praisedPrayer.content + '</div>';
								additionalPray = new Object;
								additionalPray['title'] = 'Praise: ' + praisedPrayer.title;
								additionalPray['ppl_fname'] = praisedPrayer.ppl_fname;
								additionalPray['ppl_sname'] = praisedPrayer.ppl_sname;
								additionalPray['intercessing'] = true;
								additionalPray['mine'] = true;
								additionalPray['created_at'] = moment().format("YYYY-MM-DD HH:mm:ss");
								additionalPray['type'] = 'praise';
								additionalPray['content'] = content;
								additionalPray['id'] = response.id;

								newPrayersObj = new Object;
								newPrayersObj[0] = additionalPray;
								e = 1;
								$.each(tmpHoldPrayers, function(a, b){
									newPrayersObj[e] = b;
									e++;
								});
								$.jStorage.deleteKey('prayers');
								$.jStorage.set('prayers', newPrayersObj);
								$('.disabledCover').animate({
									'background-color': 'rgba(0,0,0,0)'
								},200, function(){
									$('.disabledCover').remove();
								});
								$('.postPraiseOverlay').fadeOut(300, function(){
									$('.postPraiseOverlay').remove();
									linkToPage('prayer');
								});

							},
							error: function(){

							}
						});
					});
				});
			},500);
		});
	});
	$('#main-content').hammer().off('tap', '.postPrayer');
	$('#main-content').hammer().on('tap', '.postPrayer', function(){
		$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
		$('.disabledCover').css('display', 'block');
		$('.disabledCover').css({
			'background-color': 'rgba(0,0,0,0.8)'
		},200);
		$('body').append('<div class="fullScreenOverlay paddedContent main-content-scroller postPrayerOverlay"></div>');
		$('.fullScreenOverlay').html('<div class="addPrayerContent"></div>');
		$('.addPrayerContent').html('<h4 class="text-info">Post a prayer request</h4>');
		$('.addPrayerContent').append('<hr style="margin: 10px;">');
		$('.addPrayerContent').append('<h5 class="text-muted">Title:</h5>');
		$('.addPrayerContent').append('<input class="form-control newprayer title" data-field="title" type="text" />');
		$('.addPrayerContent').append('<h5 class="text-muted">Prayer:</h5>');
		$('.addPrayerContent').append('<textarea class="form-control message newprayer" style="height: 180px; margin-bottom: 10px;" data-field="content"></textarea>');
		$('.addPrayerContent').append('<hr style="margin: 10px;">');
		$('.addPrayerContent').append('<h5 class="text-warning">Groups to share with:</h5>');
		my = $.jStorage.get('my');
		$.each(my.groups, function(i, group){
			$('.addPrayerContent').append('<div class="tickOption checked groupOption" data-groupid="' + group.id + '"><div class="checkIcon"><i class="fa fa-check-square-o"></i></div> <span class="checktitle">' + group.name + '</span></div>');
		});
		$('.addPrayerContent').append('<div class="tickOption groupOption" data-groupid="prayer_chain"><div class="checkIcon"><i class="fa fa-check-square-o"></i></div> <span class="checktitle">Church Prayer Chain</span></div>');
		$('.addPrayerContent').append('<div style="margin: 10px;"></div>');
		$('.addPrayerContent').append('<button class="btn btn-block btn-success postPrayerSubmit">Post Prayer</button>');
		$('.addPrayerContent').append('<button class="btn btn-block btn-warning cancelPrayer">Cancel</button>');

		$('.addPrayerContent').hammer().off('tap', '.cancelPrayer');
		$('.addPrayerContent').hammer().on('tap', '.cancelPrayer', function(){
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.disabledCover').remove();
			});
			$('.postPrayerOverlay').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.postPrayerOverlay').remove();
			});
		});

		$('.addPrayerContent').hammer().off('tap', '.postPrayerSubmit');
		$('.addPrayerContent').hammer().on('tap', '.postPrayerSubmit', function(){
			var er = 0;
			$('.addPrayerContent').find('.newprayer').each(function(){
				$(this).removeClass('fail');
				if($(this).val().length==0){
					$(this).addClass('fail');
					er++;
				}
			});
			groups = 0;
			$('.checked.groupOption').each(function(){
				groups++;
			});
			if(groups==0){
				er++;
				navigator.notification.alert(
		            'You need to post your prayer to at least one group',  // message
		            false,
		            'Probelm',
		            'OK'
		        );
			}
			if(er==0){
				$('body').append('<div class="disabledCover wait" style="line-height: ' + $(window).height() + 'px; z-index: 6000;"><i class="fa fa-spin fa-spinner"></i></div>');
				$('.wait').css('display', 'block');
				$('.wait').css({
					'background-color': 'rgba(0,0,0,0.8)'
				},200);
				json = new Object;
				groups = new Object;
				$('.checked.groupOption').each(function(){
					groups[$(this).attr('data-groupid')] = $(this).attr('data-groupid');
				});
				$('.addPrayerContent').find('.newprayer').each(function(){
					json[$(this).attr('data-field')] = $(this).val();
				});
				json['groups'] = groups;
				$.ajax({
					type: 'post',
					url: apiUrl + '/prayers',
					dataType: 'json',
					data: json,
					headers: { 'iknow-api-key': $.jStorage.get('api_key') },
					success: function(response){
						$('.disabledCover').animate({
							'background-color': 'rgba(0,0,0,0)'
						},200,function(){
							$('.disabledCover').remove();
						});
						$('.fullScreenOverlay').animate({
							'background-color': 'rgba(0,0,0,0)'
						},200,function(){
							$('.fullScreenOverlay').remove();
						});
						navigator.notification.alert(
				            'The prayer was posted :-)',  // message
				            false,
				            'Great!',
				            'Thanks'
				        );
				        $('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
						$('.disabledCover').css('display', 'block');
						$('.disabledCover').css({
							'background-color': 'rgba(0,0,0,0.8)'
						},200);
				        $.ajax({
							type: 'get',
							url: apiUrl + '/prayers',
							dataType: 'json',
							headers: { 'iknow-api-key': $.jStorage.get('api_key') },
							success: function(response){
								$.jStorage.deleteKey('prayers');
								$.jStorage.set('prayers', response.data.prayers);
								$('.disabledCover').animate({
									'background-color': 'rgba(0,0,0,0)'
								},200, function(){
									$('.disabledCover').remove();
								});
								linkToPage('prayer');
							}
						});
					},
					error: function(){

					}
				});
			}
		});

	});
}

function tmp_page_prayer(){
	var tmp = [
		'<div class="main-content-scroller" id="thePrayerContent">' +
			'<div>' + 
				'<div id="showPrayer" class="paddedContent">' + 
					'<div class="alert alert-info">' +
						'Post prayer requests and praise reports to your groups, and pray for others.' + 
					'</div>' +
					'<button class="btn btn-block btn-warning postPrayer">Post A Prayer</button>' + 
				'</div>' + 
				'<div id="listPrayers"></div>' + 
			'</div>' + 
		'</div>'
	];
	return tmp.join(" ");
}

function build_church(){
	addTitle('My church');
	my = $.jStorage.get('my');
	groups = my.groups;
	teams = my.teams;
	var i = 0;
	$.each(groups, function(a, b){
		html = '<div class="rowOptionSingle"><span>' + b.name + '</span></div>';
		$('.showMyGroups').append(html);
		i++;
	});
	if(i==0){
		$('.showMyGroups').html('<div class="nts">you aren\'t in any groups</div>');
	}
	var i = 0;
	$.each(teams, function(a, b){
		var rotas = Object.keys(b.rota_events).length;
	//	var rotas = b.rota_events.length;
		if(rotas>0){
			addClass = 'teamRow';
		}else{
			addClass = '';
		}
		html = '<div class="rowOptionSingle ' + addClass + '" data-team="' + a + '"><span>' + b.name + ' <small>(' + b.campus_abbr + ')</small></span><span class="rightSideIcon"><span class="badge" style="font-size:7pt;">' + rotas + '</span></div>';
		
		$('.showMyTeams').append(html);
		i++;
	});
	if(i==0){
		$('.showMyTeams').html('<div class="nts">you aren\'t in any teams</div>');
	}
	$('#theChurchContent').hammer().off('tap', '.teamRow');
	$('#theChurchContent').hammer().on('tap', '.teamRow', function(){
		var team_id = $(this).attr('data-team');
		$('.theChurchContentInner').fadeOut(200, function(){
			$('.theChurchContentInner').html('');
			var rotas = teams[team_id]['rota_events'];
			$.each(rotas, function(a, b){
				$('.theChurchContentInner').append('<div class="rowOptionSingle rotaOption" data-event="' + b.event_id + '"><span><i class="fa fa-calendar"></i> ' + b.event_name + '</span><span class="rightSideIcon"><i class="fa fa-chevron-right"></i></span></div>');
			});
			$('.theChurchContentInner').fadeIn(200);
			$('.theChurchContentInner').hammer().off('tap', '.rotaOption');
			$('.theChurchContentInner').hammer().on('tap', '.rotaOption', function(){
				var event_id = $(this).attr('data-event');
				loadRota(team_id, event_id);
			});
		});
	});
	$('#theChurchContent').hammer().off('tap', '.joina');
	$('#theChurchContent').hammer().on('tap', '.joina', function(){
		//open the join overlay
		var type = $(this).attr('data-field');
		$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
		$('.disabledCover').css('display', 'block');
		$('.disabledCover').css({
			'background-color': 'rgba(0,0,0,0.8)'
		},200);
		$('body').append('<div class="fullScreenOverlay paddedContent main-content-scroller joinaoverlay"></div>');
		$('.joinaoverlay').html('<div class="joinacontent"></div>');
		$('.joinacontent').append('<h4 class="text-info">Joining a ' + type + '</h4>');
		$('.joinacontent').append('<hr style="margin: 10px;" />');
		$('.joinacontent').append('<hh5 class="text-muted">Do you have any preferences?</h4>');
		$('.joinacontent').append('<textarea class="form-control joinaPreferences" style="height: 180px;"></textarea>');
		$('.joinacontent').append('<hr style="margin: 10px;" />');
		$('.joinacontent').append('<button class="btn btn-block btn-info submitJoina">Send Request!</button>');
		$('.joinacontent').append('<button class="btn btn-block btn-danger cancelJoina">Cancel</button>');
		$('.joinacontent').hammer().off('tap', '.cancelJoina');
		$('.joinacontent').hammer().on('tap', '.cancelJoina', function(){
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.disabledCover').remove();
			});
			$('.joinaoverlay').fadeOut(200, function() {
				$('.joinaoverlay').remove();
			})
		});
		$('.joinacontent').hammer().off('tap', '.submitJoina');
		$('.joinacontent').hammer().on('tap', '.submitJoina', function(){
			navigator.notification.alert(
	            'Your request has been sent\n\nWe\'ll be in contact shortly',
	            false,
	            'Sent',
	            'OK'
	        );
	        load = new Object;
	        load['message'] = $('.joinaPreferences').val();
	        load['type'] = type;
	        data = new Object;
	        data['data'] = load;
	        $.ajax({
				type: 'post',
				url: apiUrl + '/app/involvements',
				dataType: 'json',
				data: data,
				headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			});
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.disabledCover').remove();
			});
			$('.joinaoverlay').fadeOut(200, function() {
				$('.joinaoverlay').remove();
			});
		});
	});	
}
function tmp_page_church(){
	var tmp = [
		'<div class="main-content-scroller" id="theChurchContent">' +
			'<div class="theChurchContentInner">' +
				'<div class="paddedContent">' +
					'<div class="loggedOutSide">' + 
						'<button class="btn btn-info btn-block joina" data-field="group">Join A Group</button>' +
					'</div>' + 
					'<div class="loggedOutSide">' + 
						'<button class="btn btn-info btn-block joina" data-field="team">Join A Team</button>' +
					'</div>' + 
					'<div style="clear:both"></div>' + 
				'</div>' + 
				'<div>' + 
					'<div class="list-separator">My Teams</div>' +
					'<div class="showMyTeams rowOptionSingleCont"></div>' +
					'<div class="list-separator">My Groups</div>' +
					'<div class="showMyGroups rowOptionSingleCont"></div>' + 
				'</div>' +
			'</div>' +  
		'</div>'
	];
	return tmp.join(" ");
}
function loadRota(team_id, event_id){
	//get the team name and event title
	var my = $.jStorage.get('my');
		teams = my.teams;
		team = teams[team_id];
		name = team['name'];
		even = team['rota_events'][event_id]['event_name'];
	$('body').append('<div class="viewRotaOverlay" style="display:none"></div>');
	$('body').append('<div class="swipeInstructionBlack" style="display:none"><div class="swipeInstructionBlackInner"></div></div>');
	var html = 	'<div class="rotaTopDate"><h4 class="text-info">' + name + '</h4></div>' +
				'<div class="rotaTopDate" style="top: 20px;"><h4 class="text-info">' + even + '</h4></div>' +
				'<div class="rotaWindow" id="rotaWindow"><div class="rotaInnerScroll"><ul id="rotaWindowUl"><div class="bigSpinner"><i class="fa fa-spinner fa-spin"></i></div></ul></div></div>' +
				'<div class="rotaTopBtn"><button class="btn btn-block btn-warning closeRota">Close Rota</button></button></div>';
	$('.viewRotaOverlay').html(html);
	$('.viewRotaOverlay').fadeIn(200);
	$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
	$('.disabledCover').css('display', 'block');
	$('.disabledCover').css({
		'background-color': 'rgba(0,0,0,0.8)'
	},200);
	$('.viewRotaOverlay').hammer().off('tap', '.closeRota');
	$('.viewRotaOverlay').hammer().on('tap', '.closeRota', function(){
		$('.viewRotaOverlay').fadeOut(200, function(){
			$('.viewRotaOverlay').remove();
		});
		$('.disabledCover').animate({
			'background-color': 'rgba(0,0,0,0)'
		},200, function(){
			$('.disabledCover').remove();
		});
	});
	$.ajax({
		type: 'get',
		url: apiUrl + '/teams/' + team_id + '/rotas/' + event_id,
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(rotas){
			var days = 0;
			$('#rotaWindowUl').html('');
			$.each(rotas.data, function(a, b){
				//create the rota view
				var html = 	new Array;
					html.push('<table class="table table-striped tabletiny table-condensed"><tbody>');
					$.each(b.roles, function(role, people){
						html.push('<tr>');
							html.push('<td style="width:40%; white-space: nowrap; text-overflow:ellipsis; overflow: hidden;">' + role + '</td>');
							html.push('<td style="width:60%; white-space: nowrap; text-overflow:ellipsis; overflow: hidden;">');
								$.each(people, function(i, p){
									html.push('<div class="rotaPerson">' + p.ppl_fname + ' ' + p.ppl_sname  + '</div>');	
								});
							html.push('</td>');
						html.push('</tr>');
					});
				html.push('</tbody></table>');
				html = html.join(' ');
				template = 	'<li class="rotaDay">' + 
								'<div class="rotaViewDate"><h4 class="text-muted">' + moment(b.date).format('dddd Do MMMM') + '</h4></div>' +
								'<div class="rotaViewHead">' +
									'<table class="table tabletiny"><thead><tr><th style="width:40%; white-space: nowrap; text-overflow:ellipsis; overflow: hidden;">Role</th><th style="width:60%; white-space: nowrap; text-overflow:ellipsis; overflow: hidden;">People</th></tr></table>' +
								'</div>' +
								'<div class="daywindow">' +
									'<div class="main-content-scroller">' +
										'<div>' + html + '</div>' +
									'</div>'+
								'</div>'+
							'</li>';
				$('#rotaWindowUl').append(template);
				days++;
			});
			if(days>0){
				var theWidth = ($(window).width()-12);
				$('.rotaInnerScroll').width(theWidth*days);
				$('.rotaDay').width(theWidth);
				$('.rotaWindow').hammer().off('swipe', '.rotaInnerScroll');
				$('.rotaWindow').hammer().on('swipe', '.rotaInnerScroll', function(event){
					var direction = event.gesture.direction;
					var currentMargin = parseInt($('.rotaInnerScroll').css('margin-left'));
					var min = 0-($('.rotaInnerScroll').width()-theWidth);
					if(direction=='left'){
						newMargin = currentMargin-theWidth;
					}else if(direction=='right'){
						newMargin = currentMargin+theWidth;
					}
					if(newMargin>=0){
						newMargin = 0;
					}else if(newMargin<=min){
						newMargin = min;
					}
					$('.rotaInnerScroll').animate({
						'margin-left': newMargin
					}, 200);
				});

				if(!$.jStorage.get('rotaSwipeInstruction')){
					var min = 0-($('.rotaInnerScroll').width()-theWidth)
					$('.rotaInnerScroll').css('margin-left', min);
					$('.swipeInstructionBlackInner').addClass('rotated');
					$('.rotaInnerScroll').animate({
						'margin-left': 0
					}, 500);
				}
			}else{
				$('#rotaWindowUl').html('<div class="nts">no rota events available for this team</div>');
			}
		}
	});
}

function build_settings(){
	addTitle('App Settings');
	$('.settingsContent').hammer().off('tap', '.resetApp');
	$('.settingsContent').hammer().on('tap', '.resetApp', function(){
		navigator.notification.confirm(
	        'This will log you out and remove any temporary data in the app.',
	        function(btn){
	        	if(btn==1){
	        		$.jStorage.flush();
	        		setTimeout(function(){
	        			setInitialVars();
	        			canISetUp();
	        		}, 100);
	        	}
	        },
	        'Are you sure?',
	        'Yes,No'
	    );
	});
	$('.settingsContent').hammer().off('tap', '.saveSettings');
	$('.settingsContent').hammer().on('tap', '.saveSettings', function(){
		btn = $(this);
		$(this).attr('disabled', 'disabled');
		$(this).html('<i class="fa fa-spin fa-spinner"></i>');
		newSettings = new Object;
		$('.preferences').each(function(){
			newSettings[$(this).attr('data-field')] = $(this).val();	
		});
		prefs = $.jStorage.get('appPref');
		prefs['push'] = newSettings;
		post = new Object;
		post['data'] = prefs;
		$.jStorage.get('appPref', prefs);
		$.ajax({
			type: 'put',
			url: apiUrl + '/app/settings',
			dataType: 'json',
			data: post,
			headers: { 'iknow-api-key': $.jStorage.get('api_key') },
			success: function(hols){
				$.jStorage.get('appPref', prefs);
				setTimeout(function(){
					btn.removeAttr('disabled');
					btn.html('Saved!');
					setTimeout(function(){
						btn.html('Save');
					},1500);
				}, 500);
			},
			error: function(){
				setTimeout(function(){
					btn.removeAttr('disabled');
					btn.html('Error');
					setTimeout(function(){
						btn.html('Save');
					},1500);
				}, 500);
			}
		});
	});
	var schedpush = new Object;
		schedpush['1h'] = '1 Hour Before';
		schedpush['3h'] = '3 Hour Before';
		schedpush['eb'] = 'Evening Before';
		schedpush['2d'] = '2 Days Before';
		schedpush['3d'] = '3 Days Before';
		schedpush['n'] = 'Never';
	$.each(schedpush, function(a, b){
		$('.schedpush').append('<option value="' + a + '">' + b + '</option>');
	});
	var instpush = new Object;
		instpush['1'] = 'Tell Me';
		instpush['0'] = 'Don\'t Tell me';
	$.each(instpush, function(a, b){
		$('.instpush').append('<option value="' + a + '">' + b + '</option>');
	});
	prefs = $.jStorage.get('appPref');
	pushPrefs = prefs['push'];
	$.each(pushPrefs, function(a, b){
		$('.' + a).val(b);
	});
}
function tmp_page_settings(){
	var tmp = [
		'<div class="main-content-scroller">' + 
			'<div class="paddedContent settingsContent">' +  
				'<h4 class="text-info">Push Notification Settings</h4>' +
				'<h5 class="text-muted">Rota Reminders</h5>' + 
				'<select class="form-control preferences rota schedpush" data-field="rota"></select>' +
				'<h5 class="text-muted">Connect Groups</h5>' + 
				'<select class="form-control preferences group schedpush" data-field="group"></select>' +
				'<h5 class="text-muted">Campus Events</h5>' + 
				'<select class="form-control preferences cal schedpush" data-field="cal"></select>' +
				'<h5 class="text-muted">Birthdays</h5>' + 
				'<select class="form-control preferences birth schedpush" data-field="birth"></select>' +
				'<h5 class="text-muted">Invited Events</h5>' + 
				'<select class="form-control preferences ievents schedpush" data-field="ievents"></select>' +
				'<h5 class="text-muted">New Prayer</h5>' + 
				'<select class="form-control preferences newprayer instpush" data-field="newprayer"></select>' +
				'<h5 class="text-muted">New Intercessor (my prayers)</h5>' + 
				'<select class="form-control preferences newintercessor instpush" data-field="newintercessor"></select>' +
				'<h5 class="text-muted">New Podcast</h5>' + 
				'<select class="form-control preferences newpodcast instpush" data-field="newpodcast"></select>' +
				'<hr style="margin: 10px;" />' + 
				'<button class="btn btn-block btn-success saveSettings">Save</button>' +
			'</div>' + 
		'</div>'
	];
	return tmp.join(" ");
}

function build_holidays(){
	$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
	$('.disabledCover').css('display', 'block');
	$('.disabledCover').css({
		'background-color': 'rgba(0,0,0,0.8)'
	},200);
	addTitle('My Availability');
	$.ajax({
		type: 'get',
		url: apiUrl + '/account/holidays',
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(hols){
			//first fill all the select options in
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.disabledCover').remove();
			});
			if(hols.status==true){
				$.each(hols.data.holidays, function(i, hol){
					var start = moment(hol.hp_start, "YYYY-MM-DD").format('ddd Do MMM YYYY');
					var end = moment(hol.hp_finish, "YYYY-MM-DD").format('ddd Do MMM YYYY');
					html = new Array;
					html.push('<div class="rowOptionSingle holid' + hol.hp_id + '">');
						html.push('<div style="width: 30px; font-size: 16pt;">');
							html.push('<i class="fa fa-plane"></i>');
						html.push('</div>');
						html.push('<div class="rowOptionTitle"><p>' + hol.hp_title + '</p><p class="listSubHead">' + start + ' ~ ' + end + '</p></div>');
						html.push('<div class="rowOptionBig removeHoliday" data-holid="' + hol.hp_id + '"><p class="big"><i class="fa fa-trash-o"></i></p><p class="blabel">Remove</p></div>');
					html.push('</div>');
					html = html.join(' ');
					$('#showMyHolidays').append(html);
				});
			}
		},
		error: function(){

		}
	});
	$('#main-content').hammer().off('tap', '.removeHoliday');
	$('#main-content').hammer().on('tap', '.removeHoliday', function(){
		var holid = $(this).attr('data-holid');
		navigator.notification.confirm(
	        'Do you really want to remove this reserved period?',
	        function(btn){
	        	if(btn==1){
	        		//removing hol
	        		$('.holid' + holid).find('.fa-trash-o').addClass('fa-spin');
	        		$('.holid' + holid).find('.fa-trash-o').addClass('fa-spinner');
	        		$('.holid' + holid).find('.fa-spinner.fa-spin').removeClass('fa-trash-o');
	        		$.ajax({
						type: 'delete',
						url: apiUrl + '/account/holidays/' + holid,
						dataType: 'json',
						headers: { 'iknow-api-key': $.jStorage.get('api_key') },
						success: function(data){
						//	$('.holid' + data.id).fadeOut(200, function(){$('.holid' + data.id).remove();});
							$('.holid' + data.id).animate({
								'height': 0,
								'margin-top': 0,
								'padding-top': 0,
								'margin-bottom': 0,
								'padding-bottom': 0,
								'opacity': 0
							}, 200, function(){
								$('.holid' + data.id).remove();
							});
						},
						error: function(){

						}
					});
	        	}
	        },
	        'Are you sure?',
	        'Yes,No'
	    );
	});
	$('#main-content').hammer().off('tap', '.addHoliday');
	$('#main-content').hammer().on('tap', '.addHoliday', function(){
		$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"></div>');
		$('.disabledCover').css('display', 'block');
		$('.disabledCover').css({
			'background-color': 'rgba(0,0,0,0.8)'
		},200);
		$('body').append('<div class="fullScreenOverlay paddedContent main-content-scroller addHolOverlay"></div>');
		$('.fullScreenOverlay').html('<div class="addHolContent"></div>')
		$('.addHolContent').html('<h4 class="text-info">Add a reserved period</h4>');
		$('.addHolContent').append('<hr style="margin: 10px;">');
		$('.addHolContent').append('<h5 class="text-muted">Description:</h5>');
		$('.addHolContent').append('<input class="form-control holdetails" data-field="title" type="text" />');
		$('.addHolContent').append('<h5 class="text-muted"><small>Start Date</small></h5>');
		$('.addHolContent').append('<div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control holdetails startDD" data-field="startDD"><option>DD</option></select></div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control startMM holdetails" data-field="startMM"><option>MM</option></select></div><div style="display:inline-block; width: 40%; padding: 2px; -webkit-box-sizing: border-box;"><input type="tel" class="form-control holdetails startYYYY" data-field="startYYYY" value="' + moment().format('YYYY') + '" /></div><div style="clear:both">&nbsp;</div></div>');
		$('.addHolContent').append('<h5 class="text-muted"><small>Finish Date</small></h5>');
		$('.addHolContent').append('<div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control holdetails finishDD" data-field="finishDD"><option>DD</option></select></div><div style="display:inline-block; width: 30%; padding: 2px; -webkit-box-sizing: border-box;"><select class="form-control finishMM holdetails" data-field="finishMM"><option>MM</option></select></div><div style="display:inline-block; width: 40%; padding: 2px; -webkit-box-sizing: border-box;"><input type="tel" class="form-control holdetails finishYYYY" data-field="finishYYYY" value="' + moment().format('YYYY') + '" /></div><div style="clear:both">&nbsp;</div></div>');
		$('.addHolContent').append('<button class="btn btn-block btn-success saveHoliday">Save</button>');
		$('.addHolContent').append('<button class="btn btn-block btn-warning cancelHoliday">Cancel</button>');
		for (var i=1;i<32;i++){
			$('.startDD').append('<option value="' + i + '">' + i + '</option>');
			$('.finishDD').append('<option value="' + i + '">' + i + '</option>');
		}
		for (var i=1;i<13;i++){
			if(i<10){
				e = '0' + i;
			}else{
				e = i;
			}
			$('.finishMM').append('<option value="' + e + '">' + e + '</option>');
			$('.startMM').append('<option value="' + e + '">' + e + '</option>');
		}	
		$('.addHolContent').hammer().off('tap', '.cancelHoliday');
		$('.addHolContent').hammer().on('tap', '.cancelHoliday', function(){
			$('.addHolOverlay').fadeOut(200, function(){$('.addHolOverlay').remove()});
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){$('.disabledCover').remove()});
		});

		$('.addHolContent').hammer().off('tap', '.saveHoliday');
		$('.addHolContent').hammer().on('tap', '.saveHoliday', function(){
			var er = 0;
			var msg = null;
			$('.holdetails').removeClass('fail');
			if($('[data-field="title"]').val().length==0){
				er++;
				$('[data-field="title"]').addClass('fail');
			}
			if($('.startDD').val()=='DD'){
				er++;
				$('.startDD').addClass('fail');
			}
			if($('.finishDD').val()=='DD'){
				er++;
				$('.finishDD').addClass('fail');
			}
			if($('.finishMM').val()=='MM'){
				er++;
				$('.finishMM').addClass('fail');
			}
			if($('.startMM').val()=='MM'){
				er++;
				$('.startMM').addClass('fail');
			}
			if($('.startYYYY').val().length==0){
				er++;
				$('.startYYYY').addClass('fail');
			}
			if($('.finishYYYY').val().length==0){
				er++;
				$('.finishYYYY').addClass('fail');
			}
			if(er==0){
				if(moment($('.finishYYYY').val()+$('.finishMM').val()+$('.finishDD').val(), 'YYYYMMDD').isBefore()){
					er++;
					msg = 'Your end date is before now';
				}else if(moment($('.finishYYYY').val()+$('.finishMM').val()+$('.finishDD').val(), 'YYYYMMDD').isBefore(moment($('.startYYYY').val()+$('.startMM').val()+$('.startDD').val(), 'YYYYMMDD'))){
					er++;
					msg = 'Your end date before is your start date';
				}
			}
			if(er==0){
				$('body').append('<div class="disabledCover wait" style="line-height: ' + $(window).height() + 'px; z-index: 6000;"><i class="fa fa-spin fa-spinner"></i></div>');
				$('.wait').css('display', 'block');
				$('.wait').css({
					'background-color': 'rgba(0,0,0,0.8)'
				},200);
				post = new Object;
				$('.holdetails').each(function(i, deet){
					post[$(this).attr('data-field')] = $(this).val();
				});
				$.ajax({
					type: 'post',
					url: apiUrl + '/account/holidays',
					dataType: 'json',
					data: post,
					headers: { 'iknow-api-key': $.jStorage.get('api_key') },
					success: function(data){
						$('.wait').animate({
							'background-color': 'rgba(0,0,0,0)'
						},200, function(){
							$('.wait').remove();
						});
						if(data.id!=null){
							$('.addHolOverlay').fadeOut(200, function(){$('.addHolOverlay').remove()});
							$('.disabledCover').animate({
								'background-color': 'rgba(0,0,0,0)'
							},200, function(){
								$('.disabledCover').remove();
								linkToPage('holidays');
							});
						}else{
							 navigator.notification.alert(
					            'Please check the details again',  // message
					            false,
					            'Probelm',
					            'OK'
					        );
						}
					},
					error: function(){
						$('.wait').animate({
							'background-color': 'rgba(0,0,0,0)'
						},200, function(){
							$('.wait').remove();
						});
						 navigator.notification.alert(
				            'Please check the details again',  // message
				            false,
				            'Probelm',
				            'OK'
				        );
					}
				});
			}else{
				if(msg!=null){
					navigator.notification.alert(
			            msg,  // message
			            false,
			            'Probelm',
			            'OK'
			        );
				}
			}
		});
	});
}
function tmp_page_holidays(){
	var tmp = [
		'<div class="main-content-scroller">' +
			'<div>' +
				'<div class="paddedContent">' + 
					'<div class="alert alert-info">' + 
						'Here you can add any dates you are unavailable to serve on a rota.' + 
					'</div>' + 
					'<button class="btn-block btn-warning btn addHoliday">Add Reserved Period</button>' + 
				'</div>' +
				'<div id="showMyHolidays"></div>' + 
			'</div>' + 
		'</div>'
	];
	return tmp.join(" ");
}

function build_about(){
	addTitle('About This App');
	info = $.jStorage.get('info');
	if(info.about_text.length>0){
		$('#showCustomAbout').html('<div class="text-area shaded">' + info.about_text + '</div>');
	}
	$('.poweredBy').append(info.powered_text);
	$('.main-content-scroller').hammer().off('tap', '#tweetShareBtn');
	$('.main-content-scroller').hammer().on('tap', '#tweetShareBtn', function(){
		$(this).html('Tweeting...');
		btn = $(this);
		tweet = info.share_tweet;
		window.plugins.socialsharing.shareViaTwitter(tweet);
		setTimeout(function(){
			btn.html('<i class="fa fa-twitter-square"></i> Tweet About It!');
		}, 2000);
	});
}
function tmp_page_about(){
	var tmp = [
		'<div class="main-content-scroller">' +
			'<div>' +
				'<div class="text-area shaded poweredBy">' +
					
				'</div>' +
				'<div id="showCustomAbout"></div>'+
				'<div class="text-area">' + 
					'<button class="btn btn-block btn-info" style="background-color:#3a92c8" id="tweetShareBtn"><i class="fa fa-twitter-square"></i> Tweet About It!</button>' +
				'</div>' + 
				'<div class="text-area">' + 
					'<p><strong>App ID:</strong> ' + globJson.init.app_name + '</p>' + 
					'<p><strong>App Version:</strong> ' + globJson.init.app_version + '</p>' + 
					'<p><strong>API Version:</strong> ' + globJson.init.api_version + '</p>' + 
				'</div>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function build_socialfeed(){
	addTitle('Social Feed');
	$('#socialfeed-container').html('');
	mediaarray = $.jStorage.get('media');
	$.each(mediaarray, function(i, entry){
		context = {};
		context.width = $(window).width()-80;
		context.thumb = entry.author.image;
		htmlcontent = null;
		if(entry.type=='twitter'){
			context.icon = 'fa fa-twitter-square';
			context.title = '<span class="socialfeed-firsttitle">' + entry.author.name + '</span> <span class="socialfeed-secondtitle">@' + entry.author.id + '</span>';
			htmlcontent = parseTweet(entry.content.content);
		}else if(entry.type=='vimeo'){
			context.icon = 'fa fa-vimeo-square ';
			context.title = '<span class="socialfeed-firsttitle">' + entry.author.name + '</span>';
			htmlcontent = entry.content.content;
		}else if(entry.type=='instagram'){
			context.icon = 'fa fa-instagram';
			context.title = '<span class="socialfeed-firsttitle">' + entry.author.name + '</span>';
			htmlcontent = entry.content.content;
		}else if(entry.type=='youtube'){
			context.icon = 'fa fa-youtube-square';
			context.title = '<span class="socialfeed-firsttitle">' + entry.author.name + '</span>';
			htmlcontent = entry.content.content;
		}else if(entry.type=='facebook'){
			context.icon = 'fa fa-facebook-square';
			context.title = '<span class="socialfeed-firsttitle">' + entry.author.name + '</span>';
			htmlcontent = entry.desc;
		}else{
			context.icon = 'fa fa-question-circle';
		}
		time = entry.date;
		momen = moment(time, 'YYYY-MM-DD HH:mm:ss');
		nw = moment();
		seconds = nw.diff(momen, 'seconds');
		num = null;
		unit = null;
		if(seconds>(86400*31)){
			//diff in months
			num = nw.diff(momen, 'months');
			unit = 'mo';
		}else if(seconds>(86400*8)){
			//diff in weeks
			num = nw.diff(momen, 'weeks');
			unit = 'w';
		}else if(seconds>(86400)){
			//diff in days
			num = nw.diff(momen, 'days');
			unit = 'd';
		}else if(seconds>3600){
			//diff in hours
			num = nw.diff(momen, 'hours');
			unit = 'h';
		}else if(seconds>60){
			//dif in minutes
			num = nw.diff(momen, 'minutes');
			unit = 'm';
		}else{
			//diff in seconds
			num = seconds;
			unit = 's';
		}
		context.timeago = num + unit;
		htmlimages = '';
		if(typeof entry.media != 'undefined'){
			if(entry.media.length>0){
				htmlimages = '<div style="text-align:center">';
				$.each(entry.media, function(a,bmedia){
					if(bmedia.type=='photo'){
						htmlimages += '<span class="leaveapplink" data-href="' + bmedia.link + '"><img src="' + bmedia.url + '" class="socialfeed-embeddedimage" /></span><br>';
					}else if(bmedia.type=='openVideo'){
						htmlimages += '<img src="' + bmedia.thumb + '" class="socialfeed-embeddedimage openvideo" data-video="' + bmedia.url + '"/><br><span class="nts">tap to play</span>';
					}
				});
				htmlimages += '</div>';
			}
		}
		
		context.content = htmlcontent + htmlimages;
		html = socialFeedTemplate(context);
		$('#socialfeed-container').append(html);
		$('#socialfeed-container').hammer().off('tap', '.openvideo');
		$('#socialfeed-container').hammer().on('tap', '.openvideo', function(){
			video = $(this).attr('data-video');
			width = $(this).width();
			height = $(this).height();
			var newvid = $('<video width="' + width + '" height="' + height + '" class="socialfeed-embeddedimage"/>');
				newvid.append('<source src="' + video + '" >');
			$(this).replaceWith(newvid);
		});
	});
}

function tmp_page_socialfeed(){
	var tmp = [
		'<div class="main-content-scroller">' +
			'<div>' +
				'<div id="socialfeed-container"></div>' + 
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}



//resuabled mega plates
function tmp_reuse_socialentry(){
	var tmp = [
		'<div class="socialfeed-entry">' +
			'<div class="socialfeed-top">' + 
				'<div class="socialfeed-top-left"><img src="{{thumb}}" class="socialfeed-top-image" /></div>' + 
				'<div class="socialfeed-top-mid" style="width:{{width}}px"><div class="socialfeed-title">{{{title}}}</div><div class="socialfeed-maincontent">{{{content}}}</div></div>' + 
				'<div class="socialfeed-top-right"><div style="margin-top: 10px;"><i class="{{icon}}"></i><br><span class="timeago">{{timeago}}</span></div></div>' + 
				'<div style="clear:both"></div>' + 
			'</div>' +
			'<div class="socialfeed-hr"></div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_notification(){
	var tmp = [
		'<div class="notificationCont {{type}} {{class}} {{showing}}">' +
			'<div class="notification">' +
				'<div class="noteIcon"><i class="fa {{icon}}"></i></div>' +
				'<div class="noteTitle">{{title}}</div>' +
				'<div class="noteDescription">{{description}}</div>' +
				'<div class="noteDate">{{date}}}</div>' +
				'<div class="noteDays">{{quantity}}</div>' +
				'<div class="noteDaysLabel">{{units}}</div>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_block(){
	var tmp = [
		'<div class="appmod appmod-{{style}}">' +
			'<div class="appmod-heading">' +
				'<h3 class="appmod-title">{{title}}</h3>' +
			'</div>' +
			'<div class="appmod-body">{{{data}}}</div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_blockCont(){
	var tmp = [
		'<div class="appmod appmod-{{style}}">' +
			'<div class="appmod-heading">' +
				'<h3 class="appmod-title">{{title}}</h3>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_infolist(){
	var tmp = [
		'<div class="list-group"></div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_infolistindv(){
	var tmp = [
		'<a href="#" class="list-group-item {{actionClass}}" data-id="{{id}}" data-blogId="{{blogId}}" data-blogType="{{blogType}}">' + 
			'<h4 class="list-group-item-heading"><i class="fa fa-circle read{{read}}"></i> {{name}}</h4>' +
			'<p class="list-group-item-text">{{shortened}}</p>' + 
		'</a>'
	];
	return tmp.join(" ");
}
function tmp_reuse_bigText(){
	var tmp = [
		'<div class="main-content-scroller" id="blogScroll">' + 	
			'<div class="bigText">' + 
				'<button class="btn btn-block btn-info backToHome" data-backto="{{backTo}}" data-backtoscroll="{{backToScroll}}">Back To Home</button>' + 
				'<h4>{{title}}</h4>' +
				'<h5 class="headSubtitle">{{subTitle}} <span style="font-size: 9pt">({{subTitleExtra}})</span></h5>' +
				'<hr style="margin:5px;" />' +
				'<div class="bigTextMainContent">{{{body}}}</div>' + 
			'</div>' + 
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_votd(){
	var tmp = [
		'<div class="appmod appmod-{{style}}">' +
			'<div class="appmod-heading">' +
				'<h3 class="appmod-title">{{title}}</h3>' +
			'</div>' +
			'<div class="appmod-body">' + 
				'<p class="votd-passage">{{data.passage}}</p>' +
				'<p class="votd-title">~ {{data.title}}</p>' +
				'<p class="votd-provider">{{data.provider}}</p>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function tmp_reuse_podcastTrackList(){
	var tmp = [
		'<div class="ptl-top">' +
			'<img src="{{series_image}}" class="ptl-image">' +
			'<div class="ptl-info">' + 
				'<h5>{{series_title}}</h5>' + 
				'<h6>{{count_podcasts}} Episodes</h5>' + 
				'<button class="btn btn-warning btn-xs closePodcastBack" style="width: 100px;">Close</button>' + 
			'</div>' + 
		'</div>' +
		'<hr style="margin: 10px;" />' + 
		'<div id="ptl-list-cont" class="main-content-scroller"><div class="ptl-list"><div class="centeredLoader"><i class="fa fa-spin fa-spinner"></i></div></div></div>'
	];
	return tmp.join(" ");
}

function loggedOutTemp(){
	var tmp = [
		'<div class="loggedOutCont" style="margin: -6px; margin-bottom: 6px;">' +
			'<div class="loggedOutSide">' + 
				'<button class="btn btn-info btn-block subscribeOption">I\'m New Here</button>' +
			'</div>' + 
			'<div class="loggedOutSide">' + 
				'<button class="btn btn-warning btn-block loginOption">Log In</button>' +
			'</div>' + 
			'<div style="clear:both"></div>' + 
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_podcastStream(){
	var tmp = [
		'<div class="podcastStreamOption" data-stream="{{sid}}">' +
			'<div class="podcastStreamFull">' + 
				'<div class="podcastStreamLeft">' + 
					'<img src="{{image}}" class="img-circle" style="width: 70px; height: 70px; border: 5px solid white; border-top-left-radius: 0px;">' +
				'</div>' + 
				'<div class="podcastStreamRight">' +
					'<h5>{{series_title}}</h5>' + 
					'<h6>{{date_range}}</h6>' +
				'</div>' +
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}
function tmp_reuse_podcastEpisode(){
	var tmp = [
		'<div class="podcastEpisodeRow">' +
			'<div class="podcastRowTop" data-url="{{url}}">' +	
				'<div class="podcastRowButton"><i class="fa fa-play-circle-o"></i></div>' + 
				'<div class="podcastRowTitle">{{title}}</div>' +
				'<div class="podcastRowShow" data-stat="closed"><i class="fa fa-chevron-down"></i></div>' +
			'</div>' + 
			'<div class="podcastDescription">' +
				'<div class="innerHeight">' + 
					'<div class="nts">{{title}}</div>' +
					'<div class="nts">{{author}}</div>' +
					'<div class="nts">{{description}}</div>' +	
				'</div>' + 
			'</div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function tmp_page_live(){
	var tmp = [
		'<div id="champs_player"><div class="content clearfix"><div id="svp_player7dewna4ksb0o" style="width:736px;height:414px;position:relative;left:-21px;top:-20px"><object type="application/x-shockwave-flash" id="svp_svp_player7dewna4ksb0o" name="svp_svp_player7dewna4ksb0o" data="http://play.webvideocore.net/player3.swf" width="736" height="414" style="visibility: visible; display: block;"><param name="quality" value="high"><param name="wmode" value="direct"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="LOOP" value="false"><param name="swLiveConnect" value="true"><param name="bgcolor" value="#FFFFFF"><param name="flashvars" value="clip_id=7dewna4ksb0o&amp;player_color1=#c8c8c8&amp;player_color=#a6a6a6&amp;transparent=false&amp;pause=1&amp;repeat=&amp;amp;bg_color=#FFFFFF&amp;fs_mode=2&amp;no_fullscreen=0&amp;no_controls=&amp;start_img=0&amp;start_volume=100&amp;close_button=&amp;brand_new_window=1&amp;auto_hide=1&amp;prebuffer=&amp;stretch_video=&amp;player_align=NONE&amp;offset_x=&amp;offset_y=&amp;bg_transp=&amp;player_color_ratio=0.6&amp;skinAlpha=50&amp;colorBase=#555555&amp;colorIcon=#ffffff&amp;colorHighlight=#777777&amp;direct=true&amp;color=#a6a6a6&amp;color1=#c8c8c8&amp;color_ratio=0.6&amp;autoHide=1&amp;brandNW=1&amp;native_fs=1&amp;autoStart=0&amp;page=http%3A%2F%2Fwww.everydaychampions.tv%2Fwatch&amp;rid=1383223609003"></object></div><input type="hidden" id="playerspace" value="736"></div></div>'

	];
	return tmp.join(" ");
}

function tmp_page_featured(){
	var tmp = [
		'<div class="main-content-scroller" id="featScroll">' + 
			'<div class="paddedContent"></div>' +
		'</div>'
	];
	return tmp.join(" ");
}

function authStat(){
	$.ajax({
		type: 'get',
		url: apiUrl + '/auth/status',
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(church){	
			console.log(church);
		}
	});
}
function authLogoutInit(){
	$('.pulToRefreshDiv').html('<i class="fa fa-spinner fa-spin"></i> Logging Out');
	$('.pulToRefreshDiv').before('<div style="height:45px; width:20px;">&nbsp;</div>');
	$.jStorage.set('loggedInUser', 'null');
	$.jStorage.set('firstname', null);
	$.jStorage.set('lastname', null);
	buildMenu();
	pageInit(globJson);
	//build_home();
	linkToPage('home');
	$('.pulToRefreshDiv').html('<i class="fa fa-spinner fa-spin"></i> Logging Out');
	whoami = {};
	whoami['device_model'] = device.model;
	whoami['device_platform'] = device.platform;
	whoami['device_version'] = device.version;
	whoami['uuid'] = device.uuid;
	whoami['device_ptoken'] = '';
	$.ajax({
		url: apiUrl + '/app/all?logout=true',
		dataType: 'json',
		data: whoami,
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(church){
			$.jStorage.set('api_key', church.auth.key);
			PgetTheToken();
		},
		error: function(){
			linkToPage('home');
			$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
			$('.appmod-body').html('<p>Could Not Connect To Server</p>');
			$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
			$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
		}
	});
}
function authLoginInit(){
	$('body').append('<div class="disabledCover" style="line-height: ' + $(window).height() + 'px"><i class="fa fa-spin fa-spinner"></i></div>');
	$('.disabledCover').css('display', 'block');
	$('.disabledCover').css({
		'background-color': 'rgba(0,0,0,0.8)'
	},200);
	buildMenu();
	pageInit(globJson);
	createPullScroll = false;
	$('.pulToRefreshDiv').html('<i class="fa fa-spinner fa-spin"></i> Logging In');
	createPullScroll = false;
	$.ajax({
		url: apiUrl + '/app/all',
		dataType: 'json',
		headers: { 'iknow-api-key': $.jStorage.get('api_key') },
		success: function(church){	
			$('.disabledCover').animate({
				'background-color': 'rgba(0,0,0,0)'
			},200, function(){
				$('.disabledCover').remove();
			});
			if(church.status==true){
				$.jStorage.set('lastUpdated', moment());
				$.each(church.data, function(key, val){
					$.jStorage.set(key, val);
				});
			}
			if(currentPage=='home'){
				buildHomeTimeout = setTimeout("build_home()", 10);
				if(church.data.accountUpdates!=false){
					profileInfo(church.data.accountUpdates, false)
				}
			}
		},
		error: function(church){
			alert('error 5');
			linkToPage('home');
			$('.appmod-title').html('<i class="fa fa-exclamation-triangle"></i> Connection Error');
			$('.appmod-body').html('<p>Could Not Connect To Server</p>');
			$('.appmod-body').append('<p>Connection Type: ' + checkConnection() + '</p>');
			$('.appmod-body').append('<button class="btn btn-block btn-default" onclick="canISetUp()">Try Again</button>');
		}
	});
}

function supplyImage(imageObj){
	var ret = new Object;
	var sha1 = imageObj.sha1;
	var gotIt = false;
	var imageArray = [];
	if($.jStorage.get('images')){
		var imageArrayCollect = $.jStorage.get('images');
		$.each(imageArrayCollect, function(gotsha1, gotb64){
			imageArray.push(gotsha1);
		});
	}else{
		imageArrayCollect = [];
	}
	$.each(imageArray, function(i, image){
		if(image==sha1){
			gotIt = true;
			ret = imageArrayCollect[image];
		}
	});
	if(gotIt==false){
		imageArrayCollect[imageObj.sha1] = imageObj.b64;
	//	$.jStorage.set(imageObj.sha1, imageObj.b64);
		$.jStorage.set('images', imageArrayCollect);
		ret = imageObj.b64;
	}
	return ret;
}
function getStoredImages(){
	var storedImages = [];
	var e = 0;
	if($.jStorage.get('images')){
		var imageArray = $.jStorage.get('images');
		$.each(imageArray, function(i, image){
			e++;
			storedImages.push(i);
		});
	}else{
		imageArray = new Object;
		$.jStorage.deleteKey('images');
		$.jStorage.set('images', imageArray);
	}
	if(e>0){
		return storedImages;
	}else{
		return 'none';
	}
}
function validEmail(e) {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(e).search (filter) != -1;
}
function ticketThankYou(){
	var html = new Array;
	html.push('<div class="paddedContent">');
		html.push('<div class="jumbotron" style="padding-top: 20px; padding-bottom: 20px; border-radius: 6px;">');
			html.push('<h3 class="text-info">Thanks for your order!</h3>');
			html.push('<p><small>Your tickets will be sent to you by email shortly. Please allow up to 24 hours for this email to arrive.</small></p>');
			html.push('<p><small>We\'re looking forward to seeing you there!</small></p>');
		html.push('</div>');
	html.push('</div>');
	html = html.join(" ");
	return html;
}
function donationThankYou(){
	var html = new Array;
	html.push('<div class="paddedContent">');
		html.push('<div class="jumbotron" style="padding-top: 20px; padding-bottom: 20px; border-radius: 6px;">');
			html.push('<h3 class="text-info">Thanks for your donation!</h3>');
			html.push('<p><small>We appriciate your generosity.</small></p>');
		html.push('</div>');
	html.push('</div>');
	html = html.join(" ");
	return html;
}
function removeDisabledCover(){
	$('.disabledCover').animate({
		'background-color': 'rgba(0,0,0,0)'
	},200, function(){
		$('.disabledCover').remove();
	});
}
function check3dSecureStatus(){
	var url = 'https://api.divinepassport.com/moto/status?account_id=' + transaction_passid + '&invoice=' + transaction_invoice;
	$.ajax({
	    type: "GET",
	    url: url,
	    dataType: 'json',
	    success: function(data) {
	    	if(data.status=='pending' || data.status=='processing' || data.status=='secure'){
		    	clearTimeout(transaction_poll);
		    	transaction_poll = setTimeout("check3dSecureStatus()", 2000);
		    }else if(data.status=='complete'){
			    if(transaction_type=="ticket"){
			    	clearTimeout(transaction_poll);
					html = ticketThankYou();
					$('.main-content-scroller').scrollTop(0);
					$('#showTicketsHere').html(html);
				}else if(transaction_type="donation"){
			    	clearTimeout(transaction_poll);
					linkToPage('give');
					$('.donationthankyou').html(html);
					$('.main-content-scroller').scrollTop(0);
					$('#givecontent').html(html);
				}
		    }else{
		    	clearTimeout(transaction_poll);
		    	navigator.notification.vibrate(100);
				navigator.notification.alert('The transaction failed. Please contact your administrator. ' + data.status, linkToPage('home'), 'There was a problem', 'Ok')
		    }
	    },
	    error: function(){
	    	clearTimeout(transaction_poll);
	    	transaction_poll = setTimeout("check3dSecureStatus()", 2000);
	    }
	});
}
function updatePref(type, setting, preference){
	pref = $.jStorage.get('appPref');
	var storedImages = [];
	var e = 0;
	$.each(pref[type], function(key, val){
		if(key==setting){
			pref[type][setting] = preference;
		}
	});
	$.jStorage.deleteKey('appPref');
	$.jStorage.set('appPref', pref);
}
function sendLoc(updateYes){
	var ajax = false;
	if(lastLocSend==null){
		ajax = true;
		lastLocSend = new moment();
	}else{
		now = new moment();
		if(parseInt(now.diff(lastLocSend, 'second'))>=20){
			ajax = true;
		}
	}
	if(ajax==true){
		if($.jStorage.get('api_key')!=null && $.jStorage.get('api_key')!='null' && typeof $.jStorage.get('api_key')!=null && $.jStorage.get('api_key')){
			pref = $.jStorage.get('appPref');
			mapPref = pref['map'];
			json = new Object;
			json['lat'] = lat;
			json['lng'] = lng;
			json['message'] = mapPref['my_tag'];
			json['share_group'] = mapPref['showme_groups'];
			json['share_team'] = mapPref['showme_teams'];
			json['share_church'] = mapPref['showme_church'];
			$.ajax({
				type: 'post',
				url: apiUrl + '/app/loc',
				data: json,
				dataType: 'json',
				headers: { 'iknow-api-key': $.jStorage.get('api_key') },
				success: function(data){
					$.jStorage.set('friends', data);
					if(updateYes=='true'){
						populateMap();
						$('.showme_refresh_btn').find('i').removeClass('fa-spin');
					}
				}
			});
		}
	}
}
function populateMap(){
	var friends = $.jStorage.get('friends');
	console.log(friends);
	if(friendsLayer!=null){
		livemap.removeLayer(friendsLayer);
		friendsLayer = null;
	}
	friendsLayer = 	new L.layerGroup();
	$.each(friends.data.locs, function(i, friend){
		marker = new L.marker([friend.lat, friend.lng], {icon: greenIcon}).addTo(friendsLayer);
		htm = new Array;
		htm.push('<div class="mapPopInner">');
			htm.push('<span class="title">' + friend.ppl_fname + ' ' + friend.ppl_sname + '</span>');
			htm.push('<span class="message">' + friend.message + '</span>');
			htm.push('<span class="time">' + moment(friend.created_at, "YYYY-MM-DD HH:mm:ss").fromNow() + ' (' + friend.distance + 'M)</span>');
		htm.push('</div>');
		htm = htm.join(' ');
		marker.bindPopup(htm);
	});
	livemap.addLayer(friendsLayer);
}

function showOverlayMenu(){
	$('.appContent').addClass('appContentBlurReady');
	$('.main-content-scroller, .scroller-container').css('overflow', 'hidden');
	height = $('body').height()/4;
	$('#menu-overlay').html('');
	var platform = $.jStorage.get('device_platform');
    $.each(globJson.init.menu.public, function(i, context){
        if((context.ios==true && platform=='iOS') || (context.android==true && (platform=='android' || platform=='Android'))){
           if(((context.private==true && $.jStorage.get('loggedInUser')!='null') || context.private==false) && context.href!='logout'){
                var tmp = [
                           '<div class="overlayMenuItem" data-goto="' + context.href + '" style="height:' + height + 'px">' +
                           '<div class="iconimage"><i class="fa ' + context.icon + '"></i></div>' +
                           '<div class="titletext"><span class="iconLabel">' + context.text + '</span></div>' +
                           '</div>'
                           ];
                    h = tmp.join(" ");
                $('#menu-overlay').append(h);
           }
        }
	});
    
   var tmp = [
		'<div class="overlayMenuItem" data-goto="exitmenu" style="height:' + height + 'px">' +
			'<div class="iconimage"><i class="fa fa-sign-out"></i></div>' + 
			'<div class="titletext"><span class="iconLabel">Exit Menu</span></div>' +
		'</div>'
	];
	h = tmp.join(" ");
	$('#menu-overlay').append(h);
	$('#menu-overlay').append('<div style="clear:both"></div>');
	setTimeout(function(){
		$('#menu-overlay').css('display', 'block');
		$('.appContent').addClass('appContentBlur');
		$('#menu-overlay').animate({'opacity': 1}, 150);
	}, 10);
	return false;
}
function hideOverlayMenu(){
	$('.appContent').removeClass('appContentBlur');
	$('#menu-overlay').animate({'opacity': 0}, 250);
	$('.main-content-scroller, .scroller-container').css({
		'overflow-y': 'scroll',
		'-webkit-overflow-scrolling': 'touch',
		'overflow-x': 'hidden'
	});
	setTimeout(function(){
		$('#menu-overlay').css('display', 'none');
		$('.appContent').removeClass('appContentBlurReady');
	}, 500);
}

//just set a custom icon for friends
var greenIcon = L.icon({
    iconUrl: 'js/leaflet/images/marker-icon-green.png',
    shadowUrl: 'js/leaflet/images/marker-shadow.png',
	
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowAnchor: [12, 42],
	shadowSize: [41, 41]
});
var redIcon = L.icon({
    iconUrl: 'js/leaflet/images/marker-icon-red.png',
    shadowUrl: 'js/leaflet/images/marker-shadow.png',
	
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowAnchor: [12, 42],
	shadowSize: [41, 41]
});
function setInitialVars(){
	$.jStorage.set('lastUpdated', 'null');
	$.jStorage.deleteKey('images');
	if(!$.jStorage.get('loggedInUser')){
		$.jStorage.set('loggedInUser', 'null');
	}
	if(!$.jStorage.get('notificationGroup')){
		$.jStorage.set('notificationGroup', 'showing');
	}
	if(!$.jStorage.get('notificationRota')){
		$.jStorage.set('notificationRota', 'showing');
	}
	if(!$.jStorage.get('notificationBirthdays')){
		$.jStorage.set('notificationBirthdays', 'showing');
	}
	if(!$.jStorage.get('notificationEvents')){
		$.jStorage.set('notificationEvents', 'showing');
	}
	if(!$.jStorage.get('friends')){
		$.jStorage.set('friends', null);
	}
	if(!$.jStorage.get('t_hunts')){
		$.jStorage.set('t_hunts', null);
	}
	if(!$.jStorage.get('appPref')){
		//set the initial preferences
		preferences = new Object;
		preferences['map'] = new Object;
		preferences['map']['showme_teams'] = 0;
		preferences['map']['showme_groups'] = 0;
		preferences['map']['showme_church'] = 0;
		preferences['map']['my_tag'] = 'Anyone fancy a coffee?';
		preferences['push'] = new Object;
		preferences['push']['rota'] = '1h';
		preferences['push']['group'] = '3h';
		preferences['push']['cal'] = 'eb';
		preferences['push']['birth'] = '3d';
		preferences['push']['ievents'] = 'n';
		preferences['push']['newprayer'] = '1';
		preferences['push']['newintercessor'] = '1';
		preferences['push']['newpodcast'] = '1';
		$.jStorage.set('appPref', preferences);
	}
}
function removeNullVal(val){
	if(val=='null' || val=="null" || val=='' || typeof val == 'null' || typeof val == 'undefined' || typeof val == null || val == null ){
		val = '';
	}else{
		val = val;
	}
	return val;
}
/*   
{
   "text":"QR Scanner",
   "private": false,
   "icon":"fa-qrcode",
   "href":"qrscanner",
   "dragger":false
},
{
   "text":"Featured",
   "private": false,
   "icon":"fa-bookmark-o",
   "href":"featured",
   "dragger":true,
   "init":null,
   "params":null
}, 
{
   "text":"My Church",
   "private": true,
   "icon":"fa-group",
   "href":"#",
   "dragger":false
},

'<div style="margin-top: 15px;">' +
						'<h5 class="text-muted">Donation Type</h5>' + 
						'<div class="btn-group buttonradio donationPartHtml" style="display:block;" id="type" data-value="single" data-field="type">' +
							'<button type="button" class="btn btn-info active changeType changeSummary" style="width:50%" data-value="single">Single</button>' +
							'<button type="button" class="btn btn-info changeType changeSummary" style="width:50%" data-value="recurring">Recurring</button>' +
						'</div>' +
						'<div style="clear:both"></div>' + 
					'</div>' +
					'<div style="margin-top: 0px; height: 0px; overflow:hidden" id="showRepeatOpts">' +
						'<h5 class="text-muted">Recurrence</h5>' +
						'<div class="btn-group buttonradio donationPartHtml" style="display:block;" id="period" data-value="monthly" data-field="period">' +
							'<button type="button" class="btn btn-info changePeriod changeSummary" style="width:50%" data-value="weekly">Weekly</button>' +
							'<button type="button" class="btn btn-info active changePeriod changeSummary" style="width:50%" data-value="monthly">Monthly</button>' +
						'</div>' + 
						'<div style="clear:both"></div>' +
						'<h5 class="text-muted">Occurrences <small>(leave blank for unlimited)</small></h5>' +  
						'<input type="tel" class="form-control occurences_number changeSummary donationPart" data-field="number" />' + 
					'</div>' + 
*/
function rateAppTime(){
	console.log('rate app timing');
	if(!$.jStorage.get('rateapp')){
		//first app usage
		a = moment().add('days', 7).format("YYYY-MM-DD");
		$.jStorage.set('rateapp', a);
		console.log('set the rate day as ' + a);
	}else{
		//time is set, is it time
		if($.jStorage.get('rateapp')=='nothanks'){
			//we are not sending them anymore rate requests
			console.log('no more rate requests!!!');
		}else{
			//get the days until set		
			var rateday = moment($.jStorage.get('rateapp'), "YYYY-MM-DD");
			var today = moment();
			daysuntilrate = parseInt(rateday.diff(today, 'days'));
			if(daysuntilrate<=0){
				//ask them to rate now!!
				console.log('please rate now!!');
				setTimeout("rateAppPrompt()", 3000);
			}else{
				console.log('still waiting ' + daysuntilrate + ' to ask for a rating');
			}
		}
	}
}
function rateAppPrompt(){
	navigator.notification.confirm(
	    'If you like our app, how about giving it a rating on the store?',
	    rateAppConfirmed,
	    'Like what you see?',
	    'Remind Me Later, Rate Now, No Thanks'
	);
	function rateAppConfirmed(btn){
		if(btn==1){
			//set the timer later
			a = moment().add('days', 3).format("YYYY-MM-DD");
			$.jStorage.set('rateapp', a);
		}else if(btn==2){
			//let's go to the hop, hop baby!
			$.jStorage.set('rateapp', 'nothanks');
			setTimeout(function(){
				CDVTweetSheet.openlink('itms-apps://itunes.apple.com/app/id785051984?at=10l6dK');
			}, 100);
		}else if(btn==3){
			//remove timer
			$.jStorage.set('rateapp', 'nothanks');
		}
	}
}
function parseTweet(inputText){
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<span class="leaveapplink" data-href="$1" target="_blank">$1</span>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<span class="leaveapplink" data-href="http://$2" target="_blank">$2</span>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    replacedText = replacedText.replace(/@(\S+)/g, '<a href="twitter://user?screen_name=$1" class="twitterUserLink">@$1</a>')
           .replace(/#(\S+)/g, '<a href="twitter://search?query=%23$1" class="twitterHashLink">#$1</a>');

    return replacedText;
}

function verifyApp(){
	//run this function to verify the app, if it fails, we will cancel the whole page.
	glob = globJson;
	obj = {};
	obj['app_version'] = glob.init.app_version;
	obj['api_version'] = glob.init.api_version;
	obj['church_id'] = glob.init.church_id;
	$.ajax({
	    type: "POST",
	    url: apiUrl + '/app/verify',
	    data: obj,
	    dataType: 'json',
	    success: function(data) {
	    	if(data.status==false){
	    		$('.removeableContainer').html();
	    		obj = {};
	    		obj['style'] = 'danger';
	    		obj['title'] = data.data.title;
	    		obj['data'] = data.data.content;
	    		var html = blockTemplate(obj);
	    		$('.removeableContainer').html('<div class="pageHead"><div class="altTitleBar"><span class="churchName">' + data.data.title + '</span></div></div><br><br>');
	    		$('.removeableContainer').append(html);
	    		$('.appmod').css('margin', '10px');
	    	}
	    },
	    error: function(){

	    }
	});
}
