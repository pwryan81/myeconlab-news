/**
 * Plugin: jquery.zRSSFeed - http://www.zazar.net/developers/jquery/zrssfeed/
 * 
 * Version: 1.1.6x
 * (c) Copyright 2010-2012, Zazar Ltd
 * 
 * Description: jQuery plugin for display of RSS feeds via Google Feed API
 *              (Based on original plugin jGFeed by jQuery HowTo. Filesize function by Cary Dunn.)
 * 
 * History: 
 * 1.1.9 - New dateformat option to allow feed date formatting
 * 1.1.6x- Forked: zRSSFeed by Zazar, modified to support multiple RSS Feeds. (https://github.com/AnalogJ/zRSSFeed)
 * 1.1.6 - Added sort options
 * 1.1.5 - Target option now applies to all feed links
 * 1.1.4 - Added option to hide media and now compressed with Google Closure
 * 1.1.3 - Check for valid published date
 * 1.1.2 - Added user callback function due to issue with ajaxStop after jQuery 1.4.2
 * 1.1.1 - Correction to null xml entries and support for media with jQuery < 1.5
 * 1.1.0 - Added support for media in enclosure tags
 * 1.0.3 - Added feed link target
 * 1.0.2 - Fixed issue with GET parameters (Seb Dangerfield) and SSL option
 * 1.0.1 - Corrected issue with multiple instances
 *
 **/
