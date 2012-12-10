/*   
 * Pearson MyEconLab: Economic News
 * @version:  1.0 
 * @description:
 * @author: Paul Ryan
 */

/** Global variables */
var SWIPE_DURATION; 

/** Detect touch device */
if (Modernizr.touch){
   // bind to touchstart, touchmove, etc and watch `event.streamId`
   //alert("This is a touch device");
   SWIPE_DURATION = 0; // Disabled the slide animation on touchscreens to increase responsiveness. User can still swipe manually.
} else {
   // bind to normal click, mousemove, etc
    //alert("This is NOT a touch screen");
	SWIPE_DURATION = 400; // On desktop, slide the tab panels 
}




/** Use CSS3 transforms for tab slider if browser supports it */
if ( Modernizr.csstransforms ) {
	  window.mySwipe = new Swipe(
	  document.getElementById('slider'), {
		  callback: function (e, pos) {	
		  	  $('#tabs li').removeClass('selected');  		  
			  $('#tabs li').eq(pos).addClass('selected');
		  }
	});
}
else {
	 // Handler for older browsers without CSS3 transitions (IE8). Show/hide panels
	$('#tabs li').click(function () {		
		 var selector = $(this).attr('data-panel');
		 console.log(selector);
		$('.tabPanel').hide();
		$('#' + selector).show();	
	});	
}
 
$(document).ready(function () {
	
    var $feedContainer1 = $('#feedContainer1');
    var $feedContainer2 = $('#feedContainer2');
    var $feedContainer3 = $('#feedContainer3');
	
	/* COULD PUT THE FOLLOWING 3 RSSFEED() METHODS IN A LOOP. */
	
    /**  RSS Feeds for container1*/
    $feedContainer1.rssfeed(australianRssFeeds, {
        snippet: false,
        limit: 1,
        sort: 'date',
        dateformat: 'timeline',
        sortasc: false,
        media: false
    }, function () {
        $feedContainer1.isotope({
            itemSelector: '.rssItem',
            layoutMode: 'masonry',        
        });
		
		// Build filter buttons dynamically		
		var filterButtonsHTML;
		for (var i=0; i<australianRssFeeds.length; i++) {
			filterButtonsHTML += '<li data-filter=".' + australianRssFeeds[i].classname + '">' + australianRssFeeds[i].displayname + '</li>';
		}		
		$('#tabPanel1 .filterButtonGroup').append(filterButtonsHTML); // TO DO: It adds the buttons, but don't seem to respond to their event listners
		
		
		if (!Modernizr.touch) {initColorbox();}
		
    });	
	/**  RSS Feeds for container2 */
/*    $feedContainer2.rssfeed(worldRssFeeds, {
        snippet: false,
        limit: 3,
        sort: 'date',
        dateformat: 'timeline',
        sortasc: false,
        media: false
    }, function () {
        $feedContainer2.isotope({
            itemSelector: '.rssItem',
            layoutMode: 'masonry'
        });
		// Dont use lightbox on mobile/touch devices. It screws up the page scrolling, and the phone back button exits the app completly
		if (!Modernizr.touch) {initColorbox();}
    });	*/
	
	/**  RSS Feeds for container3 */
 /*   $feedContainer3.rssfeed(videoRssFeeds, {
        snippet: false,
        limit: 3,
        sort: 'date',
        dateformat: 'timeline',
        sortasc: false
    }, function () {
        $feedContainer3.isotope({
            itemSelector: '.rssItem',
            layoutMode: 'masonry'
        });
		if (!Modernizr.touch) {initColorbox();}
    });*/
	
	
	/* TAB GROUP EVENT HANDLER*/
	$('#tabs li').click(function (event) {
		$('#tabs .selected').removeClass('selected');
		$(this).addClass('selected');
		var slideNumber = $(this).index();
		if (mySwipe) {		
			mySwipe.slide(slideNumber,SWIPE_DURATION);		//TO DO: Check if mySwipe object exists first. Not in IE8.
		}
	});
	
  
   /* FILTER ITEMS EVENT HANDLER */                                   //TO DO:   Need the event listners to listen to dynamically generated elements too.
   // $('.filterButtonGroup li').click(function () {
	   $('.filterButtonGroup li').on("click", function () {
        var selector = $(this).attr('data-filter');
		console.log("Filtering on: " + selector);
		// Change selected button state		
		$(this).parent().find('.selected').removeClass('selected');
		$(this).addClass('selected');
		$(this).parent().siblings('.feedContainer').isotope({
            filter: selector
        });
    });
	
	
	
	
	
    // VIEW CONTROLS EVENT HANDLER
    $('#btnTileView').click(function () {
        $('.feedContainer').removeClass('listview').removeClass('gridview').addClass('tileview').isotope('reLayout');    
    });
    $('#btnGridView').click(function () {
        $('.feedContainer').removeClass('tileview').removeClass('listview').addClass('gridview').isotope('reLayout');
    });
    $('#btnListView').click(function () {
        $('.feedContainer').removeClass('tileview').removeClass('gridview').addClass('listview').isotope('reLayout');
    });	
	 $('#btnImageView').click(function () {
        $('.feedContainer').removeClass('tileview').removeClass('gridview').addClass('imageView').isotope('reLayout');
    });
	
	/** Lightbox */
	function initColorbox()
	{
		$(".iframe").colorbox({
			iframe:true, 
			width:"100%", 
			height:"100%", 
			maxWidth:"1024px",
			fixed:true,
			onOpen:function(){ /* alert('onOpen: colorbox is about to open'); /*window.location.href += "#"*/ },
			onClosed:function(){ /*alert('onClosed: colorbox has completely closed'); /*window.location.href = history.back(); */}
	  }); 
	}
	
	
	 // TinyNav.js 1
      $('#nav').tinyNav({
        active: 'selected'
      });
	

	

	
}); // End ready()