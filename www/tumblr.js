var num_posts = 0;
var blog = "";
var num = -1;
var slideshowIntervalId = 0;
var disablenav = false;

$(document).ready(function(){
	while (blog == "") {
		blog = prompt("Blog:", localStorage.prevblog);
	}
	localStorage.setItem("prevblog", blog);
	$.ajax({
		type: "GET",
		url: /*"http://crossorigin.me/" + */"http://" + blog + ".tumblr.com/api/read/json?type=photo",
		dataType: "jsonp",
		success: function(results){
			num_posts = results["posts-total"];
			showRandomPost();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			alert("Error fetching blog");
		}
	});

	$(document).on('click', '#goforward', function () {
		nextPic();
	});

	$(document).on('click', '#goback', function () {
		prevPic();
	});

	$(document).on('click', '#download', function () {
		$.each($.mobile.activePage.find("a.download > img"), function() {
			$(this).trigger('click');
		});
		$('.ui-btn-active').removeClass('ui-btn-active ui-focus');
	});

	$(document).on('swipeleft', '.ui-page', function () {
		nextPic();
	});

	$(document).on('swiperight', '.ui-page', function () {
		prevPic();
	});
	
	$(document).keyup(function(e) {
		if (e.keyCode == 39) {  
			nextPic();
        } else if(e.keyCode==37) {
			prevPic();
        }
	});
	
	$(document).on('click', '#slideshow', function() {
		if (slideshowIntervalId == 0) {
			slideshowIntervalId = setInterval(function(){ showRandomPost() }, 5000);
		} else {
			clearInterval(slideshowIntervalId);
			slideshowIntervalId = 0;
		}
	});
	
			
	$( document ).on( "mobileinit", function() {
		$.mobile.loader.prototype.options.text = "loading";
		$.mobile.loader.prototype.options.textVisible = false;
		$.mobile.loader.prototype.options.theme = "a";
		$.mobile.loader.prototype.options.html = "";
	});
});

var nextPic = function() {
	if ($.mobile.activePage.next('.ui-page').length !== 0) {
		var next = $.mobile.activePage.next('.ui-page');
		$.mobile.changePage(next);
	} else {
		showRandomPost();
	}
	$('.ui-btn-active').removeClass('ui-btn-active ui-focus');
}

var prevPic = function() {
	if ($.mobile.activePage.prev('.ui-page').length !== 0) {
		var prev = $.mobile.activePage.prev('.ui-page');
		$.mobile.changePage(prev);
	}
	$('.ui-btn-active').removeClass('ui-btn-active ui-focus');
}

var showRandomPost = function() {
	if (!disablenav) {
		disablenav = true;
		while ($('#cc_' + num).length != 0 || num == -1) {
			num = Math.floor(Math.random() * (num_posts));
		}
		var div = '<div class="picdiv" id="cc_' + num + '" data-role="page" data-scroll="true">' 
		+ '	<div data-role="footer" data-id="navbar" data-position="fixed">'
		+ '	<div data-role="navbar">'
		+ '		<ul>'
		+ '			<li><a href="" data-role="button" id="goback">Back</a></li>'
		+ '			<li><a href="" data-role="button" id="slideshow">Toggle slideshow</a></li>'
		+ '			<li><a href="" data-role="button" id="goforward">Forward</a></li>'
		+ '			<li><a href="" data-role="button" id="download">Download</a></li>'
		+ '		</ul>'
		+ '	</div>'
		+ '</div>'	
		+ '</div>';
		$.ajax({
			type: "GET",
			url: /*"http://crossorigin.me/" + */"http://" + blog + ".tumblr.com/api/read/json?type=photo&num=1&start="+num,
			dataType: "jsonp",
			success: function(results){
				var post = results["posts"][0];
				//console.log(post);
				if (post["photos"].length == 0) {
					post["photos"][0] = { "photo-url-1280": post["photo-url-1280"]}
				}
				var html = '';
				for (i=0; i<post["photos"].length; i++) {
					if (i > 0) {
						html += "<br />"
					}
					var photo = post["photos"][i];
					var img_url = photo["photo-url-1280"];
					html += '<img class="tumblr_pic" src="'+img_url+'" />';
					html += '<a class="download" href="'+img_url+'" style="/*display: none;*/">Nu downloaden</a>';
				}
				$('body').append(div);
				$('#cc_' + num).append(html);
				
				if (slideshowIntervalId > 0) {
					clearInterval(slideshowIntervalId);
				}
				
				$('#cc_' + num).imagesLoaded().always( function( instance ) {
					$.mobile.changePage($('#cc_' + num));
					if (slideshowIntervalId > 0) {
						slideshowIntervalId = setInterval(function(){ showRandomPost() }, 5000);
					}
					disablenav = false;
				});
				
				var interval = setInterval(function(){
					$.mobile.loading('show');
					clearInterval(interval);
				},1); 
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("Error");
			}
		});
	}
}