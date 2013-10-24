;(function ($, window, undefined) {

  "use strict";

  var $window = $(window);


  // COVER CLASS DEFINITION
  // ======================

  function Cover (element, options) {
    var options, $element, $wrapper;

    this.options  = options  = $.extend({}, Cover.DEFAULTS, options);
    this.$element = $element = $(element);
    $wrapper      = this.getWrapper();

    // Use css 'background-size' if supported
    if (
      options.css
      && ($('html').hasClass('bgsizecover')
        || (!window.Modernizr
          && $wrapper.css('background-size', 'cover')
          && $wrapper.css('background-size') === 'cover'
        )
      )
    ) {
      $wrapper.css({
        'background-image':      'url(' + $element.attr('src') + ')',
        'background-position':   options.x + ' ' + options.y,
        'background-attachment': options.attachment
      });
      $element.hide();
      return;
    }

    // Init wrapper
    if (options.attachment === 'scroll' && !$wrapper.is('body')) {
      if (-1 === $.inArray($wrapper.css('position'), ['absolute', 'relative', 'fixed'])) {
        $wrapper.css('position', 'relative');
      }
      $wrapper.css('overflow', 'hidden');
    }

    // Init element
    $element.css({
      // 'position':   options.attachment === 'fixed' ? 'fixed' : 'absolute',
      'position':   'absolute',
      'width':      'auto',
      'min-width':  '0',
      'max-width':  'none',
      'height':     'auto',
      'min-height': '0',
      'max-height': 'none'
    });

    if (typeof options.init === 'function') {
      options.init.call($element);
    }

    // Bindings
    $window.resize($.proxy(this.resize, this));

    if ($element.get(0).complete) {
      this.load();
    } else {
      $element.load($.proxy(this.load, this));
    }

  };

  Cover.DEFAULTS = {

    // 'left', 'right' or 'center'
    x: 'center',

    // 'top', 'bottom' or 'middle'
    y: 'middle',

    // 'scroll' or 'fixed'
    attachment: 'scroll',

    // Wrapper selector used with 'closest'
    wrapper: undefined,

    // Use CSS if browser is compatible
    css: true,

    // onInit
    init: function () {
      $(this).fadeTo(0, 0);
    },

    // onLoad
    load: function () {
      $(this).fadeTo(400, 1);
    }

  };

  Cover.prototype = {

    load: function () {
      this.$element.trigger('load.cover');
      this.resize();
      if (typeof this.options.load === 'function') {
        this.options.load.call(this.$element);
      }
      this.$element.trigger('loaded.cover');
    },

    getWrapper: function () {
      var options  = this.options,
          $wrapper = this.$wrapper,
          $element = this.$element;

      if ($wrapper === undefined) {
        if (typeof options.wrapper === 'string') {
          $wrapper = $element.closest(options.wrapper);
        } else {
          $wrapper = $element.parent();
          while (
            !$wrapper.is('body') &&
            -1 === $.inArray($wrapper.css('position'), ['relative', 'absolute']) &&
            -1 === $.inArray($wrapper.css('display'), ['block', 'inline-block'])
          ) {
            $wrapper = $wrapper.parent();
          }
        }
        this.$wrapper = $wrapper;
      }
      return $wrapper;
    },

    getOriginalWidth: function () {
      if (!this.width) {
        this.width = this.$element.attr('width') || this.$element.get(0).width || 1;
      }
      return this.width;
    },

    getOriginalHeight: function () {
      if (!this.height) {
        this.height = this.$element.attr('height') || this.$element.get(0).height || 1;
      }
      return this.height;
    },

    getOriginalRatio: function () {
      if (!this.ratio) {
        this.ratio = this.getOriginalWidth() / this.getOriginalHeight();
      }
      return this.ratio;
    },

    getWrapperWidth: function () {
      var self = this,
          options = this.options,
          $wrapper;
      if (this.wrapperWidth === undefined) {
        $wrapper = options.attachment === 'fixed' ? $window : this.getWrapper();
        this.wrapperWidth = $wrapper.width();
        $window.resize(function () {
          self.wrapperWidth = $wrapper.width();
        });
      }
      return this.wrapperWidth;
    },

    getWrapperHeight: function () {
      var options = this.options,
          $wrapper;
      if (this.wrapperHeight === undefined) {
        $wrapper = options.attachment === 'fixed' ? $window : this.getWrapper();
        this.wrapperHeight = $wrapper.height();
        $window.resize(function () {
          self.wrapperHeight = $wrapper.height();
        });
      }
      return this.wrapperHeight;
    },

    getWrapperRatio: function () {
      return this.getWrapperWidth() / (this.getWrapperHeight() || 1);
    },

    resize: function () {
      var options  = this.options,
          $element = this.$element;

      $element.trigger('resize.cover');

      if (this.getWrapperRatio() < this.getOriginalRatio()) {
        $element.css({
          'width' : 'auto',
          'height': '100%',
          'top': 0
        });
        switch (options.x) {
          case 'left':
            $element.css({
              left: 0,
              right: 'none'
            });
            break;
          case 'right':
            $element.css({
              left: 'none',
              right: 0
            });
            break;
          default:
            $element.css({
              left: -(($element.width() - this.getWrapperWidth()) / 2),
              right: 'none'
            });
        }
      } else {
        $element.css({
          'width' : '100%',
          'height': 'auto',
          'left': 0
        });
        switch (options.y) {
          case 'top':
            $element.css({
              top: 0,
              bottom: 'none'
            });
            break;
          case 'bottom':
            $element.css({
              top: 'none',
              bottom: 0
            });
            break;
          default:
            $element.css({
              top: -(($element.height() - this.getWrapperHeight()) / 2),
              bottom: 'none'
            });
        }
      }

      $element.trigger('resized.cover');
    }

  };


  // COVER PLUGIN DEFINITION
  // =======================

  var old = $.fn.cover;

  $.fn.cover = function (o) {
    return this.each(function () {
      var $this   = $(this),
          data    = $this.data('wxr.cover'),
          options = typeof o === 'object' ? o : {};

      if (!data) {
        $this.data('wxr.cover', (data = new Cover(this, $.extend({}, options, $this.data()))));
      }

      if (o === 'resize') {
        data.resize();
      }
    });
  };

  $.fn.cover.Constructor = Cover;


  // COVER NO CONFLICT
  // =================

  $.fn.cover.noConflict = function () {
    $.fn.cover = old;
    return this;
  };


  // COVER DATA-API
  // ==============

  $(window).on('load', function () {
    $('img[data-size="cover"]').each(function () {
      var $this = $(this);
      $this.cover($this.data());
    });
  });

})(window.jQuery, window);