(function ($) {
	//var	myJsonObject;  //globally accessible variable
	
    $.fn.rssfeed = function (JSONfeedsource, options, fn) {
				
        // Set plugin defaults
        var defaults = {			
            limit: 5,
            header: true,
            titletag: 'h4',
            date: true,
            dateformat: 'timeline',
            content: true,
            snippet: false,
            media: false,
            showerror: true,
            errormsg: '',
            key: null,
            ssl: false,
            /*linktarget: '_self',*/
            sort: 'date',
            sortasc: false,
			searchterm: ''  // PR added
        };
        var options = $.extend(defaults, options);
        // Functions
        return this.each(function (i, e) {
            var $e = $(e);
            var s = '';
            // Check for SSL protocol
            if (options.ssl) s = 's';
            // Add feed class to user div
            if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');
            // Check for valid url
            if (JSONfeedsource == null || JSONfeedsource.length == 0) return false;			
			//myJsonObject = JSONfeedsource; // Store JSONfeedsource into global variable
            //Storage for multiple feeds. Holds an array of objects, each containing the processed HTML and timestamp for sorting
            var itemArray = [];
            var feedsToHandle = JSONfeedsource.length;
            
			// Send request
            for (var i=0; i<JSONfeedsource.length; i++ ) {
				var url = JSONfeedsource[i].feedurl;
				//console.log("searchterm: " + options.searchterm);
				if (options.searchTerm != ''){ 
					//console.log("Adding " + options.searchterm + " to the URL")	
					url += options.searchterm; 
					console.log("url:" + url);
				}
				else {
					console.log("No SearchTerm provided")					
				};
				 //If a searchTerm is given, append it to the end of the URL. e.g. http://pipes.yahoo.com/pipes/pipe.run?_id=27d003c8b270e059766d0b1fc5060e82&_render=rss&search=Australia
				var classname = JSONfeedsource[i].classname;
                // Create Google Feed API address
                var api = "http" + s + "://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent(url);
                if (options.limit != null) api += "&num=" + options.limit;
                if (options.key != null) api += "&key=" + options.key;
                api += "&output=json_xml"
				
				
                // Send ASYNCHRONOUS request. This block executes independantly of the surrounding code			
                $.getJSON(api, function (data) {
                    // Check for error
					console.log("SERVER DATA RECEIVED");
                    if (data.responseStatus == 200) {
                        feedsToHandle--;
                        // Process the feeds
						/* Send the following to _process()
						e: element #feedContainer2
						data.responseData: Object [feed [Object], xmlString]
						options: Object. see options above
						itemArray: []
						*/
						itemArray = _process(e, data.responseData, options, itemArray);       // SEND THE ITEMARRAY TO BE PROCESSED AND RETURNED IN THE SAME OBJECT						
                    } else {
                        feedsToHandle--;
                        // Handle error if required
                        if (options.showerror) if (options.errormsg != '') {
                            var msg = options.errormsg;
                        } else {
                            var msg = data.responseDetails;
                        };
                        $(e).html('<div class="rssError"><p>'+ msg +'</p></div>');
                    };
                    if (feedsToHandle == 0) {
                        //SORT IF REQUIRED.
                        itemArray = sortArray(itemArray, options);
                        //write to page, once per rssfeed instance
                        writeToPage(e, itemArray, options);
                        // Optional user callback function
                        if ($.isFunction(fn)) fn.call(this, $e);	
                    }
                });				
				
            } // End for loop
        }); // End this.each()
    }; // End rssfeed()
	
	
	
	
	
	
	
	
	
	
	/* ---------------------------------------------- */
	// The following functions support the plugin above
	
    // Function to create HTML result array
    var _process = function (e, data, options, itemArray) {	
				
        // Get JSON feed data
        var feeds = data.feed;
        if (!feeds) {
            return false;
        }
        // Get XML data for media (parseXML not used as requires 1.5+)
        if (options.media) {
            var xml = getXMLDocument(data.xmlString);
            var xmlEntries = xml.getElementsByTagName('item');
        }
        // Loop through the number of items of each feed
        for (var i = 0; i < feeds.entries.length; i++) {
            var currentItem = itemArray.length;
            itemArray[currentItem] = {};
            // Get individual feed
            var entry = feeds.entries[i];
            var pubDate;
            var sort = '';
            // Apply sort column
            switch (options.sort) {
                case 'title':
                    sort = entry.title;
                    break;
                case 'date':
                    sort = entry.publishedDate;
                    break;
            }
            itemArray[currentItem]['sort'] = sort;
            // Format published date
            if (entry.publishedDate) {
                var entryDate = new Date(entry.publishedDate);
                var pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
                switch (options.dateformat) {
                    case 'datetime':
                        break;
                    case 'date':
                        pubDate = entryDate.toLocaleDateString();
                        break;
                    case 'time':
                        pubDate = entryDate.toLocaleTimeString();
                        break;
                    case 'timeline':
                        pubDate = _getLapsedTime(entryDate);
                        break;
                    default:
                        pubDate = _formatDate(entryDate, options.dateformat);
                        break;
                }
            }
			
			
			// Open the LI for the item. Set the class to the classname value in the JSON object
			var filterClass = feeds.link;
			filterClass = filterClass.match(/:\/\/(www\.)?(.[^/:]+)/)[2].replace(/\./g,'-');
			
			itemArray[currentItem]['html'] = '<li class="rssItem ' + filterClass + '">';
				
            // Add feed row            
			itemArray[currentItem]['html'] += '<a href="' + entry.link + '" class="iframe" title="' + entry.title + ' - ' + feeds.title + '"><' + options.titletag + '>' + entry.title + '</' + options.titletag + '></a>';
			
			// Add feed source 
			itemArray[currentItem]['html'] += '<div  class="feedTitle">' + feeds.title + '</div>';
			
            // Add pubDate
            if (options.date && pubDate) itemArray[currentItem]['html'] += '<div  class="pubDate">' + pubDate + ' </div>'
            // feeds.title
            //if (feeds.title) itemArray[currentItem]['html'] += '<div  class="feedTitle">'+ feeds.title +'</div>'
            if (options.content) {
                // Use feed snippet if available and optioned
                if (options.snippet && entry.contentSnippet != '') {
                    var content = entry.contentSnippet;
                } else {
                    var content = entry.content;
                }
                itemArray[currentItem]['html'] += '<p>' + content + '</p>'				
            }
            // Add any media
            if (options.media && xmlEntries.length > 0) {
                var xmlMedia = xmlEntries[i].getElementsByTagName('enclosure');
                if (xmlMedia.length > 0) {
                  /*  itemArray[currentItem]['html'] += '<div class="rssMedia"><div>Media files</div><ul>'
                    for (var m = 0; m < xmlMedia.length; m++) {
                        var xmlUrl = xmlMedia[m].getAttribute("url");
                        var xmlType = xmlMedia[m].getAttribute("type");
                        var xmlSize = xmlMedia[m].getAttribute("length");
                        itemArray[currentItem]['html'] += '<li><a href="' + xmlUrl + '" title="Download this media">' + xmlUrl.split('/').pop() + '</a> (' + xmlType + ', ' + formatFilesize(xmlSize) + ')</li>';
                    }*/
					itemArray[currentItem]['html'] += '<img src="' + xmlMedia[0].getAttribute("url") + '">';
					
                }
            }
			 // Close Item LI
			itemArray[currentItem]['html'] += "</li>";
			
        }
        return itemArray;
    };




	/* ---------- SORT ARRAY -------------*/
    function sortArray(itemArray, options) {
        // Sort if required
        if (options.sort) {
            itemArray.sort(function (a, b) {
                // Apply sort direction
                if (options.sortasc) {
                    var c = a['sort'];
                    var d = b['sort'];
                } else {
                    var c = b['sort'];
                    var d = a['sort'];
                }
                if (options.sort == 'date') {
                    return new Date(c) - new Date(d);
                } else {
                    c = c.toLowerCase();
                    d = d.toLowerCase();
                    return (c < d) ? -1 : (c > d) ? 1 : 0;
                }
            });
        }
        return itemArray;
    }



	/* ---------- WRITE TO PAGE -------------*/
    function writeToPage(e, itemArray, options) {
		//WriteToPage called once per RSSfeed instance"
        // Add rows to output
       
        var html = '<ul>'
        $.each(itemArray, function (e) {
			html +=  itemArray[e]['html']               
        });
        html += '</ul>';
        $(e).html(html);		
    }


    function formatFilesize(bytes) {
        var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
    }
    var _formatDate = function (date, mask) {
        // Convert to date and set return to the mask
        var fmtDate = new Date(date);
        date = mask;
        // Replace mask tokens
        date = date.replace('dd', _formatDigit(fmtDate.getDate()));
        date = date.replace('MM', _formatDigit(fmtDate.getMonth() + 1));
        date = date.replace('yyyy', fmtDate.getFullYear());
        date = date.replace('hh', _formatDigit(fmtDate.getHours()));
        date = date.replace('mm', _formatDigit(fmtDate.getMinutes()));
        date = date.replace('ss', _formatDigit(fmtDate.getSeconds()));
        return date;
    }
    var _formatDigit = function (digit) {
        digit += '';
        if (digit.length < 2) digit = '0' + digit;
        return digit;
    }


        function getXMLDocument(string) {
            var browser = navigator.appName;
            var xml;
            if (browser == 'Microsoft Internet Explorer') {
                xml = new ActiveXObject('Microsoft.XMLDOM');
                xml.async = 'false';
                xml.loadXML(string);
            } else {
                xml = (new DOMParser()).parseFromString(string, 'text/xml');
            }
            return xml;
        }
    var _getLapsedTime = function (date) {
        // Get current date and format date parameter
        var todayDate = new Date();
        var pastDate = new Date(date);
        // Get lasped time in seconds
        var lapsedTime = Math.round((todayDate.getTime() - pastDate.getTime()) / 1000)
        // Return lasped time in seconds, minutes, hours, days and weeks
        if (lapsedTime < 60) {
            return '< 1 min';
        } else if (lapsedTime < (60 * 60)) {
            var t = Math.round(lapsedTime / 60) - 1;
            var u = 'min';
        } else if (lapsedTime < (24 * 60 * 60)) {
            var t = Math.round(lapsedTime / 3600) - 1;
            var u = 'hour';
        } else if (lapsedTime < (7 * 24 * 60 * 60)) {
            var t = Math.round(lapsedTime / 86400) - 1;
            var u = 'day';
            // Case "Yesterday"
            if (lapsedTime < 2 * 24 * 60 * 60) {
                t = '';
                u = 'Yesterday';
            }
        } else {
            var t = Math.round(lapsedTime / 604800) - 1;
            var u = 'week';
        }
        // Check for plural units
        if (t > 1) u += 's';
        return t + ' ' + u + ' ago';
    }
})(jQuery);