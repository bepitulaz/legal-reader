/**
 * A javascript library for converting legal document into user friendly form.
 *
 * @author: AsepCo Team
 * @license: MIT License
 */
(function($) {
  
  /**
   * The main function to be called from the front end.
   * @param {string} contentLegal - legal document in html form
   * @param {object} options - For setting up the plugin.
   */ 
  $.fn.legalreader = function(contentLegal, options) {
    
    // default settings
    var settings = $.extend({
      form: true,
      legalName: "Terms and Conditions",
      legalSentence: "Read our",
      legalAccept: "I have agreed with the",
      wordPerMinute: 275,
      timeString: "minutes reading" 
    }, options);
    
    /**
     * Count reading time inside legal content.
     * @param {string} legalContent - the text from the legal document
     * @returns {integer} The average time to read the content
     */
    function countReadingTime(legalContent) {
      var wordCount = legalContent.replace(/[^\w\s]/g, "").split(/\s+/).length;
      var averageTime = wordCount / settings.wordPerMinute;
      return Math.round(averageTime);
    }
    
    /**
     * Render the button and the content of the legal document on popup overlay.
     * @param {object} opt - It is the same as plugin settings parameter.
     * @param {integer} readingTime - The total time to read the content.
     * @returns {string} html to be rendered on the front end.
     */
    function renderTheHtml(opt, readingTime) {
      var htmlContent = opt.legalSentence + " "; 
      htmlContent += "<a href=\"\" id=\"open-legal\">"+opt.legalName+"</a> ("+readingTime+" "+opt.timeString+")";
      htmlContent += "<div class=\"overlay overlay-slidedown\">";
      htmlContent += "<div class=\"legal-container\">";
      htmlContent += "<div class=\"legal-point\"></div>";
      htmlContent += "<div class=\"legal-wrapper\"></div>";
      htmlContent += "</div>";
      htmlContent += "<div class=\"clear\"></div>";
      htmlContent += "</div>";
      return htmlContent;
    }
    
    /**
     * Append 'Accept' or 'Decline' button to the document.
     * @param {boolean} isForm - determine the location plugin
     * @returns {string} - button accept and decline
     */ 
    function appendActionButton(isForm) {
      if(isForm === true) {
        var htmlButton = "<div class=\"legal-button\">"; 
        htmlButton += "<button type=\"button\" id=\"legal-decline\">Decline</button>";
        htmlButton += "<button type=\"button\" id=\"legal-accept\">Accept</button>";
        htmlButton += "</div>";
      } else {
        var htmlButton = "<div class=\"legal-button\">"; 
        htmlButton += "<button type=\"button\" id=\"legal-close\">Close</button>";
        htmlButton += "</div>"; 
      }
      return htmlButton; 
    }
    
    /**
     * Accepting the legal button.
     * @returns {string} - Notifications when accept the terms.
     */
    function acceptTheLegal() {
      var htmlAccept = settings.legalAccept + " " + settings.legalName;
      return htmlAccept;
    }
    
    /**
     * Creating bullet points for the legal document.
     * @param {array} points - List of points
     * @returns {function}
     */ 
    function createBulletPoint(points) {
      $('.legal-point').empty();
      
      // Sorry, no for loop. Do it recursively.
      return (function(p, i) { 
        $('.legal-point').append('<ul>');
        if (i < p.length) {
          $('.legal-point').append("<a href=\"#"+p[i].id+"\">"+p[i].text+"</a>");
          return arguments.callee(p, i+1);          
        } else { 
          return $('.legal-point').append('</ul>');;
        }  
      })(points, 0);
    }
    
    /**
     * When the plugin is used inside the form. It will modify the submit button.
     * @param {object} tag - html tag where the plugin will be used
     */
    function insideTheForm(tag) {
      var readingTime = countReadingTime(contentLegal);
      tag.html(renderTheHtml(settings, readingTime));
      $('input[type="submit"]').attr("disabled", "disabled");
      
      // event for opening and closing the overlay 
      $('#open-legal').click(function(e) {
        e.preventDefault();
        $('.overlay-slidedown').addClass('open');     

        // inject the html from markdown
        $('.legal-wrapper').html(contentLegal);
        $('.overlay-slidedown').append(appendActionButton(settings.form));        
        $('#legal-accept').attr('disabled', 'disabled');

        // inject list of legal document's point
        var legalPoint = $('.legal-wrapper').find('h3').map(function() {
          return {
            id: $(this).attr('id'),
            text: $(this).text() 
          };
        });
        createBulletPoint(legalPoint);
        
        // tracking the scrollbar
        var legalWrapper = $('.legal-wrapper');
        legalWrapper.bind('scroll', {contentHeight: legalWrapper[0].scrollHeight}, function(evt) {
          var innerHeight = $(this).innerHeight();
          var position = $(this).scrollTop();
          var overflowHeight = evt.data.contentHeight - innerHeight;
          
          if(position >= overflowHeight) {
            $('#legal-accept').removeAttr('disabled');
          } else {
            return false;
          }
        });

        // decline the legal
        $('#legal-decline').click(function() {
          $('.overlay-slidedown').removeClass('open');
          $('.legal-button').remove();
        });

        // accept the legal
        $('#legal-accept').bind('click', {selector: tag}, function(evt) { 
          $('.overlay-slidedown').removeClass('open');
          $('.legal-button').remove();
          evt.data.selector.html(acceptTheLegal());
          $('input[type="submit"]').removeAttr('disabled');
        });     
      });
    }
    
    /**
     * When the plugin is used outside the form.
     * @param {object} tag - html selector to be modified.
     */
    function outsideTheForm(tag) {
      // making the tool tip
      tag.addClass('legal-top-tip');
      tag.attr('data-tips', countReadingTime(contentLegal) + " " + settings.timeString);

      tag.click(function(e) {
        e.preventDefault();
        $('.overlay-slidedown').addClass('open');     
        
        // inject the html from markdown
        $('.legal-wrapper').html(contentLegal);
        $('.overlay-slidedown').append(appendActionButton(settings.form));

        // inject list of legal document's point
        var legalPoint = $('.legal-wrapper').find('h3').map(function() {
          return {
            id: $(this).attr('id'),
            text: $(this).text() 
          };
        });
        createBulletPoint(legalPoint);
        
        // close the legal
        $('#legal-close').click(function() {
          $('.overlay-slidedown').removeClass('open');
          $('.legal-button').remove();
        });
      }); 
    }

    /**
     * The main function of the plugin.
     *
     */
    return (function(htmlSelector) {
      if(settings.form === true) {
        insideTheForm(htmlSelector);
      } else {
        outsideTheForm(htmlSelector); 
      } 
    })(this);  
  }
})(jQuery);
