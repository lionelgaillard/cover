(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($, undefined) {

  "use strict";

  var PLUGIN_NAME = 'cover';

  var $window     = $(window);
  var old         = $.fn[PLUGIN_NAME];


  /**
   * Cover constructor
   *
   * @param {Element} element
   * @param {Object} options
   */
  function Cover (element, options) {
    this.$element = $(element);

    if (this.$element.data(PLUGIN_NAME)) {
      return this.$element.data(PLUGIN_NAME);
    }

    this.$element.data(PLUGIN_NAME, this);

    this.options  = $.extend({}, this.DEFAULTS, options || {}, this.$element.data());
    this.$wrapper = this._findWrapper();

    this.width    = null;
    this.height   = null;
    this.ratio    = null;

    this.onResize = null;
    this.onRemove = null;

    this._init();
  }

  /**
   * Defaults options
   *
   * @type {Object}
   */
  Cover.prototype.DEFAULTS = {

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
    onInit: undefined,

    // onLoad
    onLoad: undefined

  };

  /**
   * Init
   *
   * @access private
   * @return {void}
   */
  Cover.prototype._init = function () {
    var options = this.options,
        $element = this.$element,
        $wrapper = this.$wrapper;

    this._initWrapper();
    this._initElement();

    this.onResize = $.proxy(this.resize, this);
    this.onRemove = $.proxy(this.destroy, this);
    $window.on('resize', this.onResize);
    $window.on('orientationchange', this.onResize);
    this.$element.one('remove', this.onRemove);

    this.resize();

    // Callback
    if (typeof this.options.onInit === 'function') {
      this.options.onInit.call($element);
    }

    $element.trigger('initialized.'+PLUGIN_NAME);

    if ($element.get(0).complete) {
      this.loaded();
    } else {
      $element.one('load loadeddata', $.proxy(this.loaded, this));
    }
  };

  /**
   * Init wrapper
   *
   * @access private
   * @return {void}
   */
  Cover.prototype._initWrapper = function() {
    var options  = this.options,
        $wrapper = this.$wrapper;

    if (options.attachment === 'scroll' && !$wrapper.is('body')) {
      if (-1 === $.inArray($wrapper.css('position'), ['absolute', 'relative', 'fixed'])) {
        $wrapper.css('position', 'relative');
      }
      $wrapper.css('overflow', 'hidden');
    }
  };

  /**
   * Init element
   *
   * @access private
   * @return {void}
   */
  Cover.prototype._initElement = function() {
    this.$element.css({
      'position':   'absolute',
      'width':      'auto',
      'min-width':  '0',
      'max-width':  'none',
      'height':     'auto',
      'min-height': '0',
      'max-height': 'none'
    });
  };

  /**
   * Destroy
   *
   * @return {[type]}
   */
  Cover.prototype.destroy = function () {
    $window.off('resize', this.onResize);
    $window.off('orientationchange', this.onResize);
    this.$element.off('remove', this.onRemove);

    this.$element.removeData(PLUGIN_NAME);
  };

  /**
   * Loaded handler
   *
   * @return {void}
   */
  Cover.prototype.loaded = function () {
    // Reset
    this.width  = null;
    this.height = null;
    this.ratio  = null;

    this.resize();

    if (typeof this.options.onLoad === 'function') {
      this.options.onLoad.call(this.$element);
    }

    this.$element.trigger('loaded.'+PLUGIN_NAME);
  };

  /**
   * Find wrapper
   *
   * @access private
   * @return {jQuery}
   */
  Cover.prototype._findWrapper = function () {
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

  /**
   * Get original width
   *
   * @return {Number}
   */
  Cover.prototype.getOriginalWidth = function () {
    if (!this.width) {
      this.width = this.$element.attr('width') || this.$element.get(0).width || this.$element.width() || 1;
    }
    return this.width;
  };

  /**
   * Get original height
   *
   * @return {Number}
   */
  Cover.prototype.getOriginalHeight = function () {
    if (!this.height) {
      this.height = this.$element.attr('height') || this.$element.get(0).height || 1;
    }
    return this.height;
  };

  /**
   * Get original ratio
   *
   * @return {Number}
   */
  Cover.prototype.getOriginalRatio = function () {
    if (!this.ratio) {
      this.ratio = this.getOriginalWidth() / this.getOriginalHeight();
    }
    return this.ratio;
  };

  /**
   * Get wrapper width
   *
   * @return {Number}
   */
  Cover.prototype.getWrapperWidth = function () {
    var $wrapper = this.options.attachment === 'fixed' ? $window : this.$wrapper;

    return $wrapper.width();
  };

  /**
   * Get wrapper height
   *
   * @return {Number}
   */
  Cover.prototype.getWrapperHeight = function () {
    var $wrapper = this.options.attachment === 'fixed' ? $window : this.$wrapper;

    return $wrapper.height();
  };

  /**
   * Get wrapper ratio
   *
   * @return {Number}
   */
  Cover.prototype.getWrapperRatio = function () {
    return this.getWrapperWidth() / (this.getWrapperHeight() || 1);
  };

  /**
   * Resize
   *
   * @return {void}
   */
  Cover.prototype.resize = function () {
    var options  = this.options,
        $element = this.$element;

    if (this.getWrapperRatio() < this.getOriginalRatio()) {
      this._resizeNarrower();
    } else {
      this._resizeWider();
    }

    $element.trigger('resized.'+PLUGIN_NAME);
  };

  /**
   * Resize when narrower
   *
   * @access private
   * @return {void}
   */
  Cover.prototype._resizeNarrower = function() {
    var options  = this.options,
        $element = this.$element;

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

  };

  /**
   * Resize when wider
   *
   * @access private
   * @return {void}
   */
  Cover.prototype._resizeWider = function() {
    var options  = this.options,
        $element = this.$element;

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

  };

  /**
   * jQuery plugin
   *
   * @param  {Object} o
   * @return {jQuery}
   */
  $.fn[PLUGIN_NAME] = function (o) {
    return this.each(function () {
      var $this    = $(this),
          instance = $this.data(PLUGIN_NAME),
          options  = typeof o === 'object' ? o : {};

      if (!instance) {
        instance = new Cover(this, options);
      }

      if (typeof o === 'string') {

        if (o === 'resize') {
          instance.resize();
        } else if (o === 'destroy') {
          instance.destroy();
        }

      }
    });
  };

  $.fn.cover.Constructor = Cover;

  /**
   * No conflict
   *
   * @return Plugin
   */
  $.fn.cover.noConflict = function () {
    $.fn.cover = old;
    return this;
  };

  return Cover;

}));
