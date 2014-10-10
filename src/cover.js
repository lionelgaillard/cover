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
    this.$wrapper = this.getWrapper();

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
    $element.one('remove', this.onRemove);

    if (typeof this.options.onInit === 'function') {
      $element.one('initialized.'+PLUGIN_NAME, this.options.onInit);
    }

    if (typeof this.options.onLoad === 'function') {
      $element.one('loaded.'+PLUGIN_NAME, this.options.onLoad);
    }

    this.resize();

    $element.trigger('initialized.'+PLUGIN_NAME);

    if ($element.get(0).complete) {
      this.onLoad();
    } else {
      $element.one('load loadeddata', $.proxy(this.onLoad, this));
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
  Cover.prototype.onLoad = function () {
    this.resize();
    this.$element.trigger('loaded.'+PLUGIN_NAME);
  };

  Cover.prototype.getWrapper = function() {
    if (this.$wrapper) {
      return this.$wrapper;
    }

    this.$wrapper = this.options.attachment === 'fixed' ? $window : this._findWrapper();

    return this.$wrapper;
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
   * Get natural width
   *
   * @return {Number}
   */
  Cover.prototype.getNaturalWidth = function () {
    var $element = this.$element,
        element  = $element.get(0);

    return element.naturalWidth || element.width || $element.attr('width') || $element.width() || 1;
  };

  /**
   * Get natural height
   *
   * @return {Number}
   */
  Cover.prototype.getNaturalHeight = function () {
    var $element = this.$element,
        element  = $element.get(0);

    return element.naturalHeight || element.height || $element.attr('height') || $element.height() || 1;
  };

  /**
   * Get natural ratio
   *
   * @return {Number}
   */
  Cover.prototype.getNaturalRatio = function () {
    return this.getNaturalWidth() / this.getNaturalHeight();
  };

  /**
   * Get wrapper width
   *
   * @return {Number}
   */
  Cover.prototype.getWrapperWidth = function () {
    return this.getWrapper().width();
  };

  /**
   * Get wrapper height
   *
   * @return {Number}
   */
  Cover.prototype.getWrapperHeight = function () {
    return this.getWrapper().height();
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

    if (this.getWrapperRatio() < this.getNaturalRatio()) {
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
