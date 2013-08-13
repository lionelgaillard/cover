;(function ($, undefined) {

  "use strict";


  // COVER CLASS DEFINITION
  // ======================

  function Cover (element, options) {
    this.options  = $.extend({}, Cover.DEFAULTS, options);
    this.$element = $(element).css({
        'position':   'absolute',
        'width':      'auto',
        'min-width':  'none',
        'max-width':  'none',
        'height':     'auto',
        'min-height': 'none',
        'max-height': 'none'
      });
    if (-1 == $.inArray(this.getWrapper().css('position'), ['absolute', 'relative', 'fixed'])) {
      this.getWrapper().css('position', 'relative');
    }
    this.getWrapper().css('overflow', 'hidden');

    if (typeof this.options.init == 'function') {
      this.options.init.call(this.$element);
    }

    $(window).resize($.proxy(this.resize, this));
    if (this.$element.get(0).complete) {
      this.load();
    } else {
      this.$element.load($.proxy(this.load, this));
    }
  };

  Cover.DEFAULTS = {

    // 'left', 'right' or 'center'
    posX:    'center',

    // 'top', 'bottom' or 'middle'
    posY:    'middle',

    // Used with 'closest'
    wrapper: undefined,

    // onInit
    init:    function () {
      $(this).fadeTo(0, 0);
    },

    // onLoad
    load:    function () {
      $(this).fadeTo(400, 1);
    }

  };

  $.extend(Cover.prototype, {

    load: function () {
      this.$element.trigger('load.cover');
      this.resize();
      if (typeof this.options.load == 'function') {
        this.options.load.call(this.$element);
      }
      this.$element.trigger('loaded.cover');
    },

    getWrapper: function () {
      if (!this.$wrapper) {
        if (typeof this.options.wrapper == 'string') {
          this.$wrapper = this.$element.closest(this.options.wrapper);
        } else {
          this.$wrapper = this.$element.parent();
          while (
            this.$wrapper.not('body') &&
            -1 == $.inArray(this.$wrapper.css('position'), ['relative', 'absolute']) &&
            -1 == $.inArray(this.$wrapper.css('display'), ['block', 'inline-block'])
          ) {
            this.$wrapper = this.$wrapper.parent();
          }
        }
      }
      return this.$wrapper;
    },

    getWidth: function () {
      if (!this.width) {
        this.width = this.$element.attr('width') || this.$element.get(0).width || 1;
      }
      return this.width;
    },

    getHeight: function () {
      if (!this.height) {
        this.height = this.$element.attr('height') || this.$element.get(0).height || 1;
      }
      return this.height;
    },

    getRatio: function () {
      if (!this.ratio) {
        this.ratio = this.getWidth() / this.getHeight();
      }
      return this.ratio;
    },

    getWrapperRatio: function () {
      return this.getWrapper().width() / (this.getWrapper().height() || 1);
    },

    resize: function () {
      this.$element.trigger('resize.cover');
      if (this.getWrapperRatio() < this.getRatio()) {
        this.$element.css({
          'width' : 'auto',
          'height': '100%',
          'top': 0
        });
        switch (this.options.posX) {
          case 'left':
            this.$element.css({
              left: 0,
              right: 'none'
            });
            break;
          case 'right':
            this.$element.css({
              left: 'none',
              right: 0
            });
            break;
          default:
            this.$element.css({
              left: -((this.$element.width() - this.$wrapper.width()) / 2),
              right: 'none'
            });
        }
      } else {
        this.$element.css({
          'width' : '100%',
          'height': 'auto',
          'left': 0
        });
        switch (this.options.posY) {
          case 'top':
            this.$element.css({
              top: 0,
              bottom: 'none'
            });
            break;
          case 'bottom':
            this.$element.css({
              top: 'none',
              bottom: 0
            });
            break;
          default:
            this.$element.css({
              top: -((this.$element.height() - this.$wrapper.height()) / 2),
              bottom: 'none'
            });
        }
      }
      this.$element.trigger('resized.cover');
    }

  });


  // COVER PLUGIN DEFINITION
  // =======================

  var old = $.fn.cover;

  $.fn.cover = function (option) {
    return this.each(function () {
      var $this   = $(this),
          data    = $this.data('wxr.cover'),
          options = typeof option == 'object' && option;

      if (!data) {
        $this.data('wxr.cover', (data = new Cover(this, options)));
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

})(window.jQuery);
