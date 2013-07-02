Background
==========

Use `img` as a background image.


Quick start
-----------

Background's wrapper can be `body` or anything else element with `block` or `inline-block` `display`.
If direct parent is an inline element (like a `a`), it will be ignored trough the closest valid ancestor.


### Javascript

```javascript
$(function ($) {
    $('.background-image').background();
});
```

### Data API

```html
<body>
  <img src="img/background.jpg" data-background="background" data-posX="left" data-posY="top" alt="My background image" />
</body>
```

Default options
---------------

```javascript
$.fn.background.defaults = {
  posX  : 'center', // 'left', 'right' or anything else meaning center
  posY  : 'middle', // 'top', 'bottom' or anything else meaning middle
  onLoad: function ($el) {
    $el.fadeIn();
  }
};
```
