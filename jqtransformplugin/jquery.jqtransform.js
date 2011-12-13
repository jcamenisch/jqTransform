/*!
 * jqTransform (http://www.dfc-e.com/metiers/multimedia/opensource/jqtransform/)
 * by Mathieu Vilaplana mvilaplana@dfc-e.com
 * Designer Ghyslain Armand garmand@dfc-e.com
 * License: GPL
 ******************************************** */
 /*
 * Version 1.0 25.09.08
 * Version 1.1 06.08.09
 * Add event click on Checkbox and Radio
 * Auto calculate the size of a select element
 * Can now, disabled the elements
 * Correct bug in ff if click on select (overflow=hidden)
 * No need any more preloading !!
 ******************************************** */
(function ($) {

    /***************************
     Labels
     ***************************/
    var jqTransformGetLabel = function (objfield) {
        var selfForm = $(objfield.get(0).form),
            oLabel = objfield.next(), $labelId;

        if (!oLabel.is('label')) {
            oLabel = objfield.prev();
            if (oLabel.is('label')) {
                $labelId = objfield.attr('id');
                if ($labelId) {
                    oLabel = selfForm.find('label[for="' + $labelId + '"]');
                }
            }
        }

        if (oLabel.is('label')) {
            return oLabel.css('cursor', 'pointer');
        }
        return false;
    },

    /* Hide all open selects */
    jqTransformHideSelect = function (oTarget) {
        var ulVisible = $('.jqTransformSelectWrapper ul:visible');
        ulVisible.each(function () {
            var oSelect = $(this).parents(".jqTransformSelectWrapper:first").find("select").get(0);

            //do not hide if click on the label object associated to the select
            if (!(oTarget && oSelect.oLabel && oSelect.oLabel.get(0) == oTarget.get(0))) {
                $(this).trigger('collapse');
            }
        });
    },

    /* Check for an external click */
    jqTransformCheckExternalClick = function (event) {
        if ($(event.target).parents('.jqTransformSelectWrapper').length === 0) {
            jqTransformHideSelect($(event.target));
        }
    },

    /* Apply document listener */
    jqTransformAddDocumentListener = function () {
        $(document).mousedown(jqTransformCheckExternalClick);
    },

    /* Add a new handler for the reset action */
    jqTransformReset = function (f) {
        var sel;
        $('.jqTransformSelectWrapper select', f).each(function () {
            sel = (this.selectedIndex < 0) ? 0 : this.selectedIndex;
            $('ul', $(this).parent()).each(function () {
                $('a:eq(' + sel + ')', this).click();
            });
        });
        $('a.jqTransformCheckbox, a.jqTransformRadio', f).removeClass('jqTransformChecked');
        $('input:checkbox, input:radio', f).each(function () {
            if (this.checked) {
                $('a', $(this).parent()).addClass('jqTransformChecked');
            }
        });
    };

    /***************************
     Buttons
     ***************************/
    $.fn.jqTransInputButton = function () {
        return this.each(function () {
            var $button = $(this),
		$newBtn = $('<button id="' + this.id + '" name="' + this.name + '" type="' + this.type + '" class="' + this.className + ' jqTransformButton"><span><span>' + $button.attr('value') + '</span></span>').hover(function () {
                $newBtn.addClass('jqTransformButton_hover');
            }, function () {
                $newBtn.removeClass('jqTransformButton_hover')
            }).mousedown(function () {
                $newBtn.addClass('jqTransformButton_click')
            }).mouseup(function () {
                $newBtn.removeClass('jqTransformButton_click')
            });
            $button.replaceWith($newBtn);
        });
    };

    /***************************
     Text Fields
     ***************************/
    $.fn.jqTransInputText = function () {
        return this.each(function () {
            var $text = $(this),
                $inputSize = $text.width(),
		$oLabel;
            $wrapper = $text.parent().parent().parent();

            if ($text.hasClass('jqtranformdone') || !$text.is('input')) {
                return;
            }
            $text.addClass('jqtranformdone');

            $oLabel = jqTransformGetLabel($text);
            $oLabel && $oLabel.bind('click', function () {
                $text.focus();
            });

            if ($text.attr('size')) {
                $inputSize = $text.attr('size') * 10;
                $text.css('width', $inputSize);
            }

            $text.addClass("jqTransformInput").wrap('<div class="jqTransformInputWrapper"><div class="jqTransformInputInner"><div></div></div></div>');
            $wrapper.css("width", $inputSize + 10);
            $text.focus(function () {
                $wrapper.addClass("jqTransformInputWrapper_focus");
            }).blur(function () {
                $wrapper.removeClass("jqTransformInputWrapper_focus");
            }).hover(function () {
                $wrapper.addClass("jqTransformInputWrapper_hover");
            }, function () {
                $wrapper.removeClass("jqTransformInputWrapper_hover");
            });

            /* If this is safari we need to add an extra class */
            $.browser.safari && $wrapper.addClass('jqTransformSafari');
            $.browser.safari && $text.css('width', $wrapper.width() + 16);
            this.wrapper = $wrapper;

        });
    };

    /***************************
     Check Boxes
     ***************************/
    $.fn.jqTransCheckBox = function () {
        return this.each(function () {
            var $checkBox = $(this),
                aLink = $('<a href="#" class="jqTransformCheckbox"></a>'),
		$oLabel;

            if ($checkBox.hasClass('jqTransformHidden')) {
                return;
            }

            // set the click on the label
            $oLabel = jqTransformGetLabel($checkBox);
            $oLabel && $oLabel.click(function () {
                aLink.trigger('click');
            });

            //wrap and add the link
            $checkBox.addClass('jqTransformHidden').wrap('<span class="jqTransformCheckboxWrapper"></span>').parent().prepend(aLink);

	    //on change, change the class of the link
            $checkBox.change(function () {
                this.checked && aLink.addClass('jqTransformChecked') || aLink.removeClass('jqTransformChecked');
                return true;
            });

            // Click Handler, trigger the click and change event on the input
            aLink.click(function () {

		//do nothing if the original input is disabled
                if ($checkBox.attr('disabled')) {
                    return false;
                }

		//trigger the envents on the input object
                $checkBox.trigger('click').trigger("change");
                return false;
            });

            // set the default state
            this.checked && aLink.addClass('jqTransformChecked');
        });
    };

    /***************************
     Radio Buttons
     ***************************/
    $.fn.jqTransRadio = function () {
        return this.each(function () {
            var $radio = $(this),
                $self = this,
                aLink = $('<a href="#" class="jqTransformRadio" rel="' + this.name + '"></a>');

            if ($radio.hasClass('jqTransformHidden')) {
                return;
            }

            oLabel = jqTransformGetLabel($radio);
            oLabel && oLabel.click(function () {
                aLink.trigger('click');
            });

            $radio.addClass('jqTransformHidden').wrap('<span class="jqTransformRadioWrapper"></span>').parent().prepend(aLink);

            $radio.change(function () {
                $self.checked && aLink.addClass('jqTransformChecked') || aLink.removeClass('jqTransformChecked');
                return true;
            });

            // Click Handler
            aLink.click(function (event) {
                event.preventDefault();
                if ($radio.attr('disabled')) {
                    return false;
                }
                $radio.trigger('click').trigger('change');

                // uncheck all others of same name input radio elements
                $('input[name="' + $radio.attr('name') + '"]', $self.form).not($radio).each(function () {
                    $(this).attr('type') == 'radio' && $(this).trigger('change');
                });
            });

            // set the default state
            $self.checked && aLink.addClass('jqTransformChecked');
        });
    };

    /***************************
     TextArea
     ***************************/
    $.fn.jqTransTextarea = function () {
        return this.each(function () {
            var $textarea = $(this),
                $strTable = '<table cellspacing="0" cellpadding="0" border="0" class="jqTransformTextarea">',
                oTable;

            if ($textarea.hasClass('jqtransformdone')) {
                return;
            }
            $textarea.addClass('jqtransformdone');

            oLabel = jqTransformGetLabel($textarea);
            oLabel && oLabel.click(function () {
                $textarea.focus();
            });

            $strTable += '<tr><td id="jqTransformTextarea-tl"></td><td id="jqTransformTextarea-tm"></td><td id="jqTransformTextarea-tr"></td></tr>';
            $strTable += '<tr><td id="jqTransformTextarea-ml">&nbsp;</td><td id="jqTransformTextarea-mm"><div></div></td><td id="jqTransformTextarea-mr">&nbsp;</td></tr>';
            $strTable += '<tr><td id="jqTransformTextarea-bl"></td><td id="jqTransformTextarea-bm"></td><td id="jqTransformTextarea-br"></td></tr>';
            $strTable += '</table>';

            oTable = $($strTable).insertAfter($textarea).hover(function () {
                !oTable.hasClass('jqTransformTextarea-focus') && oTable.addClass('jqTransformTextarea-hover');
            }, function () {
                oTable.removeClass('jqTransformTextarea-hover');
            });

            $textarea.focus(function () {
                oTable.removeClass('jqTransformTextarea-hover').addClass('jqTransformTextarea-focus');
            }).blur(function () {
                oTable.removeClass('jqTransformTextarea-focus');
            }).appendTo($('#jqTransformTextarea-mm div', oTable));

            this.oTable = oTable;
            if ($.browser.safari) {
                $('#jqTransformTextarea-mm', oTable).addClass('jqTransformSafariTextarea').find('div').css('height', $textarea.height()).css('width', $textarea.width());
            }
        });
    };

    /***************************
     Select
     ***************************/
    $.fn.jqTransSelect = function () {
        if (this.length) {
            this.each(function (index) {
                var $select = $(this),
                    oLabel = jqTransformGetLabel($select),
                    $wrapper, $ul, $oLinkOpen, $selectOuterWidth, $oSpan, $newWidth, $hidden_containers, $iSelectHeight;

                if ($select.hasClass('jqTransformHidden') || $select.attr('multiple')) {
                    return;
                }

                /* First thing we do is Wrap it */
                $wrapper = $select.addClass('jqTransformHidden').wrap('<div class="jqTransformSelectWrapper"></div>').parent().css({
                    zIndex: 99 - index
                });

                /* Now add the html for the select */
                $wrapper.prepend('<div><span></span><a href="#" class="jqTransformSelectOpen"></a></div><ul></ul>');
                $ul = $('ul', $wrapper).css('width', $select.width()).hide();

                /* Now we add the options */
                $('option', this).each(function (i) {
                    var oLi = $('<li><a href="#" index="' + i + '">' + $(this).html() + '</a></li>');
                    $ul.append(oLi);
                });

                /* Call instead of $ul.hide() to return state to normal */
                $ul.bind('collapse', function () {
                    $(this).hide();
                    var $clone = $wrapper.data('clone');
                    if ($clone) {
                        $wrapper.attr('style', $clone.attr('style'));
                        $clone.hide();
                        $wrapper.insertAfter($clone);
                    }
                });

                /* Add click handler to the a */
                $ul.find('a').click(function (event) {
                    event.preventDefault();
                    var $this = $(this),
                        prevIndex;
                    $('a.selected', $wrapper).removeClass('selected');
                    $this.addClass('selected');
                    prevIndex = $select[0].selectedIndex;
                    $select[0].selectedIndex = $(this).attr('index');

                    /* Fire the onchange event */
                    if (prevIndex != $select[0].selectedIndex) {
                        $select.change();
                    }
                    $('span:eq(0)', $wrapper).html($this.html());
                    $ul.trigger('collapse');
                });

                /* Set the default */
                $('a:eq(' + this.selectedIndex + ')', $ul).click();
                $oLinkOpen = $("a.jqTransformSelectOpen", $wrapper);
                $('span:first', $wrapper).click(function () {
                    $oLinkOpen.trigger('click');
                });

                oLabel && oLabel.click(function () {
                    $oLinkOpen.trigger('click');
                });
                this.oLabel = oLabel;

                /* Apply the click handler to the Open */
                $oLinkOpen.click(function (event) {
                    event.preventDefault();
                    var alreadyOpen = $ul.is(':visible'),
                        $clone;

                    jqTransformHideSelect(); // Toggle closed or close other selects.
                    if (!alreadyOpen) {
                        if ($select.attr('disabled')) {
                            return;
                        }

                        // Calculate width every time to adjust for any DOM changes
                        $ul.css({
                            width: ($wrapper.width() - $oLinkOpen.width() - 1) + 'px'
                        });

                        $ul.slideToggle('fast', function () {
                            var offSet = ($('a.selected', $ul).offset().top - $ul.offset().top);
                            $ul.animate({
                                scrollTop: offSet
                            });
                        });

                        if (!$wrapper.data('clone')) {
                            $clone = $wrapper.clone().hide().insertBefore($wrapper);
                            $wrapper.data('clone', $clone);
                        } else {
                            $clone = $wrapper.data('clone');
                        }

                        $clone.show();
                        $wrapper.appendTo('body').css({
                            position: 'absolute',
                            top: $clone.offset().top,
                            left: $clone.offset().left,
                            width: $clone.width() + 'px',
                            height: $clone.height() + 'px'
                        });
                    }
                });

                $selectOuterWidth = $select.outerWidth();
                $oSpan = $('span:first', $wrapper);
                $newWidth = ($selectOuterWidth > $oSpan.innerWidth()) ? $selectOuterWidth + $oLinkOpen.outerWidth() : $wrapper.width();

                $wrapper.css({width: $newWidth}); // Set the new width

                // Calculate the height if necessary, less elements that the default height
                //show the ul to calculate the block, if ul is not displayed li height value is 0
                $ul.css({
                    display: 'block',
                    visibility: 'hidden'
                });

                if ($ul.is(':hidden')) {
                    $hidden_containers = $($ul.parentsUntil(':visible').get().reverse());
                    $hidden_containers.each(function () {
                        var $this = $(this);
                        if ($this.is(':hidden')) {
                            $this.data('style', $this.attr('style') || false);
                            $this.css({
                                position: 'absolute',
                                left: '-10000px',
                                display: 'block'
                            });
                        }
                    });
                }

                $iSelectHeight = ($('li', $ul).length) * ($('li:first', $ul).height()); //+1 else bug ff
                ($iSelectHeight < $ul.height()) && $ul.css({
                    height: $iSelectHeight,
                    'overflow': 'hidden'
                }); //hidden else bug with ff

                $ul.css({
                    display: 'none',
                    visibility: 'visible'
                });

                if ($hidden_containers) {
                    $hidden_containers.each(function () {
                        var $this = $(this);
                        if (typeof $this.data('style') != 'undefined') {
			    $this.attr('style', $this.data('style') || '');
			}
                    });
                }
            });

            jqTransformAddDocumentListener();
        }
        return this;
    };

    $.fn.jqTransform = function () {

        /* each form */
        return this.each(function () {
            var $this = $(this);
            if ($this.hasClass('jqtransformdone')) {
                return;
            }
            $this.addClass('jqtransformdone');

            $('input:submit, input:reset, input[type="button"]', this).jqTransInputButton();
            $('input:text, input:password', this).jqTransInputText();
            $('input:checkbox', this).jqTransCheckBox();
            $('input:radio', this).jqTransRadio();
            $('textarea', this).jqTransTextarea();
            $('select', this).jqTransSelect();

            $this.bind('reset', function () {
                var action = function () {
		    jqTransformReset(this);
		};
                window.setTimeout(action, 10);
            });

        }); /* End Form each */

    }; /* End the Plugin */

})(jQuery);