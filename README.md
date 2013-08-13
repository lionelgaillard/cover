Cover
=====

Use `img` as a background image.


Quick start
-----------

Cover's wrapper can be `body` or any other element with `block` or `inline-block` `display`.
If direct parent is an inline element (like a `a`), it will be ignored trough the closest valid ancestor.


### Javascript

```javascript
$(function ($) {
    $('.background-image').cover();
});
```

### Data API

```html
<body>
  <img src="img/background.jpg" data-size="cover" data-posX="left" data-posY="top" alt="My background image" />
</body>
```

Default options
---------------

```javascript
$.fn.background.defaults = {
  // 'left', 'right' or 'center'
  posX  : 'center',
  // 'top', 'bottom' or 'middle'
  posY  : 'middle',
  // onLoad callback
  onLoad: function ($el) {
    $el.fadeIn();
  }
};
```
