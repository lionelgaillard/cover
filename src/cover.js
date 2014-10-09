;(function ($, window) {

  "use strict";

  var $window = $(window);


  // COVER CLASS DEFINITION
  // ======================

  function Cover (element, options) {
    this.options  = $.extend({}, Cover.DEFAULTS, options);
    this.$element = $(element);
    this.$wrapper = this.findWrapper();

    this.width    = null;
    this.height   = null;
    this.ratio    = null;

    this.onResize = null;
    this.onRemove = null;

    this.init();
  }

  Cover.DEFAULTS = {

    // 'left', 'right' or 'center'
    x: 'center',

    // 'top', 'bottom' or 'center'
    y: 'center',

    // 'scroll' or 'fixed'
    attachment: 'scroll',

    // Wrapper selector used with 'closest'
    wrapper: null,

    // Use CSS if browser is compatible
    css: true,

    // onInit
    onInit: function () {
      $(this).fadeTo(0, 0);
    },

    // onLoad
    onLoad: function () {
      $(this).fadeTo(400, 1);
    }

  };

  Cover.prototype.init = function () {
    var options = this.options,
        $element = this.$element,
        $wrapper = this.$wrapper;

    // Use css 'background-size' if supported
    if (options.css && ($('html').hasClass('bgsizecover') || (!window.Modernizr && $wrapper.css('background-size', 'cover') && $wrapper.css('background-size') === 'cover'))) {
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
      'position':   'absolute',
      'width':      'auto',
      'min-width':  '0',
      'max-width':  'none',
      'height':     'auto',
      'min-height': '0',
      'max-height': 'none'
    });

    // Bindings
    this.onResize = $.proxy(this.resize, this);
    this.onRemove = $.proxy(this.destroy, this);
    $window.on('resize', this.onResize);
    $window.on('orientationchange', this.onResize);
    $element.one('remove', this.onRemove);

    // Callback
    if (typeof this.options.onInit === 'function') {
      this.options.onInit.call($element);
    }

    $element.trigger('initialized.cover');

    if ($element.get(0).complete) {
      this.loaded();
    } else {
      $element.one('load', $.proxy(this.loaded, this));
    }
  };

  Cover.prototype.destroy = function () {
    $window.off('resize', this.onResize);
    $window.off('orientationchange', this.onResize);
    this.$element.off('remove', this.onRemove);
    this.$element.removeData('wxr.cover');
  };

  Cover.prototype.loaded = function () {
    this.resize();

    if (typeof this.options.onLoad === 'function') {
      this.options.onLoad.call(this.$element);
    }

    this.$element.trigger('loaded.cover');
  };

  Cover.prototype.findWrapper = function () {
    var options  = this.options,
        $element = this.$element,
        $wrapper;

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
    return $wrapper;
  };

  Cover.prototype.getOriginalWidth = function () {
    if (!this.width) {
      this.width = this.$element.attr('width') || this.$element.get(0).width || 1;
    }
    return this.width;
  };

  Cover.prototype.getOriginalHeight = function () {
    if (!this.height) {
      this.height = this.$element.attr('height') || this.$element.get(0).height || 1;
    }
    return this.height;
  };

  Cover.prototype.getOriginalRatio = function () {
    if (!this.ratio) {
      this.ratio = this.getOriginalWidth() / this.getOriginalHeight();
    }
    return this.ratio;
  };

  Cover.prototype.getWrapperWidth = function () {
    var $wrapper = this.options.attachment === 'fixed' ? $window : this.$wrapper;

    return $wrapper.width();
  };

  Cover.prototype.getWrapperHeight = function () {
    var $wrapper = this.options.attachment === 'fixed' ? $window : this.$wrapper;

    return $wrapper.height();
  };

  Cover.prototype.getWrapperRatio = function () {
    return this.getWrapperWidth() / (this.getWrapperHeight() || 1);
  };

  Cover.prototype.resize = function () {
    var options  = this.options,
        $element = this.$element;

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
        $this.data('wxr.cover', data = new Cover(this, options));
      }

      if (typeof o === 'string') {

        if (o === 'resize') {
          data.resize();
        } else if (o === 'destroy') {
          data.destroy();
        }

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

  $(function () {
    $('[data-size="cover"]').each(function () {
      var $this = $(this);
      $this.cover($this.data());
    });
  });

})(window.jQuery, window);
