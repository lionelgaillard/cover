;(function ($, window, undefined) {

  "use strict";


 /* BACKGROUND CLASS DEFINITION
  * =========================== */

  var Background = function (element, options) {
    this.options  = options;
    this.$element = $(element)
      .hide()
      .css({
        'position': 'absolute',
        'width': 'auto',
        'min-width': 'none',
        'max-width': 'none',
        'height': 'auto',
        'min-height': 'none',
        'max-height': 'none'
      });
    this.$wrapper = this.getWrapper();
    if (-1 == $.inArray(this.$wrapper.css('position'), ['absolute', 'relative', 'fixed'])) {
      this.$wrapper.css('position', 'relative');
    }
    this.$wrapper.css('overflow', 'hidden');
    $(window).resize($.proxy(this.resize, this));
    if (this.$element.get(0).complete) {
      this.onLoad();
    } else {
      this.$element.load($.proxy(this.onLoad, this));
    }
  };

  Background.prototype = {

    onLoad: function () {
      this.resize();
      if (typeof this.options.onLoad == 'function') {
        this.options.onLoad(this.$element);
      }
    },

    getWrapper: function () {
      if (!this.$wrapper) {
        this.$wrapper = this.$element.parent();
        while (
          this.$wrapper.not('body') &&
          -1 == $.inArray(this.$wrapper.css('display'), ['block', 'inline-block'])
        ) {
          this.$wrapper = this.$wrapper.parent();
        }
      }
      return this.$wrapper;
    },

    getWidth: function () {
      if (!this.width) {
        if (!(this.width = this.$element.attr('width'))) {
          this.width = this.$element.get(0).width || 1;
        }
      }
      return this.width;
    },

    getHeight: function () {
      if (!this.height) {
        if (!(this.height = this.$element.attr('height'))) {
          this.height = this.$element.get(0).height || 1;
        }
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
    }

  };


 /* BACKGROUND PLUGIN DEFINITION
  * ============================ */

  var old = $.fn.background;

  $.fn.background = function (option) {
    return this.each(function () {
      var $this   = $(this),
          data    = $this.data('background'),
          options = $.extend({}, $.fn.background.defaults, $this.data(), typeof option == 'object' && option);
      if (!data) {
        $this.data('background', (data = new Background(this, options)));
      }
      if (typeof option == 'string') {
        return data[option]();
      }
    });
  };

  $.fn.background.defaults = {
      posX  : 'center', // 'left', 'right' or anything else meaning center
      posY  : 'middle', // 'top', 'bottom' or anything else meaning middle
      onLoad: function ($el) {
        $el.fadeIn();
      }
  };

  $.fn.background.Constructor = Background;


 /* BACKGROUND NO CONFLICT
  * ====================== */

  $.fn.background.noConflict = function () {
    $.fn.background = old;
    return this;
  };


 /* BACKGROUND DATA-API
  * =================== */

  $(function () {
    $('[data-background="background"]').each(function () {
      var $this = $(this);
      $this.background($this.data());
    });
  });

})(window.jQuery, window);
