var num_posts = 0;
var blog = "";
var num = -1;
var slideshowIntervalId = 0;
var disablenav = false;
var relevantRequest = null;
var shuffleFavourites = false;
var favourites = null;

$(document).ready(function(){
	favourites = localStorage.getItem('favourites');
	if (!favourites) {
		favourites = new Array();
	} else {
		favourites = JSON.parse(favourites);
	}
	
	if (blog == "") {
		showBlogChoice();
	}

	$(document).on('click', '#goforward', function () {
		nextPic();
	});

	$(document).on('click', '#goback', function () {
		prevPic();
	});

	$(document).on('click', '.heart', function () {
		toggleFavourite(blog, $(this).attr('data-postid'));
	});

	$(document).on('click', '#favourites', function () {
		if (favourites.length > 0) {
			shuffleFavourites = true;
			num_posts = favourites.length;
			showRandomPost();
		}
	});

	$(document).on('click', '#download', function () {
		//downloadURL($(this).attr('href'));
		//$('.ui-btn-active').removeClass('ui-btn-active ui-focus');
		
		//return false;
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

	$(document).on('scroll', function () {
		$.mobile.activePage.find('.arrows').css('bottom', (-1 * $(document).scrollTop()));
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
	
	$('input[name=blogname]').on("keyup", function() {
		updateBlogInfo($(this).val());
	});
});

var showBlogChoice = function() {
	var div = '<div id="blogchoice" data-role="page" data-scroll="true">'
	+ '	<div data-role="content">'
	+ '		<div data-role="fieldcontain">'
	+ '			<label for="blogname"><h3>Blog name</h3> <p><input type="search" value="' + localStorage.getItem('prevblog') + '" name="blogname" /></p></label>'
	+ '		</div>'
	+ '		<div id="blog_status"></div>'
	+ '		<button type="button" data-theme="b" name="submit" value="submit" aria-disabled="false" data-inline="true" onclick="saveBlogChoice($(\'input[name=blogname]\').val())">Shuffle!</button>'
	+ '		<button type="button" name="cancel" value="cancel" aria-disabled="false" data-inline="true">Cancel</button>'
	+ '	</div>'
	+ '</div>';
	
	$('body').append(div);
	$.mobile.changePage($('#blogchoice'));

	if(localStorage.getItem('prevblog')) {
		updateBlogInfo(localStorage.getItem('prevblog'));
	}
	
	$('#blogchoice').on('pagehide', function () {
		$(this).remove();
		$('#placeholder').remove();
	});
	$('button[name=submit]').button('disable');
	$('button[name=cancel]').button('disable');
}

var saveBlogChoice = function(c_blog) {
	//window.plugins.insomnia.keepAwake();
	blog = c_blog;
	localStorage.setItem("prevblog", blog);

	$.ajax({
		type: "GET",
		timeout: 3000,
		url: /*"http://crossorigin.me/" + */"http://" + blog + ".tumblr.com/api/read/json?type=photo",
		dataType: "jsonp",
		success: function(results){
			num_posts = results["posts-total"];
			showRandomPost();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			console.log('error');
		}
	});
}

var updateBlogInfo = function(blogname) {
	var jqxhr = $.ajax({
		type: "GET",
		timeout: 3000,
		url: /*"http://crossorigin.me/" + */"http://" + blogname + ".tumblr.com/api/read/json?type=photo",
		dataType: "jsonp"
	});

	if (relevantRequest) {
		relevantRequest.abort();
	}
	relevantRequest = jqxhr;
	
	$('#blog_status').html("Retrieving information...");
	$('button[name=submit]').button('disable');
	$('button[name=cancel]').button('disable');

	jqxhr.always(function(data, textStatus, jqXHR) {
		if (jqxhr == relevantRequest) {
			if (textStatus == "success") {				
				$('#blog_status').html("");
				var info = data["tumblelog"];
				if (info["cname"].length > 0) {
					$('#blog_status').append("Blog name: " + info["cname"]+"<br />");
				}
				if (info["description"].trim().length > 0) {
					$('#blog_status').append("Blog description: " + info["description"].trim()+"<br />");
				}
				$('#blog_status').append("Pics found: " + data["posts-total"]);
				
				if (data["posts-total"] > 0) {
					$('button[name=submit]').button('enable');
				} else {
					$('button[name=submit]').button('disable');
				}
			} else {
				$('#blog_status').html("Could not reach blog");
				$('button[name=submit]').button('disable');
			}
			relevantRequest = null;
		}
	});
}

var updateBlogInfoSuccess = function(update_num) {
	console.log(update_num);
}

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
		var numAttempts = 0;
		while ($('#cc_' + num).length != 0 || num == -1) {
			numAttempts++;
			num = Math.floor(Math.random() * (num_posts));
			
			if (numAttempts >= 60) {
				return -1;
			}
		}
		var div = '<div class="picdiv" id="cc_' + num + '" data-role="page" data-scroll="true">' 
		+ ' <div class="heart" data-postid=""></div>'
		+ '	<div data-role="footer" data-id="navbar" data-position="fixed">'
		+ ' <div class="arrows_container"><div class="arrows"></div></div>'
		+ '	<div data-role="navbar">'
		+ '		<ul>'
		+ '			<li><a href="" data-role="button" id="goback">Back</a></li>'
		+ '			<li><a href="" data-role="button" id="slideshow">Toggle slideshow</a></li>'
		+ '			<li><a href="" data-role="button" id="favourites">Favourites</a></li>'
		+ '			<li><a href="" data-role="button" id="goforward">Forward</a></li>'
		//+ '			<li><a href="" data-role="button" id="download">Download</a></li>'
		+ '		</ul>'
		+ '	</div>'
		+ '</div>'	
		+ '</div>';
		
		var post_url = "";
		if (shuffleFavourites) {
			post_url = "http://" + favourites[num].blog + ".tumblr.com/api/read/json?type=photo&id="+favourites[num].post_id;
		} else {
			post_url = "http://" + blog + ".tumblr.com/api/read/json?type=photo&num=1&start="+num;
		}

		$.ajax({
			type: "GET",
			url: /*"http://crossorigin.me/" + */ post_url,
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
					//html += '<a class="download" onclick="downloadURL(\''+img_url+'\')" style="/*display: none;*/">Nu downloaden</a>';
				}
				$('body').append(div);
				$('#cc_' + num).append(html);
				
				if (slideshowIntervalId > 0) {
					clearInterval(slideshowIntervalId);
				}

				if (post["photos"].length > 1) {
					$('#cc_' + num +' .arrows').show();
				} else {
					$('#cc_' + num +' .arrows').hide();
				}
				
				$('#cc_' + num +' .heart').attr('data-postid', post.id);

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

var toggleFavourite = function(blog, post_id) {
	var fav = {
		'blog':		blog,
		'post_id':	post_id
	};
	var fav_index = arrayObjectIndexOf(favourites, fav);

	if (fav_index == -1) {
		favourites.push(fav);
	} else {
		favourites.splice(fav_index, 1);
	}
	if (shuffleFavourites) {
		num_posts = favourites.length;
	}
	localStorage.setItem("favourites", JSON.stringify(favourites));
}

function arrayObjectIndexOf(myArray, searchArr) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i]['blog'] === searchArr['blog'] && myArray[i]['post_id'] === searchArr['post_id']) return i;
    }
    return -1;
}