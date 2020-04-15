$('.participant').click(function(){
  $('#text').val($('#text').val()+'@'+$(this).data("username")+': ');
  $('#text').focus();
});
$('#addSurvey').click(function(){
  $('.surveyForm').slideToggle("slow");
});

var wykop = {};
/*!
 * Wykop Markdown Editor
 */
(function($) {
    var methods = {
        init: function(options) {
            var textarea = this;
            var settings = {
                syntax: [{
                    buttonClass: 'edith1',
                    buttonTitle: 'nagłówek',
                    mark: '# ',
                    insert: 'before',
                    placeholder: 'Nagłówek...'
                }, {
                    buttonClass: 'editb',
                    buttonTitle: 'tekst pogrubiony',
                    mark: '**',
                    insert: 'both',
                    placeholder: 'tekst pogrubiony',
                    inline: true
                }, {
                    buttonClass: 'editi',
                    buttonTitle: 'tekst pochylony',
                    mark: '_',
                    insert: 'both',
                    placeholder: 'tekst pochylony',
                    inline: true
                }, {
                    buttonClass: 'editcode',
                    buttonTitle: 'kod',
                    mark: '`',
                    insert: 'both',
                    placeholder: 'kod',
                    inline: false
                }, {
                    buttonClass: 'editunder',
                    buttonTitle: 'tekst podkreślony',
                    mark: '\n* * *\n',
                    insert: 'replace'
                }, {
                    buttonClass: 'editlink',
                    buttonTitle: 'link',
                    mark: '',
                    insert: 'link'
                }, {
                    buttonClass: 'editul',
                    buttonTitle: 'element listy',
                    mark: '* ',
                    insert: 'before',
                    placeholder: 'element listy'
                }, {
                    buttonClass: 'editquote',
                    buttonTitle: 'cytat',
                    mark: '> ',
                    insert: 'before',
                    placeholder: 'Cytowany tekst...'
                }, {
                    buttonClass: 'editspoiler',
                    buttonTitle: 'spoiler',
                    mark: '! ',
                    insert: 'before',
                    placeholder: 'Ukryty tekst...'
                }, {
                    buttonClass: 'editlenny',
                    buttonTitle: 'lennyface',
                    mark: '( ͡° ͜ʖ ͡°)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny2',
                    buttonTitle: 'lennyface',
                    mark: '( ͡° ʖ̯ ͡°)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny3',
                    buttonTitle: 'lennyface',
                    mark: '( ͡º ͜ʖ͡º)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny4',
                    buttonTitle: 'lennyface',
                    mark: '( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny5',
                    buttonTitle: 'lennyface',
                    mark: '(⌐ ͡■ ͜ʖ ͡■)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny6',
                    buttonTitle: 'lennyface',
                    mark: '(╥﹏╥)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny7',
                    buttonTitle: 'lennyface',
                    mark: '(╯︵╰,)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny8',
                    buttonTitle: 'lennyface',
                    mark: '(ʘ‿ʘ)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny9',
                    buttonTitle: 'lennyface',
                    mark: '(｡◕‿‿◕｡)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny10',
                    buttonTitle: 'lennyface',
                    mark: 'ᕙ(⇀‸↼‶)ᕗ',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny11',
                    buttonTitle: 'lennyface',
                    mark: 'ᕦ(òóˇ)ᕤ',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny12',
                    buttonTitle: 'lennyface',
                    mark: '(✌ ﾟ ∀ ﾟ)☞',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny13',
                    buttonTitle: 'lennyface',
                    mark: 'ʕ•ᴥ•ʔ',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny14',
                    buttonTitle: 'lennyface',
                    mark: 'ᶘᵒᴥᵒᶅ',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny15',
                    buttonTitle: 'lennyface',
                    mark: '(⌒(oo)⌒)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny16',
                    buttonTitle: 'lennyface',
                    mark: 'ᄽὁȍ ̪ őὀᄿ',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny17',
                    buttonTitle: 'lennyface',
                    mark: '( ͡€ ͜ʖ ͡€)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny18',
                    buttonTitle: 'lennyface',
                    mark: '( ͡° ͜ʖ ͡°)',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny19',
                    buttonTitle: 'lennyface',
                    mark: '( ͡° ͜ʖ ͡°)ﾉ⌐■-■',
                    insert: 'replace',
                    placeholder: ''
                }, {
                    buttonClass: 'editlenny20',
                    buttonTitle: 'lennyface',
                    mark: '(⌐ ͡■ ͜ʖ ͡■)',
                    insert: 'replace',
                    placeholder: ''
                },
                {
                    buttonClass: 'editlenny21',
                    buttonTitle: 'lennyface',
                    mark: '(・へ・)',
                    insert: 'replace',
                    placeholder: ''
                }, ],
                toolbarScope: 'fieldset.buttons'
            };
            if (options) {
                $.extend(settings, options);
            }
            var $form = textarea.closest('form');
            var $toolbar = $form.find(settings.toolbarScope);
            for (i in settings.syntax) {
                var el = settings.syntax[i];
                $toolbar.find('.' + el.buttonClass).closest('a').data('markdown', el).attr('title', el.buttonTitle).unbind('click').click(function() {
                    textarea.markdownEditor('insert', $(this).data().markdown);
                    return false;
                });
            }
            textarea.keydown(function(e) {
                if (e.ctrlKey) {
                    switch (e.which) {
                        case 66:
                            $toolbar.find('.editb').trigger('click');
                            break;
                        case 73:
                            $toolbar.find('.editi').trigger('click');
                            break;
                    }
                }
            });
            return this;
        },
        insert: function(el) {
            range = this.getSelection();
            var text = this.val();
            select = {
                start: range.end,
                end: range.end
            };
            if (range.text.length == 0 && el.placeholder) {
                range.text = el.placeholder;
                select.end += el.placeholder.length;
            }
            switch (el.insert) {
                case 'before':
                    var newline = '';
                    if (text.substr(0, range.start).match(/\S$/)) {
                        newline = "\n";
                    }
                    text = text.substr(0, range.start) + newline + el.mark + jQuery.trim(range.text).replace(/\n(\S)/g, "\n" + el.mark + "$1") + text.substr(range.end);
                    select.start += el.mark.length;
                    select.end += el.mark.length;
                    break;
                case 'after':
                    text = text.substr(0, range.start) + range.text + el.mark + text.substr(range.end);
                    select.start -= el.mark.length;
                    select.end -= el.mark.length;
                    break;
                case 'both':
                    if (el.inline) {
                        text = text.substr(0, range.start) + el.mark + jQuery.trim(range.text).replace(/(\S)(\n+)(\S)/g, "$1" + el.mark + "$2" + el.mark + "$3") + el.mark + text.substr(range.end);
                    } else {
                        text = text.substr(0, range.start) + el.mark + range.text + el.mark + text.substr(range.end);
                    }
                    select.start += el.mark.length;
                    select.end += el.mark.length;
                    break;
                case 'replace':
                    text = text.substr(0, range.start) + el.mark + text.substr(range.end);
                    select.start = range.end + el.mark.length;
                    select.end = select.start;
                    break;
                case 'link':
                    if (range.length > 0) {
                        if (range.text.indexOf('http') == 0) {
                            el.mark = '[opis odnośnika](' + range.text + ')';
                        } else {
                            el.mark = '[' + range.text + '](http://www.wykop.pl)';
                        }
                    } else {
                        el.mark = '[opis odnośnika](http://www.wykop.pl)';
                        select.start += 1;
                        select.end += 15;
                    }
                    text = text.substr(0, range.start) + el.mark + text.substr(range.end);
                    break;
                case 'list':
                    break;
            }
            this.val(text);
            this.setSelection(select.start, select.end)
        },
    };
    $.fn.markdownEditor = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.markdownEditor');
        }
    };
})(jQuery);
(function() {
    var fieldSelection = {
        getSelection: function() {
            var e = this.jquery ? this[0] : this;
            return (('selectionStart' in e && function() {
                var l = e.selectionEnd - e.selectionStart;
                return {
                    start: e.selectionStart,
                    end: e.selectionEnd,
                    length: l,
                    text: e.value.substr(e.selectionStart, l)
                };
            }) || (document.selection && function() {
                e.focus();
                var r = document.selection.createRange();
                if (r == null) {
                    return {
                        start: 0,
                        end: e.value.length,
                        length: 0
                    }
                }
                var re = e.createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                return {
                    start: rc.text.length,
                    end: rc.text.length + r.text.length,
                    length: r.text.length,
                    text: r.text
                };
            }) || function() {
                return {
                    start: 0,
                    end: e.value.length,
                    length: 0
                };
            })();
        },
        replaceSelection: function() {
            var e = this.jquery ? this[0] : this;
            var text = arguments[0] || '';
            return (('selectionStart' in e && function() {
                e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
                return this;
            }) || (document.selection && function() {
                e.focus();
                document.selection.createRange().text = text;
                return this;
            }) || function() {
                e.value += text;
                return this;
            })();
        },
        setSelection: function(start, end) {
            var e = this.jquery ? this[0] : this;
            if (e.setSelectionRange) {
                e.focus();
                e.setSelectionRange(start, end);
            } else if (e.createTextRange) {
                var range = e.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            } else if (e.selectionStart) {
                e.selectionStart = start;
                e.selectionEnd = end;
            }
            return this;
        },
    };
    jQuery.each(fieldSelection, function(i) {
        jQuery.fn[i] = this;
    });
})();
(function($) {
    $.suggest = function(input, options) {
        var $input = $('.confession').attr("autocomplete", "off");
        var $results = $(document.createElement("ul"));
        var timeout = false;
        var prevLength = 0;
        var cache = [];
        var cacheSize = 0;
        var ids = {};
        var cursorPos = 0;
        $results.addClass(options.resultsClass).insertAfter('#markdown');
        resetPosition();
        $(window).on('load', resetPosition).resize(resetPosition);
        $input.blur(function() {
            setTimeout(function() {
                $results.hide();
            }, 200);
        });
        try {
            $results.bgiframe();
        } catch (e) {}
        $input.keydown(emptyProcessKey);
        $input.keyup(processKey);
        function resetPosition() {
            var offset = $input.offset();
            $results.css({
                top: (offset.top + input.offsetHeight) + 'px',
                left: offset.left + 'px'
            });
        }
        function emptyProcessKey(e) {
            if (/^13$/.test(e.keyCode) && $results.is(':visible') && !getCurrentResult()) {
                $results.hide();
            } else if ((/27$|38$|40$/.test(e.keyCode) && $results.is(':visible')) || (/^13$|^9$/.test(e.keyCode) && getCurrentResult())) {
                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation)
                    e.stopPropagation();
            }
        }
        function processKey(e) {
            if (/^13$/.test(e.keyCode) && $results.is(':visible') && !getCurrentResult()) {
                $results.hide();
            } else if ((/27$|38$|40$/.test(e.keyCode) && $results.is(':visible')) || (/^13$|^9$/.test(e.keyCode) && getCurrentResult())) {
                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation)
                    e.stopPropagation();
                e.cancelBubble = true;
                e.returnValue = false;
                switch (e.keyCode) {
                case 38:
                    prevResult();
                    break;
                case 40:
                    nextResult();
                    break;
                case 9:
                case 13:
                    selectCurrentResult();
                    break;
                case 27:
                    $results.hide();
                    break;
                }
            } else if ($input.val().length != prevLength) {
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(suggest, options.delay);
                prevLength = $input.val().length;
            }
        }
        function suggest() {
            cursorPos = $input.getSelectionStart();
            var q = options.ignoreSpaces ? [$input.val()] : $input.val().substr(0, cursorPos).split(/\s+/g);
            q = $.trim(q[q.length - 1]);
            if (q.length >= options.minchars && (!options.natural || q.substr(0, 1) == "#" || q.substr(0, 1) == "@")) {
                cached = checkCache(q);
                if (cached) {
                    displayItems(cached['items']);
                } else {
                    $.get("https://query.yahooapis.com/v1/public/yql", {q: "select * from json where url=\""+options.source + '?search_text=' + escape(q)+"\"", format: "json"}, function(txt) {
                        $results.hide();
                        var items = parseJSON(txt.query.results.json, q);
                        displayItems(items);
                        addToCache(q, items, txt.query.results.json.length);
                    }, 'json');
                }
            } else {
                $results.hide();
            }
        }
        function checkCache(q) {
            for (var i = 0; i < cache.length; i++)
                if (cache[i]['q'] == q) {
                    cache.unshift(cache.splice(i, 1)[0]);
                    return cache[0];
                }
            return false;
        }
        function addToCache(q, items, size) {
            while (cache.length && (cacheSize + size > options.maxCacheSize)) {
                var cached = cache.pop();
                cacheSize -= cached['size'];
            }
            cache.push({
                q: q,
                size: size,
                items: items
            });
            cacheSize += size;
        }
        function displayItems(items) {
            if (!items.html)
                return;
            if (items.size == 0) {
                $results.hide();
                if (options.emptyCallback) {
                    options.emptyCallback($input.val());
                }
                return;
            }
            var html = items.html;
            $results.html(html).show(0, resetPosition);
            $results.children('li').mouseover(function() {
                $results.children('li').removeClass(options.selectClass);
                $(this).addClass(options.selectClass);
            }).click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                selectCurrentResult();
            });
            if (options.autoSelectIfOne && items.length == 1 && items[0].match(/>$/i)) {
                nextResult();
                selectCurrentResult();
            }
        }
        function parseJSON(json, q) {
            return json;
        }
        function getCurrentResult() {
            if (!$results.is(':visible'))
                return false;
            var $currentResult = $results.children('li.' + options.selectClass);
            if (!$currentResult.length)
                $currentResult = false;
            return $currentResult;
        }
        function selectCurrentResult() {
            $currentResult = getCurrentResult();
            if ($currentResult) {
                if (options.followLink) {
                    location.href = $currentResult.find("a").attr("href");
                } else if (options.resultCallback) {
                    options.resultCallback($currentResult.text(), ids[$currentResult.text()], $input);
                } else if (options.addAfterExisting || options.natural) {
                    var textBefore = $input.val().substr(0, cursorPos);
                    var textAfter = $input.val().substr(cursorPos);
                    var q = textBefore.split(/\s+/g);
                    q = $.trim(q[q.length - 1]);
                    $input.val(textBefore.substring(0, textBefore.length - q.length) + $currentResult.data().content + (textAfter.length > 0 && textAfter.substr(0, 1) != " " ? " " : "") + textAfter);
                    $input.change();
                    $input.setCursorPosition($input.val().length - textAfter.length);
                } else {
                    $input.val($currentResult.data().content);
                    $input.change();
                }
                $results.hide();
                if (options.onSelect)
                    options.onSelect.apply($input[0]);
            }
        }
        function nextResult() {
            $currentResult = getCurrentResult();
            if ($currentResult) {
                $currentResult.removeClass(options.selectClass).next().addClass(options.selectClass);
            } else {
                $results.children('li:first-child').addClass(options.selectClass);
            }
        }
        function prevResult() {
            $currentResult = getCurrentResult();
            if ($currentResult) {
                $currentResult.removeClass(options.selectClass).prev().addClass(options.selectClass);
            } else {
                $results.children('li:last-child').addClass(options.selectClass);
            }
        }
    }
    ;
    $.fn.suggest = function(source, options) {
        if (!source)
            return;
        options = options || {};
        options.source = source;
        options.delay = options.delay || 100;
        options.resultsClass = options.resultsClass || 'ac_results';
        options.selectClass = options.selectClass || 'ac_over';
        options.matchClass = options.matchClass || 'ac_match';
        options.minchars = options.minchars || 3;
        options.delimiter = options.delimiter || '\n';
        options.onSelect = options.onSelect || false;
        options.maxCacheSize = options.maxCacheSize || 65536;
        options.addAfterExisting = options.addAfterExisting || false;
        options.natural = options.natural || false;
        options.observing = options.observing || false;
        options.resultCallback = options.resultCallback || false;
        options.ignoreSpaces = options.ignoreSpaces || false;
        options.autoSelectIfOne = options.autoSelectIfOne || false;
        options.emptyCallback = options.emptyCallback || false;
        options.followLink = options.followLink || false;
        this.each(function() {
            new $.suggest(this,options);
        });
        return this;
    }
    ;
})(jQuery);
//
jQuery.fn.getSelectionStart = function() {
    input = this[0];
    if (typeof input === "undefined") {
        return 0;
    }
    var pos = input.selectionStart;
    return pos;
};
(function($) {
    $.fn.setCursorPosition = function(pos) {
        if (pos == -1) {
            pos = $(this).val().length;
        }
        if ($(this).get(0).setSelectionRange) {
            $(this).get(0).setSelectionRange(pos, pos);
        } else if ($(this).get(0).createTextRange) {
            var range = $(this).get(0).createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
})(jQuery);

wykop.bindSuggest = function(selector) {
    $(selector).each(function() {
        if (typeof $(this).data().suggest != "undefined") {
            switch ($(this).data().suggest) {
            case 'tag':
                $(this).suggest("http://www.wykop.pl/ajax/suggest/tag", {
                    natural: false
                });
                break;
            case 'user':
                $(this).suggest("http://www.wykop.pl/ajax/suggest/user", {
                    natural: false
                });
                break;
            }
        }
    });
};
wykop.bindNaturalSuggest = function(selector) {
    $(selector).suggest("http://www.wykop.pl/ajax/suggest/", {
        natural: true
    });
};
wykop.bindEditor = function(selector) {
    $(selector).markdownEditor({
        toolbarScope: 'fieldset.buttons'
    });
};

wykop.bindEditor('#confession' + ' textarea');
wykop.bindNaturalSuggest('#confession' + ' textarea');
wykop.bindSuggest("input.suggest");