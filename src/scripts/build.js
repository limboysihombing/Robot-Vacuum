(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  module.exports = function(options) {
    return function(deck) {
      var activeSlideIndex,
        activeBulletIndex,
  
        bullets = deck.slides.map(function(slide) {
          return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
        }),
  
        next = function() {
          var nextSlideIndex = activeSlideIndex + 1;
  
          if (activeSlideHasBulletByOffset(1)) {
            activateBullet(activeSlideIndex, activeBulletIndex + 1);
            return false;
          } else if (bullets[nextSlideIndex]) {
            activateBullet(nextSlideIndex, 0);
          }
        },
  
        prev = function() {
          var prevSlideIndex = activeSlideIndex - 1;
  
          if (activeSlideHasBulletByOffset(-1)) {
            activateBullet(activeSlideIndex, activeBulletIndex - 1);
            return false;
          } else if (bullets[prevSlideIndex]) {
            activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
          }
        },
  
        activateBullet = function(slideIndex, bulletIndex) {
          activeSlideIndex = slideIndex;
          activeBulletIndex = bulletIndex;
  
          bullets.forEach(function(slide, s) {
            slide.forEach(function(bullet, b) {
              bullet.classList.add('bespoke-bullet');
  
              if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
                bullet.classList.add('bespoke-bullet-active');
                bullet.classList.remove('bespoke-bullet-inactive');
              } else {
                bullet.classList.add('bespoke-bullet-inactive');
                bullet.classList.remove('bespoke-bullet-active');
              }
  
              if (s === slideIndex && b === bulletIndex) {
                bullet.classList.add('bespoke-bullet-current');
              } else {
                bullet.classList.remove('bespoke-bullet-current');
              }
            });
          });
        },
  
        activeSlideHasBulletByOffset = function(offset) {
          return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
        };
  
      deck.on('next', next);
      deck.on('prev', prev);
  
      deck.on('slide', function(e) {
        activateBullet(e.index, 0);
      });
  
      activateBullet(0, 0);
    };
  };
  
  },{}],2:[function(require,module,exports){
  module.exports = function() {
    return function(deck) {
      var addClass = function(el, cls) {
          el.classList.add('bespoke-' + cls);
        },
  
        removeClass = function(el, cls) {
          el.className = el.className
            .replace(new RegExp('bespoke-' + cls +'(\\s|$)', 'g'), ' ')
            .trim();
        },
  
        deactivate = function(el, index) {
          var activeSlide = deck.slides[deck.slide()],
            offset = index - deck.slide(),
            offsetClass = offset > 0 ? 'after' : 'before';
  
          ['before(-\\d+)?', 'after(-\\d+)?', 'active', 'inactive'].map(removeClass.bind(null, el));
  
          if (el !== activeSlide) {
            ['inactive', offsetClass, offsetClass + '-' + Math.abs(offset)].map(addClass.bind(null, el));
          }
        };
  
      addClass(deck.parent, 'parent');
      deck.slides.map(function(el) { addClass(el, 'slide'); });
  
      deck.on('activate', function(e) {
        deck.slides.map(deactivate);
        addClass(e.slide, 'active');
        removeClass(e.slide, 'inactive');
      });
    };
  };
  
  },{}],3:[function(require,module,exports){
  module.exports = function(opts) {
    return function(deck) {
      opts = opts && (opts.object || opts.name || opts.scope) ? opts : { object: opts };
      var bespoke = opts.object, name = opts.name || 'bespoke', scope = opts.scope || window;
      if (bespoke) scope[name] = bespoke;
      else if (scope[name]) bespoke = scope[name];
      else bespoke = (scope[name] = {});
      (Array.isArray(bespoke.decks) ? bespoke.decks : (bespoke.decks = [])).push(bespoke.deck = deck);
      deck.on('destroy', function() {
        var idx = bespoke.decks.indexOf(deck);
        if (idx >= 0) bespoke.decks.splice(idx, 1);
        delete bespoke.deck;
      });
    };
  };
  
  },{}],4:[function(require,module,exports){
  module.exports = function() {
    return function(deck) {
      var activateSlide = function(index) {
        var indexToActivate = -1 < index && index < deck.slides.length ? index : 0;
        if (indexToActivate !== deck.slide()) {
          deck.slide(indexToActivate);
        }
      };
  
      var parseHash = function() {
        var hash = window.location.hash.slice(1),
          slideNumberOrName = parseInt(hash, 10);
  
        if (hash) {
          if (slideNumberOrName) {
            activateSlide(slideNumberOrName - 1);
          } else {
            deck.slides.forEach(function(slide, i) {
              if (slide.getAttribute('data-bespoke-hash') === hash || slide.id === hash) {
                activateSlide(i);
              }
            });
          }
        }
      };
  
      setTimeout(function() {
        parseHash();
  
        deck.on('activate', function(e) {
          var slideName = e.slide.getAttribute('data-bespoke-hash') || e.slide.id;
          window.location.hash = slideName || e.index + 1;
        });
  
        window.addEventListener('hashchange', parseHash);
      }, 0);
    };
  };
  
  },{}],5:[function(require,module,exports){
  module.exports = function() {
    return function(deck) {
      var VIMEO_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_RE = /\/\/www\.youtube\.com\/embed\//, CMD = 'command', loc = location.protocol === 'file:',
        apply = function(sel, from, fn, mod) { for (var i = -1, r = from.querySelectorAll(sel+(mod||'')), l = r.length; ++i < l; fn(r[i])) {} },
        post = function(obj, msg) { obj.contentWindow.postMessage(JSON.stringify(msg), '*'); },
        play = function(obj) {
          var rew = obj.hasAttribute('data-rewind'), vol = Math.min(Math.max(parseFloat(obj.getAttribute('data-volume')), 0), 10);
          if (obj.play) {
            if (rew && obj.readyState) obj.currentTime = 0;
            if (vol >= 0) obj.volume = vol/10;
            obj.play();
          }
          else if (YOUTUBE_RE.test(obj.src)) {
            if (rew) post(obj, {event:CMD, func:'seekTo', args:[0]});
            if (vol >= 0) post(obj, {event:CMD, func:'setVolume', args:[vol*10]});
            post(obj, {event:CMD, func:'playVideo'});
          }
          else if (VIMEO_RE.test(obj.src)) {
            if (loc) return console.warn('WARNING: Cannot play Vimeo video when deck is loaded via file://.');
            if (rew) post(obj, {method:'seekTo', value:0});
            if (vol >= 0) post(obj, {method:'setVolume', value:vol/10});
            post(obj, {method:'play'});
          }
        },
        pause = function(obj) {
          if (obj.pause) obj.pause();
          else if (YOUTUBE_RE.test(obj.src)) post(obj, {event:CMD, func:'pauseVideo'});
          else if (!loc && VIMEO_RE.test(obj.src)) post(obj, {method:'pause'});
        },
        reload = function(obj, name) { obj[name||'src'] = obj.getAttribute(name||'src'); },
        svg = function(obj) { try { return obj.contentDocument.rootElement; } catch(e) {} },
        toggle = function(obj, cmd) { (svg(obj)||obj).classList[cmd||'add']('active'); },
        activateSvg = function(obj) {
          if (obj.hasAttribute('data-reload')) reload(obj, 'data');
          else if (svg(obj)) toggle(obj);
          else obj.onload = function() { if (deck.slides[deck.slide()].contains(obj)) toggle(obj); };
        },
        deactivateSvg = function(obj) { toggle(obj, 'remove'); },
        eachMedia = apply.bind(null, 'audio,video,iframe'),
        eachSvg = apply.bind(null, 'object[type="image/svg+xml"]'),
        playMedia = function(slide) { eachMedia(slide, play); },
        pauseMedia = function(slide) { eachMedia(slide, pause); },
        activateSvgs = function(slide) { eachSvg(slide, activateSvg); },
        deactivateSvgs = function(slide) { eachSvg(slide, deactivateSvg, ':not([data-reload])'); },
        activate = function(e) {
          if (e.preview) return pauseMedia(e.slide);
          playMedia(e.slide);
          activateSvgs(e.slide);
          apply('img[data-reload][src$=".gif"]', e.slide, reload);
        },
        deactivate = function(e) {
          pauseMedia(e.slide);
          deactivateSvgs(e.slide);
        };
      deck.on('activate', activate);
      deck.on('deactivate', deactivate);
    };
  };
  
  },{}],6:[function(require,module,exports){
  module.exports = function() {
    return function(deck) {
      var KEY_SP = 32, KEY_PGUP = 33, KEY_PGDN = 34, KEY_END = 35, KEY_HME = 36,
          KEY_LT = 37, KEY_RT = 39, KEY_H = 72, KEY_L = 76, KD = 'keydown',
        modified = function(e, k) {
          return e.ctrlKey || (e.shiftKey && (k === KEY_HME || k === KEY_END)) || e.altKey || e.metaKey;
        },
        onKey = function(e) {
          if (!modified(e, e.which)) {
            switch(e.which) {
              case KEY_SP: return (e.shiftKey ? deck.prev : deck.next)();
              case KEY_RT: case KEY_PGDN: case KEY_L: return deck.next();
              case KEY_LT: case KEY_PGUP: case KEY_H: return deck.prev();
              case KEY_HME: return deck.slide(0);
              case KEY_END: return deck.slide(deck.slides.length - 1);
            }
          }
        };
      deck.on('destroy', function() { document.removeEventListener(KD, onKey); });
      document.addEventListener(KD, onKey);
    };
  };
  
  },{}],7:[function(require,module,exports){
  module.exports = function(options) {
    return function(deck) {
      var opts = (options || {}), TS = 'touchstart', TM = 'touchmove', ADD = 'addEventListener', RM = 'removeEventListener',
        src = deck.parent, start = null, delta = null, axis = 'page' + (opts.axis === 'y' ? 'Y' : 'X'),
        gap = typeof opts.threshold === 'number' ? opts.threshold : 50 / window.devicePixelRatio,
        onStart = function(e) { start = e.touches.length === 1 ? e.touches[0][axis] : null; },
        onMove = function(e) {
          if (start === null) return; // not ours
          if (start === undefined) return e.preventDefault(); // action already taken
          if (Math.abs(delta = e.touches[0][axis] - start) > gap) {
            (delta > 0 ? deck.prev : deck.next)();
            start = e.preventDefault(); // mark action taken
          }
        };
      deck.on('destroy', function() { src[RM](TS, onStart); src[RM](TM, onMove); });
      src[ADD](TS, onStart); src[ADD](TM, onMove);
    };
  };
  
  },{}],8:[function(require,module,exports){
  module.exports = function(opts) {
    opts = opts || {};
    var kbd = require('bespoke-nav-kbd')(opts.kbd);
    var touch = require('bespoke-nav-touch')(opts.touch);
    return function(deck) {
      kbd(deck);
      touch(deck);
    };
  };
  
  },{"bespoke-nav-kbd":6,"bespoke-nav-touch":7}],9:[function(require,module,exports){
  (function (global){
  /*! bespoke-prism v1.0.1 © 2016 Hubert SABLONNIÈRE, MIT License */
  !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n=n.bespoke||(n.bespoke={}),n=n.plugins||(n.plugins={}),n.prism=e()}}(function(){return function e(n,t,a){function r(o,s){if(!t[o]){if(!n[o]){var l="function"==typeof require&&require;if(!s&&l)return l(o,!0);if(i)return i(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var u=t[o]={exports:{}};n[o][0].call(u.exports,function(e){var t=n[o][1][e];return r(t?t:e)},u,u.exports,e,n,t,a)}return t[o].exports}for(var i="function"==typeof require&&require,o=0;o<a.length;o++)r(a[o]);return r}({1:[function(e,n,t){var a=e("insert-css"),r=e("prism-themes/themes/prism-ghcolors.css");n.exports=function(){var n=e("prismjs");return e("prismjs/plugins/unescaped-markup/prism-unescaped-markup"),e("prismjs/plugins/normalize-whitespace/prism-normalize-whitespace"),a(r,{prepend:!0}),function(){n.highlightAll()}}},{"insert-css":2,"prism-themes/themes/prism-ghcolors.css":3,prismjs:6,"prismjs/plugins/normalize-whitespace/prism-normalize-whitespace":4,"prismjs/plugins/unescaped-markup/prism-unescaped-markup":5}],2:[function(e,n,t){var a={};n.exports=function(e,n){if(!a[e]){a[e]=!0;var t=document.createElement("style");t.setAttribute("type","text/css"),"textContent"in t?t.textContent=e:t.styleSheet.cssText=e;var r=document.getElementsByTagName("head")[0];n&&n.prepend?r.insertBefore(t,r.childNodes[0]):r.appendChild(t)}}},{}],3:[function(e,n,t){n.exports='/**\n * GHColors theme by Avi Aryan (http://aviaryan.in)\n * Inspired by Github syntax coloring\n */\n\ncode[class*="language-"],\npre[class*="language-"] {\n    color: #393A34;\n    font-family: "Consolas", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;\n    direction: ltr;\n    text-align: left;\n    white-space: pre;\n    word-spacing: normal;\n    word-break: normal;\n    font-size: 0.95em;\n    line-height: 1.2em;\n\n    -moz-tab-size: 4;\n    -o-tab-size: 4;\n    tab-size: 4;\n\n    -webkit-hyphens: none;\n    -moz-hyphens: none;\n    -ms-hyphens: none;\n    hyphens: none;\n}\n\npre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,\ncode[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {\n    background: #b3d4fc;\n}\n\npre[class*="language-"]::selection, pre[class*="language-"] ::selection,\ncode[class*="language-"]::selection, code[class*="language-"] ::selection {\n    background: #b3d4fc;\n}\n\n/* Code blocks */\npre[class*="language-"] {\n    padding: 1em;\n    margin: .5em 0;\n    overflow: auto;\n    border: 1px solid #dddddd;\n    background-color: white;\n}\n\n:not(pre) > code[class*="language-"],\npre[class*="language-"] {\n}\n\n/* Inline code */\n:not(pre) > code[class*="language-"] {\n    padding: .2em;\n    padding-top: 1px; padding-bottom: 1px;\n    background: #f8f8f8;\n    border: 1px solid #dddddd;\n}\n\n.token.comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n    color: #999988; font-style: italic;\n}\n\n.token.namespace {\n    opacity: .7;\n}\n\n.token.string,\n.token.attr-value {\n    color: #e3116c;\n}\n.token.punctuation,\n.token.operator {\n    color: #393A34; /* no highlight */\n}\n\n.token.entity,\n.token.url,\n.token.symbol,\n.token.number,\n.token.boolean,\n.token.variable,\n.token.constant,\n.token.property,\n.token.regex,\n.token.inserted {\n    color: #36acaa;\n}\n\n.token.atrule,\n.token.keyword,\n.token.attr-name,\n.language-autohotkey .token.selector {\n    color: #00a4db;\n}\n\n.token.function,\n.token.deleted,\n.language-autohotkey .token.tag {\n    color: #9a050f;\n}\n\n.token.tag,\n.token.selector,\n.language-autohotkey .token.keyword {\n    color: #00009f;\n}\n\n.token.important,\n.token.function,\n.token.bold {\n    font-weight: bold;\n}\n\n.token.italic {\n    font-style: italic;\n}'},{}],4:[function(e,n,t){!function(){function e(e){this.defaults=a({},e)}function n(e){return e.replace(/-(\w)/g,function(e,n){return n.toUpperCase()})}function t(e){for(var n=0,t=0;t<e.length;++t)e.charCodeAt(t)=="\t".charCodeAt(0)&&(n+=3);return e.length+n}if("undefined"!=typeof self&&self.Prism&&self.document){var a=Object.assign||function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);return e};e.prototype={setDefaults:function(e){this.defaults=a(this.defaults,e)},normalize:function(e,t){t=a(this.defaults,t);for(var r in t){var i=n(r);"normalize"!==r&&"setDefaults"!==i&&t[r]&&this[i]&&(e=this[i].call(this,e,t[r]))}return e},leftTrim:function(e){return e.replace(/^\s+/,"")},rightTrim:function(e){return e.replace(/\s+$/,"")},tabsToSpaces:function(e,n){return n=0|n||4,e.replace(/\t/g,new Array((++n)).join(" "))},spacesToTabs:function(e,n){return n=0|n||4,e.replace(new RegExp(" {"+n+"}","g"),"\t")},removeTrailing:function(e){return e.replace(/\s*?$/gm,"")},removeInitialLineFeed:function(e){return e.replace(/^(?:\r?\n|\r)/,"")},removeIndent:function(e){var n=e.match(/^[^\S\n\r]*(?=\S)/gm);return n&&n[0].length?(n.sort(function(e,n){return e.length-n.length}),n[0].length?e.replace(new RegExp("^"+n[0],"gm"),""):e):e},indent:function(e,n){return e.replace(/^[^\S\n\r]*(?=\S)/gm,new Array((++n)).join("\t")+"$&")},breakLines:function(e,n){n=n===!0?80:0|n||80;for(var a=e.split("\n"),r=0;r<a.length;++r)if(!(t(a[r])<=n)){for(var i=a[r].split(/(\s+)/g),o=0,s=0;s<i.length;++s){var l=t(i[s]);o+=l,o>n&&(i[s]="\n"+i[s],o=l)}a[r]=i.join("")}return a.join("\n")}},Prism.plugins.NormalizeWhitespace=new e({"remove-trailing":!0,"remove-indent":!0,"left-trim":!0,"right-trim":!0}),Prism.hooks.add("before-highlight",function(e){var n=e.element.parentNode,t=/\bno-whitespace-normalization\b/;if(!(!e.code||!n||"pre"!==n.nodeName.toLowerCase()||e.settings&&e.settings["whitespace-normalization"]===!1||t.test(n.className)||t.test(e.element.className))){for(var a=n.childNodes,r="",i="",o=!1,s=Prism.plugins.NormalizeWhitespace,l=0;l<a.length;++l){var c=a[l];c==e.element?o=!0:"#text"===c.nodeName&&(o?i+=c.nodeValue:r+=c.nodeValue,n.removeChild(c),--l)}if(e.element.children.length&&Prism.plugins.KeepMarkup){var u=r+e.element.innerHTML+i;e.element.innerHTML=s.normalize(u,e.settings),e.code=e.element.textContent}else e.code=r+e.code+i,e.code=s.normalize(e.code,e.settings)}})}}()},{}],5:[function(e,n,t){!function(){"undefined"!=typeof self&&self.Prism&&self.document&&Prism.languages.markup&&(Prism.plugins.UnescapedMarkup=!0,Prism.hooks.add("before-highlightall",function(e){e.selector+=", .lang-markup script[type='text/plain'], .language-markup script[type='text/plain'], script[type='text/plain'].lang-markup, script[type='text/plain'].language-markup"}),Prism.hooks.add("before-sanity-check",function(e){if("markup"==e.language){if(e.element.matches("script[type='text/plain']")){var n=document.createElement("code"),t=document.createElement("pre");return t.className=n.className=e.element.className,e.code=e.code.replace(/&lt;\/script(>|&gt;)/gi,"</script>"),n.textContent=e.code,t.appendChild(n),e.element.parentNode.replaceChild(t,e.element),void(e.element=n)}var t=e.element.parentNode;!e.code&&t&&"pre"==t.nodeName.toLowerCase()&&e.element.childNodes.length&&"#comment"==e.element.childNodes[0].nodeName&&(e.element.textContent=e.code=e.element.childNodes[0].textContent)}}))}()},{}],6:[function(e,n,t){(function(e){var t="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},a=function(){var e=/\blang(?:uage)?-(\w+)\b/i,n=0,a=t.Prism={util:{encode:function(e){return e instanceof r?new r(e.type,a.util.encode(e.content),e.alias):"Array"===a.util.type(e)?e.map(a.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function(e){var n=a.util.type(e);switch(n){case"Object":var t={};for(var r in e)e.hasOwnProperty(r)&&(t[r]=a.util.clone(e[r]));return t;case"Array":return e.map&&e.map(function(e){return a.util.clone(e)})}return e}},languages:{extend:function(e,n){var t=a.util.clone(a.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(e,n,t,r){r=r||a.languages;var i=r[e];if(2==arguments.length){t=arguments[1];for(var o in t)t.hasOwnProperty(o)&&(i[o]=t[o]);return i}var s={};for(var l in i)if(i.hasOwnProperty(l)){if(l==n)for(var o in t)t.hasOwnProperty(o)&&(s[o]=t[o]);s[l]=i[l]}return a.languages.DFS(a.languages,function(n,t){t===r[e]&&n!=e&&(this[n]=s)}),r[e]=s},DFS:function(e,n,t,r){r=r||{};for(var i in e)e.hasOwnProperty(i)&&(n.call(e,i,e[i],t||i),"Object"!==a.util.type(e[i])||r[a.util.objId(e[i])]?"Array"!==a.util.type(e[i])||r[a.util.objId(e[i])]||(r[a.util.objId(e[i])]=!0,a.languages.DFS(e[i],n,i,r)):(r[a.util.objId(e[i])]=!0,a.languages.DFS(e[i],n,null,r)))}},plugins:{},highlightAll:function(e,n){var t={callback:n,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};a.hooks.run("before-highlightall",t);for(var r,i=t.elements||document.querySelectorAll(t.selector),o=0;r=i[o++];)a.highlightElement(r,e===!0,t.callback)},highlightElement:function(n,r,i){for(var o,s,l=n;l&&!e.test(l.className);)l=l.parentNode;l&&(o=(l.className.match(e)||[,""])[1].toLowerCase(),s=a.languages[o]),n.className=n.className.replace(e,"").replace(/\s+/g," ")+" language-"+o,l=n.parentNode,/pre/i.test(l.nodeName)&&(l.className=l.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var c=n.textContent,u={element:n,language:o,grammar:s,code:c};if(a.hooks.run("before-sanity-check",u),!u.code||!u.grammar)return void a.hooks.run("complete",u);if(a.hooks.run("before-highlight",u),r&&t.Worker){var g=new Worker(a.filename);g.onmessage=function(e){u.highlightedCode=e.data,a.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(u.element),a.hooks.run("after-highlight",u),a.hooks.run("complete",u)},g.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=a.highlight(u.code,u.grammar,u.language),a.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(n),a.hooks.run("after-highlight",u),a.hooks.run("complete",u)},highlight:function(e,n,t){var i=a.tokenize(e,n);return r.stringify(a.util.encode(i),t)},tokenize:function(e,n,t){var r=a.Token,i=[e],o=n.rest;if(o){for(var s in o)n[s]=o[s];delete n.rest}e:for(var s in n)if(n.hasOwnProperty(s)&&n[s]){var l=n[s];l="Array"===a.util.type(l)?l:[l];for(var c=0;c<l.length;++c){var u=l[c],g=u.inside,p=!!u.lookbehind,d=!!u.greedy,f=0,m=u.alias;u=u.pattern||u;for(var h=0;h<i.length;h++){var y=i[h];if(i.length>e.length)break e;if(!(y instanceof r)){u.lastIndex=0;var k=u.exec(y),v=1;if(!k&&d&&h!=i.length-1){var b=i[h+1].matchedStr||i[h+1],w=y+b;if(h<i.length-2&&(w+=i[h+2].matchedStr||i[h+2]),u.lastIndex=0,k=u.exec(w),!k)continue;var x=k.index+(p?k[1].length:0);if(x>=y.length)continue;var N=k.index+k[0].length,C=y.length+b.length;if(v=3,N<=C){if(i[h+1].greedy)continue;v=2,w=w.slice(0,C)}y=w}if(k){p&&(f=k[1].length);var x=k.index+f,k=k[0].slice(f),N=x+k.length,A=y.slice(0,x),j=y.slice(N),z=[h,v];A&&z.push(A);var P=new r(s,g?a.tokenize(k,g):k,m,k,d);z.push(P),j&&z.push(j),Array.prototype.splice.apply(i,z)}}}}}return i},hooks:{all:{},add:function(e,n){var t=a.hooks.all;t[e]=t[e]||[],t[e].push(n)},run:function(e,n){var t=a.hooks.all[e];if(t&&t.length)for(var r,i=0;r=t[i++];)r(n)}}},r=a.Token=function(e,n,t,a,r){this.type=e,this.content=n,this.alias=t,this.matchedStr=a||null,this.greedy=!!r};if(r.stringify=function(e,n,t){if("string"==typeof e)return e;if("Array"===a.util.type(e))return e.map(function(t){return r.stringify(t,n,e)}).join("");var i={type:e.type,content:r.stringify(e.content,n,t),tag:"span",classes:["token",e.type],attributes:{},language:n,parent:t};if("comment"==i.type&&(i.attributes.spellcheck="true"),e.alias){var o="Array"===a.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(i.classes,o)}a.hooks.run("wrap",i);var s="";for(var l in i.attributes)s+=(s?" ":"")+l+'="'+(i.attributes[l]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+s+">"+i.content+"</"+i.tag+">"},!t.document)return t.addEventListener?(t.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code,o=n.immediateClose;t.postMessage(a.highlight(i,a.languages[r],r)),o&&t.close()},!1),t.Prism):t.Prism;var i=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return i&&(a.filename=i.src,document.addEventListener&&!i.hasAttribute("data-manual")&&("loading"!==document.readyState?requestAnimationFrame(a.highlightAll,0):document.addEventListener("DOMContentLoaded",a.highlightAll))),t.Prism}();"undefined"!=typeof n&&n.exports&&(n.exports=a),"undefined"!=typeof e&&(e.Prism=a),a.languages.markup={comment:/<!--[\w\W]*?-->/,prolog:/<\?[\w\W]+?\?>/,doctype:/<!DOCTYPE[\w\W]+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,inside:{tag:{pattern:/^<\/?[^\s>\/]+/i,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,inside:{punctuation:/[=>"']/}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:/&#?[\da-z]{1,8};/i},a.hooks.add("wrap",function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))}),a.languages.xml=a.languages.markup,a.languages.html=a.languages.markup,a.languages.mathml=a.languages.markup,a.languages.svg=a.languages.markup,a.languages.css={comment:/\/\*[\w\W]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^\{\}\s][^\{\};]*?(?=\s*\{)/,string:/("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,property:/(\b|\B)[\w-]+(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},a.languages.css.atrule.inside.rest=a.util.clone(a.languages.css),a.languages.markup&&(a.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,lookbehind:!0,inside:a.languages.css,alias:"language-css"}}),a.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').*?\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:a.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:a.languages.css}},alias:"language-css"}},a.languages.markup.tag)),a.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:{pattern:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/},a.languages.javascript=a.languages.extend("clike",{keyword:/\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i}),a.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0,greedy:!0}}),a.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\\\|\\?[^\\])*?`/,greedy:!0,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:a.languages.javascript}},string:/[\s\S]+/}}}),a.languages.markup&&a.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:a.languages.javascript,alias:"language-javascript"}}),a.languages.js=a.languages.javascript,function(){"undefined"!=typeof self&&self.Prism&&self.document&&document.querySelector&&(self.Prism.fileHighlight=function(){var e={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"};Array.prototype.forEach&&Array.prototype.slice.call(document.querySelectorAll("pre[data-src]")).forEach(function(n){for(var t,r=n.getAttribute("data-src"),i=n,o=/\blang(?:uage)?-(?!\*)(\w+)\b/i;i&&!o.test(i.className);)i=i.parentNode;if(i&&(t=(n.className.match(o)||[,""])[1]),!t){var s=(r.match(/\.(\w+)$/)||[,""])[1];t=e[s]||s}var l=document.createElement("code");l.className="language-"+t,n.textContent="",l.textContent="Loading…",n.appendChild(l);var c=new XMLHttpRequest;c.open("GET",r,!0),c.onreadystatechange=function(){4==c.readyState&&(c.status<400&&c.responseText?(l.textContent=c.responseText,a.highlightElement(l)):c.status>=400?l.textContent="✖ Error "+c.status+" while fetching file: "+c.statusText:l.textContent="✖ Error: File does not exist or is empty")},c.send(null)})},document.addEventListener("DOMContentLoaded",self.Prism.fileHighlight))}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});
  }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  },{}],10:[function(require,module,exports){
  module.exports = function(options) {
    return function(deck) {
      var parent = deck.parent,
        firstSlide = deck.slides[0],
        slideHeight = firstSlide.offsetHeight,
        slideWidth = firstSlide.offsetWidth,
        useZoom = options === 'zoom' || ('zoom' in parent.style && options !== 'transform'),
  
        wrap = function(element) {
          var wrapper = document.createElement('div');
          wrapper.className = 'bespoke-scale-parent';
          element.parentNode.insertBefore(wrapper, element);
          wrapper.appendChild(element);
          return wrapper;
        },
  
        elements = useZoom ? deck.slides : deck.slides.map(wrap),
  
        transformProperty = (function(property) {
          var prefixes = 'Moz Webkit O ms'.split(' ');
          return prefixes.reduce(function(currentProperty, prefix) {
              return prefix + property in parent.style ? prefix + property : currentProperty;
            }, property.toLowerCase());
        }('Transform')),
  
        scale = useZoom ?
          function(ratio, element) {
            element.style.zoom = ratio;
          } :
          function(ratio, element) {
            element.style[transformProperty] = 'scale(' + ratio + ')';
          },
  
        scaleAll = function() {
          var xScale = parent.offsetWidth / slideWidth,
            yScale = parent.offsetHeight / slideHeight;
  
          elements.forEach(scale.bind(null, Math.min(xScale, yScale)));
        };
  
      window.addEventListener('resize', scaleAll);
      scaleAll();
    };
  
  };
  
  },{}],11:[function(require,module,exports){
  var from = function(opts, plugins) {
    var parent = (opts.parent || opts).nodeType === 1 ? (opts.parent || opts) : document.querySelector(opts.parent || opts),
      slides = [].filter.call(typeof opts.slides === 'string' ? parent.querySelectorAll(opts.slides) : (opts.slides || parent.children), function(el) { return el.nodeName !== 'SCRIPT'; }),
      activeSlide = slides[0],
      listeners = {},
  
      activate = function(index, customData) {
        if (!slides[index]) {
          return;
        }
  
        fire('deactivate', createEventData(activeSlide, customData));
        activeSlide = slides[index];
        fire('activate', createEventData(activeSlide, customData));
      },
  
      slide = function(index, customData) {
        if (arguments.length) {
          fire('slide', createEventData(slides[index], customData)) && activate(index, customData);
        } else {
          return slides.indexOf(activeSlide);
        }
      },
  
      step = function(offset, customData) {
        var slideIndex = slides.indexOf(activeSlide) + offset;
  
        fire(offset > 0 ? 'next' : 'prev', createEventData(activeSlide, customData)) && activate(slideIndex, customData);
      },
  
      on = function(eventName, callback) {
        (listeners[eventName] || (listeners[eventName] = [])).push(callback);
        return off.bind(null, eventName, callback);
      },
  
      off = function(eventName, callback) {
        listeners[eventName] = (listeners[eventName] || []).filter(function(listener) { return listener !== callback; });
      },
  
      fire = function(eventName, eventData) {
        return (listeners[eventName] || [])
          .reduce(function(notCancelled, callback) {
            return notCancelled && callback(eventData) !== false;
          }, true);
      },
  
      createEventData = function(el, eventData) {
        eventData = eventData || {};
        eventData.index = slides.indexOf(el);
        eventData.slide = el;
        return eventData;
      },
  
      deck = {
        on: on,
        off: off,
        fire: fire,
        slide: slide,
        next: step.bind(null, 1),
        prev: step.bind(null, -1),
        parent: parent,
        slides: slides
      };
  
    (plugins || []).forEach(function(plugin) {
      plugin(deck);
    });
  
    activate(0);
  
    return deck;
  };
  
  module.exports = {
    from: from
  };
  
  },{}],12:[function(require,module,exports){
  // Require Node modules in the browser thanks to Browserify: http://browserify.org
  var bespoke = require('bespoke');
  var classes = require('bespoke-classes');
  var nav = require('bespoke-nav');
  var scale = require('bespoke-scale');
  var bullets = require('bespoke-bullets');
  var hash = require('bespoke-hash');
  var prism = require('bespoke-prism');
  var multimedia = require('bespoke-multimedia');
  var extern = require('bespoke-extern');
  
  // Bespoke.js
  bespoke.from({ parent: 'article#presentation', slides: 'section' }, [
    classes(),
    nav(),
    scale(),
    bullets('.build, .build-items > *:not(.build-items)'),
    hash(),
    prism(),
    multimedia(),
    extern(bespoke)
  ]);
  
  },{"bespoke":11,"bespoke-bullets":1,"bespoke-classes":2,"bespoke-extern":3,"bespoke-hash":4,"bespoke-multimedia":5,"bespoke-nav":8,"bespoke-prism":9,"bespoke-scale":10}]},{},[12]);
  
































  /*!
 * bespoke-keys v1.0.0
 *
 * Copyright 2015, Mark Dalgleish
 * This content is released under the MIT license
 * http://mit-license.org/markdalgleish
 */

// !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self);var o=n;o=o.bespoke||(o.bespoke={}),o=o.plugins||(o.plugins={}),o.keys=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
//   module.exports = function(options) {
//     return function(deck) {
//       var isHorizontal = options !== 'vertical';
  
//       document.addEventListener('keydown', function(e) {
//         if (e.which == 34 || // PAGE DOWN
//           (e.which == 32 && !e.shiftKey) || // SPACE WITHOUT SHIFT
//           (isHorizontal && e.which == 39) || // RIGHT
//           (!isHorizontal && e.which == 40) // DOWN
//         ) { deck.next(); }
  
//         if (e.which == 33 || // PAGE UP
//           (e.which == 32 && e.shiftKey) || // SPACE + SHIFT
//           (isHorizontal && e.which == 37) || // LEFT
//           (!isHorizontal && e.which == 38) // UP
//         ) { deck.prev(); }
//       });
//     };
//   };
  
//   },{}]},{},[1])
//   (1)
//   });
//   /*!
//    * bespoke-theme-nebula v1.0.1
//    *
//    * Copyright 2014, Mark Dalgleish
//    * This content is released under the MIT license
//    * 
//    */
  
//   !function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var f=o;f=f.bespoke||(f.bespoke={}),f=f.themes||(f.themes={}),f.nebula=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
  
//   var classes = _dereq_('bespoke-classes');
//   var insertCss = _dereq_('insert-css');
  
//   module.exports = function() {
//     var css = "/*! normalize.css v3.0.0 | MIT License | git.io/normalize */html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background:0 0}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b{font-weight:700}dfn{font-style:italic}h1{font-size:2em}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{box-sizing:content-box}pre{overflow:auto}code,kbd,pre,samp{font-size:1em}kbd,pre,samp{font-family:monospace,monospace}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=\"button\"],input[type=\"reset\"],input[type=\"submit\"]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=\"checkbox\"],input[type=\"radio\"]{box-sizing:border-box;padding:0}input[type=\"number\"]::-webkit-inner-spin-button,input[type=\"number\"]::-webkit-outer-spin-button{height:auto}input[type=\"search\"]{-webkit-appearance:textfield;box-sizing:content-box}input[type=\"search\"]::-webkit-search-cancel-button,input[type=\"search\"]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th,*{padding:0}*{margin:0}html{-webkit-text-size-adjust:auto;-ms-text-size-adjust:auto;text-size-adjust:auto}.bespoke-parent{font-size:1.5em;background:#111;color:#ddd;font-family:futura,helvetica,arial,arial,sans-serif;overflow:hidden;text-align:center;-webkit-transition:background 1s ease;transition:background 1s ease;background-position:50% 50%}.bespoke-parent,.bespoke-scale-parent{position:absolute;top:0;left:0;right:0;bottom:0}.bespoke-scale-parent{pointer-events:none;z-index:1}.bespoke-scale-parent .bespoke-active{pointer-events:auto}.bespoke-slide{-webkit-transition:opacity .5s ease;transition:opacity .5s ease;width:940px;height:480px;position:absolute;top:50%;left:50%;margin-left:-470px;margin-top:-240px;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;z-index:1}.bespoke-active{-webkit-transition-delay:.5s;transition-delay:.5s}.bespoke-active[data-bespoke-backdrop]{-webkit-transition-delay:.75s;transition-delay:.75s}.bespoke-inactive{opacity:0;pointer-events:none}.bespoke-backdrop{-webkit-transition:opacity 1s ease;position:absolute;top:0;left:0;right:0;bottom:0}.bespoke-progress-parent{position:absolute;top:0;left:0;right:0;height:.3vw;z-index:1}.bespoke-progress-bar{background:#ddd;position:absolute;top:0;left:0;height:100%;-webkit-transition:width 1s ease;transition:width 1s ease}.bespoke-bullet{-webkit-transition:opacity .3s ease;transition:opacity .3s ease}.bespoke-bullet-inactive{opacity:0}strong{font-weight:400}hr{width:50%;margin:1rem auto;height:1px;border:0;background:#ddd}h3,p,li{padding-left:20px;padding-right:20px}h3,h4,p,li,pre{font-weight:200}h1{line-height:1.4em;padding:1em;border:1px solid #ddd;border-left-width:0;border-right-width:0;min-width:8em}h1,h2{letter-spacing:.3em;text-transform:uppercase;font-weight:400;margin:.17em 0;position:relative}h2{line-height:1.1em;padding:0 0 0 .3em}h3{font-family:didot,times new roman,serif;font-style:italic;font-size:1.2em;line-height:1.6em;margin:.5em 0}h4{text-transform:uppercase;font-size:.8em;line-height:1.8em;letter-spacing:.3em;margin:1em 0}ul,ol{padding:0;margin:0;text-align:left}li{list-style:none;margin:.2em;font-style:normal;-webkit-transform:translateX(-6px);-ms-transform:translateX(-6px);transform:translateX(-6px)}li:before{content:'\\2014';margin-right:4px}pre{background:none!important}code{font-family:prestige elite std,consolas,courier new,monospace!important;font-style:normal;font-weight:200!important;text-align:left}a{padding-left:.3em;color:currentColor;text-decoration:none;border-bottom:1px solid currentColor}.emphatic{background:#f30}.single-words{word-spacing:9999px;line-height:2.9em;overflow:hidden}.bespoke-backdrop{opacity:0;-webkit-transition:opacity 1s ease,-webkit-transform 6s ease;transition:opacity 1s ease,transform 6s ease;background-size:cover;background-position:50% 50%;-webkit-transform:translateZ(0)scale(1.3);transform:translateZ(0)scale(1.3)}.bespoke-backdrop-active,.bespoke-backdrop-before{-webkit-transform:translateZ(0);transform:translateZ(0)}.bespoke-backdrop-before{-webkit-transition-delay:.2s;transition-delay:.2s}.bespoke-backdrop-active{opacity:.5}";
//     insertCss(css, { prepend: true });
  
//     return function(deck) {
//       classes()(deck);
//     };
//   };
  
//   },{"bespoke-classes":2,"insert-css":3}],2:[function(_dereq_,module,exports){
//   module.exports = function() {
//     return function(deck) {
//       var addClass = function(el, cls) {
//           el.classList.add('bespoke-' + cls);
//         },
  
//         removeClass = function(el, cls) {
//           el.className = el.className
//             .replace(new RegExp('bespoke-' + cls +'(\\s|$)', 'g'), ' ')
//             .trim();
//         },
  
//         deactivate = function(el, index) {
//           var activeSlide = deck.slides[deck.slide()],
//             offset = index - deck.slide(),
//             offsetClass = offset > 0 ? 'after' : 'before';
  
//           ['before(-\\d+)?', 'after(-\\d+)?', 'active', 'inactive'].map(removeClass.bind(null, el));
  
//           if (el !== activeSlide) {
//             ['inactive', offsetClass, offsetClass + '-' + Math.abs(offset)].map(addClass.bind(null, el));
//           }
//         };
  
//       addClass(deck.parent, 'parent');
//       deck.slides.map(function(el) { addClass(el, 'slide'); });
  
//       deck.on('activate', function(e) {
//         deck.slides.map(deactivate);
//         addClass(e.slide, 'active');
//         removeClass(e.slide, 'inactive');
//       });
//     };
//   };
  
//   },{}],3:[function(_dereq_,module,exports){
//   var inserted = {};
  
//   module.exports = function (css, options) {
//       if (inserted[css]) return;
//       inserted[css] = true;
      
//       var elem = document.createElement('style');
//       elem.setAttribute('type', 'text/css');
  
//       if ('textContent' in elem) {
//         elem.textContent = css;
//       } else {
//         elem.styleSheet.cssText = css;
//       }
      
//       var head = document.getElementsByTagName('head')[0];
//       if (options && options.prepend) {
//           head.insertBefore(elem, head.childNodes[0]);
//       } else {
//           head.appendChild(elem);
//       }
//   };
  
//   },{}]},{},[1])
//   (1)
//   });
  
//   var myPlugin = function() {
//     return function() {
//       deck.on('activate', function(e) {
//         console.log('Activated slide ' + (e.index + 1) + ' of ' + deck.slides.length);
//       });
//     }
//   };
  
  //bullet plugin
  
  /*!
   * bespoke-bullets v1.1.0
   *
   * Copyright 2014, Mark Dalgleish
   * This content is released under the MIT license
   * http://mit-license.org/markdalgleish
   */
  
  // !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self);var o=n;o=o.bespoke||(o.bespoke={}),o=o.plugins||(o.plugins={}),o.bullets=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
  // module.exports = function(options) {
  //   return function(deck) {
  //     var activeSlideIndex,
  //       activeBulletIndex,
  
  //       bullets = deck.slides.map(function(slide) {
  //         return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
  //       }),
  
  //       next = function() {
  //         var nextSlideIndex = activeSlideIndex + 1;
  
  //         if (activeSlideHasBulletByOffset(1)) {
  //           activateBullet(activeSlideIndex, activeBulletIndex + 1);
  //           return false;
  //         } else if (bullets[nextSlideIndex]) {
  //           activateBullet(nextSlideIndex, 0);
  //         }
  //       },
  
  //       prev = function() {
  //         var prevSlideIndex = activeSlideIndex - 1;
  
  //         if (activeSlideHasBulletByOffset(-1)) {
  //           activateBullet(activeSlideIndex, activeBulletIndex - 1);
  //           return false;
  //         } else if (bullets[prevSlideIndex]) {
  //           activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
  //         }
  //       },
  
  //       activateBullet = function(slideIndex, bulletIndex) {
  //         activeSlideIndex = slideIndex;
  //         activeBulletIndex = bulletIndex;
  
  //         bullets.forEach(function(slide, s) {
  //           slide.forEach(function(bullet, b) {
  //             bullet.classList.add('bespoke-bullet');
  
  //             if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
  //               bullet.classList.add('bespoke-bullet-active');
  //               bullet.classList.remove('bespoke-bullet-inactive');
  //             } else {
  //               bullet.classList.add('bespoke-bullet-inactive');
  //               bullet.classList.remove('bespoke-bullet-active');
  //             }
  
  //             if (s === slideIndex && b === bulletIndex) {
  //               bullet.classList.add('bespoke-bullet-current');
  //             } else {
  //               bullet.classList.remove('bespoke-bullet-current');
  //             }
  //           });
  //         });
  //       },
  
  //       activeSlideHasBulletByOffset = function(offset) {
  //         return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
  //       };
  
  //     deck.on('next', next);
  //     deck.on('prev', prev);
  
  //     deck.on('slide', function(e) {
  //       activateBullet(e.index, 0);
  //     });
  
  //     activateBullet(0, 0);
  //   };
  // };
  
  // },{}]},{},[1])
  // (1)
  // });
  
  //cube theme
  /*!
   * bespoke-theme-cube v2.0.1
   *
   * Copyright 2014, Mark Dalgleish
   * This content is released under the MIT license
   * http://mit-license.org/markdalgleish
   */
  
  !function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var f=o;f=f.bespoke||(f.bespoke={}),f=f.themes||(f.themes={}),f.cube=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
  
  var classes = _dereq_('bespoke-classes');
  var insertCss = _dereq_('insert-css');
  
  module.exports = function() {
    var css = "*{-moz-box-sizing:border-box;box-sizing:border-box;margin:0;padding:0}@media print{*{-webkit-print-color-adjust:exact}}@page{size:landscape;margin:0}.bespoke-parent{-webkit-transition:background .6s ease;transition:background .6s ease;position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden}@media print{.bespoke-parent{overflow:visible;position:static}}.bespoke-theme-cube-slide-parent{position:absolute;top:0;left:0;right:0;bottom:0;-webkit-perspective:600px;perspective:600px;pointer-events:none}.bespoke-slide{pointer-events:auto;-webkit-transition:-webkit-transform .6s ease,opacity .6s ease,background .6s ease;transition:transform .6s ease,opacity .6s ease,background .6s ease;-webkit-transform-origin:50% 50% 0;transform-origin:50% 50% 0;-webkit-backface-visibility:hidden;backface-visibility:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;text-align:center;width:640px;height:480px;position:absolute;top:50%;margin-top:-240px;left:50%;margin-left:-320px;background:#eaeaea;padding:40px;border-radius:0}@media print{.bespoke-slide{zoom:1!important;height:743px;width:100%;page-break-before:always;position:static;margin:0;-webkit-transition:none;transition:none}}.bespoke-before{-webkit-transform:translateX(100px)translateX(-320px)rotateY(-90deg)translateX(-320px);transform:translateX(100px)translateX(-320px)rotateY(-90deg)translateX(-320px)}@media print{.bespoke-before{-webkit-transform:none;transform:none}}.bespoke-after{-webkit-transform:translateX(-100px)translateX(320px)rotateY(90deg)translateX(320px);transform:translateX(-100px)translateX(320px)rotateY(90deg)translateX(320px)}@media print{.bespoke-after{-webkit-transform:none;transform:none}}.bespoke-inactive{opacity:0;pointer-events:none}@media print{.bespoke-inactive{opacity:1}}.bespoke-active{opacity:1}.bespoke-bullet{-webkit-transition:all .3s ease;transition:all .3s ease}@media print{.bespoke-bullet{-webkit-transition:none;transition:none}}.bespoke-bullet-inactive{opacity:0}li.bespoke-bullet-inactive{-webkit-transform:translateX(16px);transform:translateX(16px)}@media print{li.bespoke-bullet-inactive{-webkit-transform:none;transform:none}}@media print{.bespoke-bullet-inactive{opacity:1}}.bespoke-bullet-active{opacity:1}.bespoke-scale-parent{-webkit-perspective:600px;perspective:600px;position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none}.bespoke-scale-parent .bespoke-active{pointer-events:auto}@media print{.bespoke-scale-parent{-webkit-transform:none!important;transform:none!important}}.bespoke-progress-parent{position:absolute;top:0;left:0;right:0;height:2px}@media only screen and (min-width:1366px){.bespoke-progress-parent{height:4px}}@media print{.bespoke-progress-parent{display:none}}.bespoke-progress-bar{-webkit-transition:width .6s ease;transition:width .6s ease;position:absolute;height:100%;background:#0089f3;border-radius:0 4px 4px 0}.emphatic{background:#eaeaea}.bespoke-backdrop{position:absolute;top:0;left:0;right:0;bottom:0;-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-transition:opacity .6s ease;transition:opacity .6s ease;opacity:0;z-index:-1}.bespoke-backdrop-active{opacity:1}pre{padding:26px!important;border-radius:8px}body{font-family:helvetica,arial,sans-serif;font-size:18px;color:#404040}h1{font-size:72px;line-height:82px;letter-spacing:-2px;margin-bottom:16px}h2{font-size:42px;letter-spacing:-1px;margin-bottom:8px}h3{font-size:24px;font-weight:400;margin-bottom:24px;color:#606060}hr{visibility:hidden;height:20px}ul{list-style:none}li{margin-bottom:12px}p{margin:0 100px 12px;line-height:22px}a{color:#0089f3;text-decoration:none}";
    insertCss(css, { prepend: true });
  
    return function(deck) {
      classes()(deck);
  
      var wrap = function(element) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bespoke-theme-cube-slide-parent';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
      };
  
      deck.slides.forEach(wrap);
    };
  };
  
  },{"bespoke-classes":2,"insert-css":3}],2:[function(_dereq_,module,exports){
  module.exports = function() {
    return function(deck) {
      var addClass = function(el, cls) {
          el.classList.add('bespoke-' + cls);
        },
  
        removeClass = function(el, cls) {
          el.className = el.className
            .replace(new RegExp('bespoke-' + cls +'(\\s|$)', 'g'), ' ')
            .trim();
        },
  
        deactivate = function(el, index) {
          var activeSlide = deck.slides[deck.slide()],
            offset = index - deck.slide(),
            offsetClass = offset > 0 ? 'after' : 'before';
  
          ['before(-\\d+)?', 'after(-\\d+)?', 'active', 'inactive'].map(removeClass.bind(null, el));
  
          if (el !== activeSlide) {
            ['inactive', offsetClass, offsetClass + '-' + Math.abs(offset)].map(addClass.bind(null, el));
          }
        };
  
      addClass(deck.parent, 'parent');
      deck.slides.map(function(el) { addClass(el, 'slide'); });
  
      deck.on('activate', function(e) {
        deck.slides.map(deactivate);
        addClass(e.slide, 'active');
        removeClass(e.slide, 'inactive');
      });
    };
  };
  
  },{}],3:[function(_dereq_,module,exports){
  var inserted = {};
  
  module.exports = function (css, options) {
      if (inserted[css]) return;
      inserted[css] = true;
      
      var elem = document.createElement('style');
      elem.setAttribute('type', 'text/css');
  
      if ('textContent' in elem) {
        elem.textContent = css;
      } else {
        elem.styleSheet.cssText = css;
      }
      
      var head = document.getElementsByTagName('head')[0];
      if (options && options.prepend) {
          head.insertBefore(elem, head.childNodes[0]);
      } else {
          head.appendChild(elem);
      }
  };
  
  },{}]},{},[1])
  (1)
  });
  
  bespoke.from("#presentation",[
    bespoke.themes.cube(),
    bespoke.plugins.keys()
   // myPlugin()
  ]);
 