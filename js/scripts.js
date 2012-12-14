/*   
 * Pearson MyEconLab: Economic News
 * @version:  1.0 
 * @description:
 * @author: Paul Ryan
 */
/** Global variables */
var numberOfPanelsLoaded = 0;
var SWIPE_DURATION;
/** Detect touch device */
if (Modernizr.touch) {
    // bind to touchstart, touchmove, etc and watch `event.streamId`
    //alert("This is a touch device");
    SWIPE_DURATION = 0; // Disabled the slide animation on touchscreens to increase responsiveness. User can still swipe manually.
} else {
    // bind to normal click, mousemove, etc
    //alert("This is NOT a touch screen");
    SWIPE_DURATION = 400; // On desktop, slide the tab panels 
}

/* THe following can be done before feeds are loaded */
/** Use CSS3 transforms for tab slider if browser supports it */
if (Modernizr.csstransforms) {
	// Initialise Swipe.js plugin
    window.mySwipe = new Swipe(document.getElementById('slider'), {
      callback: function(event,index,elem) {
        setTab(selectors[index]);
      }
    }),
    selectors = document.getElementById('tabs').children;

	for (var i = 0; i < selectors.length; i++) {
	  var elem = selectors[i];
	  elem.setAttribute('data-tab', i);
	  elem.onclick = function(e) {
		e.preventDefault();
		setTab(this);
		mySwipe.slide(parseInt(this.getAttribute('data-tab'),10),SWIPE_DURATION);
	  }
	}
	
	function setTab(elem) {
	  for (var i = 0; i < selectors.length; i++) {
		selectors[i].className = selectors[i].className.replace('on','off');
	  }
	  elem.className += ' on';
	}
	
} else {
    // IE8: Handler for older browsers without CSS3 transitions. No slider, so simply show/hide panels
    $('#tabs li').click(function () {
        var selector = $(this).attr('data-panel');
        console.log(selector);
        $('.tabPanel').hide();
        $('#' + selector).show();
    });
}



