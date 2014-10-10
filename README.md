Cover
=====

Use `img` or `video` as a `background-size: cover;`.


Quick start
-----------

Wrapper can be `body` or any other element with `relative` or `absolute` `position`.

It will be automatically detected if not given.

If direct parent is an inline element (like an `a`), it will be ignored trough the closest valid ancestor.


### Javascript

```javascript
$(function ($) {
  $('.background-image').cover();
});
```

Default options
---------------

```javascript

  Cover.DEFAULTS = {

    // 'left', 'right' or 'center'
    x: 'center',

    // 'top', 'bottom' or 'middle'
    y: 'middle',

    // 'scroll' or 'fixed'
    attachment: 'scroll',

    // Wrapper selector used with 'closest'
    wrapper: undefined,

    // onInit
    onInit: function () {
      $(this).fadeTo(0, 0);
    },

    // onLoad
    onLoad: function () {
      $(this).fadeTo(400, 1);
    }

  };

```
