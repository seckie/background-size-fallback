/**
 * background-size fallback
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/background-size-fallback
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @require    Modernizr, jQuery, jquery-preloadimg(https://github.com/seckie/jquery-preloadimg.git)
 */

;(function($, window, document, undefined) {

window.BackgroundSizeFallback = function (options) {
	this.opt = {
		test: false,
		el: null,
		fullscreen: true,
		sizeX: 'auto',
		sizeY: 'auto'
	};
	$.extend(this.opt, options);
	this.initialize();
};

window.BackgroundSizeFallback.prototype = {
	el: document.body,
	initialize: function (options) {
		var self = this;
		var el = this.opt.el || this.el;
		this.$el = $(el);
		if (!Modernizr.backgroundsize || this.opt.test) {
			this.render();
		}
		$(window).on('resize', function () {
			self.resetImageSize(self.$el.find('img'));
		});
	},
	render: function () {
		var self = this;
		var $bd = $('body');
		this.$el.each(function (i, el) {
			var url = self.getBackgroundImageURL(el);
			var $img = self.createImage(el, url);
			$bd.preloadimg({
				srcs: [url],
				complete: function (imgHolder) {
					self.resetImageSize($img);
					self.appendImage(el, $img);
					// save URL for preload
					$.data(el, 'backgroundimageurl', url);
				}
			});
		});
	},
	getBackgroundImageURL: function (el) {
		var url = $(el).css('background-image');
		return url.replace(/url\(['"]?([^'"\)]*)['"]?\)/, '$1');
	},
	createImage: function (el, url) {
		var $img = $('<img/>', {
			src: url,
			alt: ''
		}).css({
			position: 'absolute',
			top: 0,
			left: '50%'
		});
		return $img;
	},
	getImageSize: function ($orgimg) {
		var w, h;
		var $img = $orgimg.clone();
		$img.css({
			visibility: 'hidden',
			position: 'absolute',
			left: -9999
		}).appendTo(document.body);
		w = $img.width();
		h = $img.height();
		$img.remove();
		return {
			width: w,
			height: h
		};
	},
	resetImageSize: function ($img) {
		var elW = this.$el.width();
		var elH = this.$el.height();
		var size = this.getImageSize($img);
		var ratio = size.width / size.height;
		var sizeX = this.opt.sizeX;
		var sizeY = this.opt.sizeY;
		var w, h, percentage;

		if (/%$/.test(sizeX)) { // % size
			sizeX = sizeX.slice(0, -1);
			percentage = sizeX / 100;
			sizeX = Math.ceil(elW * percentage);
		}
		if (/%$/.test(sizeY)) { // % size
			sizeY = sizeY.slice(0, -1);
			percentage = sizeY / 100;
			sizeY = Math.ceil(elH * percentage);
		}
		if (sizeX === 'auto') {
			sizeX = elW;
		}
		if (sizeY === 'auto') {
			sizeY = elH;
		}


		if (this.opt.fullscreen === true) {
			if (&& elH * ratio < elW) { // landscape
				w = sizeX;
				h = Math.floor(sizeX / ratio);
			} else { // portrait
				w = Math.floor(sizeY * ratio);
				h = sizeY;
			}
		}

		// if number is set in sizeX & sizeY, force size to it.
		if (typeof this.opt.sizeX === 'number') {
			w = this.opt.sizeX;
		}
		if (typeof this.opt.sizeY === 'number') {
			h = this.opt.sizeY;
		}

		$img.css({
			width: w,
			height: h,
			left: '50%',
			visibility: '',
			marginLeft: -1 * (w / 2)
		});
	},
	appendImage: function (el, $img) {
		$(el).append($img).css('background-image', 'none');
	}
};

})(jQuery, this, this.document);