$(document).ready(function () {
	var $panel1 = $('#panel1');
	var $panel2 = $('#panel2');
	var $panel3 = $('#panel3');
	
	
   // CONNECT BUTTONS TO EVENT HANDLERS
	$('#btnAccept').click(function () {
		$('.disclaimer').fadeOut(500, function() {
			// Optional callback
			$('.loading').show();
			//$('#slider').fadeIn();
			//$('#slider').css("visibility","visible");
			});	
			loadFeeds();						
	});
	
	
    //loadFeeds();
   function loadFeeds() {
	   // Load RSS feeds for panel1
		($panel1).children('.feedContainer').rssfeed(panel1feeds, {}, function () {             
			buildFilterButtons(panel1feeds, $panel1);
			$($panel1).children('.feedContainer').isotope({itemSelector: '.rssItem'}); /* Do this ASAP on the first panel. No need to wait for others to load first*/
			checkAllFeedsLoaded();
		});
		// Load RSS feeds for panel2
		$($panel2).children('.feedContainer').rssfeed(panel2feeds, {}, function () {       
		   buildFilterButtons(panel2feeds, $panel2);
		   checkAllFeedsLoaded();
		});
		// Load RSS feeds for panel3
		$($panel3).children('.feedContainer').rssfeed(panel3feeds, {}, function () {        
			buildFilterButtons(panel3feeds, $panel3);
			checkAllFeedsLoaded();
			  //TO DO! Need some sort of check that all feeds are indeed loaded, because AJAX could return feed data in any order!
		});	   
	}
   
   
   /** Do this after each feed loaded 
	* e.g build the filter buttons
	*/	
	function buildFilterButtons(feedsJSON, panel) {		
		// Build filter buttons dynamically		
        var html = "";
        for (var i = 0; i < feedsJSON.length; i++) {
            html += '<li data-filter=".' + feedsJSON[i].classname + '">' + feedsJSON[i].displayname + '</li>';
        }
       	$(panel).children('.filterButtonGroup').append(html); // TO DO: It adds the buttons, but don't seem to respond to their event listners
	}
   
	function checkAllFeedsLoaded() {
		numberOfPanelsLoaded++;
		console.log("checkAllFeedsLoaded(): numberOfPanelsLoaded:" + numberOfPanelsLoaded);
		if (numberOfPanelsLoaded  == $("#slider .panel").length) {
			console.log("All panels loaded!");
			doThisAfterAllFeedsLoaded();
		}		
	}
	

    
 
    /*  SEARCH FUNCTIONS - Currently disabled
	$('#searchBtn').click(function () {
		console.log("searchBtn clicked");
       searchFeeds();
    });		
	 $('#searchText').keypress(function(e) {
		 console.log("Key Pressed");
        if(e.which == 13) {
			console.log("Enter Pressed");
            $(this).blur();
            $('#searchBtn').focus().click();
			searchFeeds();
        }
    });	
	
	function searchFeeds()
	{
		$feedContainer4.isotope('destroy'); // Wipe all existing items before refreshing with new
		var searchTerm = $('#searchText').val();
		console.log("Searching for " + searchTerm);
		//Testing Seach with Yahoo Pipes 
		 $feedContainer4.rssfeed(searchRssFeeds, {
			snippet: false,
			limit: 20,
			sort: 'date',
			dateformat: 'timeline',
			sortasc: false,			
			searchterm: searchTerm //NEW
		}, function () {	
			setTimeout ( function() {
				
				$feedContainer4.isotope({
					itemSelector: '.rssItem',
					layoutMode: 'masonry'
				});		
			if (!Modernizr.touch) {initColorbox();}
				
				}, 100);
		})
	}*/
	
	

	
	/** Do this after ALL feeds loaded
	*  1. Add event listeners
	*/
    function doThisAfterAllFeedsLoaded() {
		console.log("***In doThisAfterAllFeedsLoaded() *** ");
		
		// Build Isotopes for each feed container 
		
		 $($panel2).children('.feedContainer').isotope({itemSelector: '.rssItem'});
		 $($panel3).children('.feedContainer').isotope({itemSelector: '.rssItem'});
		 
		 // The following button events need to come after Isotope has been initialised, because it calls isotope relayout
		  $('#btnTileView').click(function () {
        $('.feedContainer').removeClass('listview').removeClass('gridview').addClass('tileview').isotope('reLayout');
		});
		$('#btnGridView').click(function () {
			$('.feedContainer').removeClass('tileview').removeClass('listview').addClass('gridview').isotope('reLayout');
		});
		$('#btnListView').click(function () {
			$('.feedContainer').removeClass('tileview').removeClass('gridview').addClass('listview').isotope('reLayout');
		});
		/*	 $('#btnImageView').click(function () {
			// Image Gallery view - Disabled
			$('.feedContainer').removeClass('tileview').removeClass('gridview').addClass('imageView').isotope('reLayout');
		});*/
		 
		 
		
		 
		 
		 // Updated 'selected state on any buttons in a button group 
       $('.buttonGroup li').click(function () {
		    $(this).siblings('.selected').removeClass('selected');
			$(this).addClass('selected');		
		});
		
		
		
		
        // Add event listeners to the filter buttons which are dynamically appended 
        $('.filterButtonGroup li').on("click", function () {			
            var selector = $(this).attr('data-filter'); // Get the data filter value
            console.log("Filtering on: " + selector);
            $(this).parent().siblings('.feedContainer').isotope({
                filter: selector
            });
			
        });		
		
		
		$('.buttonGroup').slideDown(500);
		
		// Open all links in a new window
		$(".rssItem a[href^='http://']").attr("target","_blank");
		
		
		// TinyNav dropdown menu
		$('.filterButtonGroup').tinyNav({
            active: 'selected'
        });
		
        // Enable lightbox, but not for mobile/touch devices. It screws up the page scrolling, and the phone back button exits the app completly
        if (!Modernizr.touch) {
            //initColorbox();
        }
		
		
		// Not sure this is needed, but relayout the last feed cos the images were getting cliped cos they loaded late.
		// setTimeout($($panel3).children('.feedContainer').isotope('reLayout'),2000);
    }
    /** Lightbox */
    function initColorbox() {
        $(".iframe").colorbox({
            iframe: true,
            width: "100%",
            height: "100%",
            maxWidth: "1024px",
            fixed: true,
            onOpen: function () { /* alert('onOpen: colorbox is about to open'); /*window.location.href += "#"*/
            },
            onClosed: function () { /*alert('onClosed: colorbox has completely closed'); /*window.location.href = history.back(); */
            }
        });
    }
	/** Google Analytics */
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-36831232-1']);
    _gaq.push(['_trackPageview']);
    (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
}); // End ready()