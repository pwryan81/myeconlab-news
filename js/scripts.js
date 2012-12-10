/*   
 * Pearson MyEconLab: Economic News
 * @version:  1.0 
 * @description:
 * @author: Paul Ryan
 */

if ( Modernizr.csstransforms ) {
	  window.mySwipe = new Swipe(
	  document.getElementById('slider'), {
		  callback: function (e, pos) {	
			  $('#tabs .selected').removeClass('selected');  
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
		// build filter buttons dynamically
		
		var filterButtonsHTML;
		for (var i=0; i<australianRssFeeds.length; i++) {
			filterButtonsHTML += '<li data-filter=".' + australianRssFeeds[i].classname + '">' + australianRssFeeds[i].displayname + '</li>';
		}		
		$('#tabPanel1 .filterButtonGroup').append(filterButtonsHTML); // TO DO: It adds the buttons, but don't seem to respond to their event listners
		
		initColorbox();
		
    });	
	/**  RSS Feeds for container2 */
    $feedContainer2.rssfeed(worldRssFeeds, {
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
		initColorbox();
    });	
	
	/**  RSS Feeds for container3 */
    $feedContainer3.rssfeed(videoRssFeeds, {
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
		initColorbox();
    });
	
	
	/* TAB GROUP EVENT HANDLER*/
	$('#tabs li').click(function (event) {
		$('#tabs .selected').removeClass('selected');
		$(this).addClass('selected');
		var slideNumber = $(this).index();
		if (mySwipe) {		
			mySwipe.slide(slideNumber,400);		//TO DO: Check if mySwipe object exists first. Not in IE8.
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

	
});