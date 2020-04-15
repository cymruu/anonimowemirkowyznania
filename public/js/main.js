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
wykop.bindEditor = function(selector) {
    $(selector).markdownEditor({
        toolbarScope: 'fieldset.buttons'
    });
};

wykop.bindEditor('#confession' + ' textarea');