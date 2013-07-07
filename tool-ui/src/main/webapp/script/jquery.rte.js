/** Rich text editor based on wysihtml5. */
(function($, win, undef) {

var $win = $(win),
        doc = win.document;

$.each(CSS_CLASS_GROUPS, function() {
    var command = 'cms-' + this.internalName;
    var prefix = command + '-';
    var regex = new RegExp(prefix + '[0-9a-z\-]+', 'g');

    wysihtml5.commands[command] = {
        'exec': function(composer, command, optionsString) {
            var options = optionsString ? $.parseJSON(optionsString) : { };
            var tag = options.tag || 'span';
            var format = tag === 'span' ? 'formatInline' : 'formatBlock';
            return wysihtml5.commands[format].exec(composer, command, tag, prefix + options.internalName, regex);
        },

        'state': function(composer, command, optionsString) {
            var options = optionsString ? $.parseJSON(optionsString) : { };
            var tag = options.tag || 'span';
            var format = tag === 'span' ? 'formatInline' : 'formatBlock';
            return wysihtml5.commands[format].state(composer, command, tag , prefix + options.internalName, regex);
        }
    };
});

var $createToolbarGroup = function(label) {
    var $group = $('<span/>', { 'class': 'rte-group', 'data-group-name': label });
    var $label = $('<span/>', { 'class': 'rte-group-label', 'text': label });
    var $buttons = $('<span/>', { 'class': 'rte-group-buttons' });
    $group.append($label);
    $group.append($buttons);
    return $group;
};

var $createToolbarCommand = function(label, command) {
    return $('<span/>', {
        'class': 'rte-button rte-button-' + command,
        'data-wysihtml5-command': command,
        'text': label
    });
};

var createToolbar = function(inline) {
    var $container = $('<div/>', { 'class': 'rte-toolbar-container' });

    var $toolbar = $('<div/>', { 'class': 'rte-toolbar' });
    $container.append($toolbar);

    var $font = $createToolbarGroup('Font');
    $toolbar.append($font);
    $font = $font.find('.rte-group-buttons');

    $font.append($createToolbarCommand('Bold', 'bold'));
    $font.append($createToolbarCommand('Italic', 'italic'));
    $font.append($createToolbarCommand('Underline', 'underline'));
    $font.append($createToolbarCommand('Strike', 'strike'));
    $font.append($createToolbarCommand('Superscript', 'superscript'));
    $font.append($createToolbarCommand('Subscript', 'subscript'));

    $.each(CSS_CLASS_GROUPS, function() {
        var $group = $createToolbarGroup(this.displayName);
        var command = 'cms-' + this.internalName;

        if (this.dropDown) {
            $group.addClass('rte-group-dropDown');
        }

        $group.addClass('rte-group-cssClass');
        $group.addClass('rte-group-cssClass-' + this.internalName);
        $toolbar.append($group);
        $group = $group.find('.rte-group-buttons');

        $.each(this.cssClasses, function() {
            var $cssClass = $createToolbarCommand(this.displayName, command);
            $cssClass.attr('data-wysihtml5-command-value', JSON.stringify(this));
            $group.append($cssClass);
        });
    });

    if (!inline) {
        var $alignment = $createToolbarGroup('Alignment') ;
        $toolbar.append($alignment);
        $alignment = $alignment.find('.rte-group-buttons');

        $alignment.append($createToolbarCommand('Justify Left', 'textAlign').attr('data-wysihtml5-command-value', 'left'));
        $alignment.append($createToolbarCommand('Justify Center', 'textAlign').attr('data-wysihtml5-command-value', 'center'));
        $alignment.append($createToolbarCommand('Justify Right', 'textAlign').attr('data-wysihtml5-command-value', 'right'));

        var $list = $createToolbarGroup('List');
        $toolbar.append($list);
        $list = $list.find('.rte-group-buttons');

        $list.append($createToolbarCommand('Unordered List', 'insertUnorderedList'));
        $list.append($createToolbarCommand('Ordered List', 'insertOrderedList'));
    }

    var $enhancement = $createToolbarGroup('Enhancement');
    $toolbar.append($enhancement);
    $enhancement = $enhancement.find('.rte-group-buttons');

    $enhancement.append($createToolbarCommand('Link', 'createLink'));

    if (!inline) {
        $enhancement.append($createToolbarCommand('Add Enhancement', 'insertEnhancement'));
        $enhancement.append($createToolbarCommand('Add Marker', 'insertMarker'));
    }

    var $misc = $createToolbarGroup('Misc');
    $toolbar.append($misc);
    $misc = $misc.find('.rte-group-buttons');

    $misc.append($('<span/>', {
        'class': 'rte-button rte-button-html',
        'data-wysihtml5-action': 'change_view',
        'text': 'HTML'
    }));

    $misc.append($('<span/>', {
        'class': 'rte-button rte-button-trackChanges',
        'data-wysihtml5-command': 'trackChanges',
        'text': 'Track Changes'
    }));

    $toolbar.append($(
        '<div class="rte-dialog" data-wysihtml5-dialog="createLink" style="display: none;">' +
            ' <label>URL:' +
            ' <input type="text" data-wysihtml5-dialog-field="href" value="http://"></label>' +
            ' <label>Window:' +
            ' <select data-wysihtml5-dialog-field="target">' +
                '<option value="_self">Same</option>' +
                '<option value="_blank">New</option>' +
            '</select></label>' +
            ' <a data-wysihtml5-dialog-action="save">OK</a>' +
            ' <a data-wysihtml5-dialog-action="cancel">Cancel</a>' +
        '</div>'));

    return $container[0];
};

var $createEnhancementAction = function(label, action) {
    return $('<span/>', {
        'class': 'rte-button rte-button-' + action,
        'data-action': action,
        'text': label
    });
};

var createEnhancement = function() {
    var $enhancement = $('<div/>', { 'class': 'rte-enhancement' });

    var $toolbar = $('<div/>', { 'class': 'rte-toolbar' });
    $enhancement.append($toolbar);

    var $position = $createToolbarGroup('Position');
    $toolbar.append($position);

    $position.append($createEnhancementAction('Move Left', 'moveLeft'));
    $position.append($createEnhancementAction('Move Up', 'moveUp'));
    $position.append($createEnhancementAction('Move Center', 'moveCenter'));
    $position.append($createEnhancementAction('Move Down', 'moveDown'));
    $position.append($createEnhancementAction('Move Right', 'moveRight'));

    var $misc = $createToolbarGroup('Misc');
    $toolbar.append($misc);

    $misc.append($('<span/>', {
        'class': 'rte-button rte-button-editEnhancement',
        'html': $('<a/>', {
            'href': CONTEXT_PATH + '/content/enhancement.jsp?id=',
            'target': 'contentEnhancement',
            'text': 'Edit'
        })
    }));

    $misc.append($createEnhancementAction('Remove', 'remove'));

    $enhancement.append($('<div/>', { 'class': 'rte-enhancement-label' }));

    return $enhancement[0];
};

var createMarker = function() {
    var $marker = $('<div/>', { 'class': 'rte-enhancement rte-marker' });

    var $toolbar = $('<div/>', { 'class': 'rte-toolbar' });
    $marker.append($toolbar);

    var $position = $createToolbarGroup('Position');
    $toolbar.append($position);

    $position.append($createEnhancementAction('Move Up', 'moveUp'));
    $position.append($createEnhancementAction('Move Down', 'moveDown'));

    var $misc = $createToolbarGroup('Misc');
    $toolbar.append($misc);

    $misc.append($('<span/>', {
        'class': 'rte-button rte-button-selectMarker',
        'html': $('<a/>', {
            'href': CONTEXT_PATH + '/content/marker.jsp',
            'target': 'contentEnhancement',
            'text': 'Select'
        })
    }));

    $misc.append($createEnhancementAction('Remove', 'remove'));

    $marker.append($('<div/>', { 'class': 'rte-enhancement-label' }));

    return $marker[0];
};

// Wrap wysihtml5 to add functionality.
var rtes = [ ];
var enhancementId = 0;
var createEnhancementId = function() {
    ++ enhancementId;
    return enhancementId;
};

var Rte = wysihtml5.Editor.extend({

    'constructor': function(originalTextarea, config) {
        var rte = this;

        // Create container.
        var container = this.container = doc.createElement('div');
        container.className = 'rte-container';
        originalTextarea.parentNode.insertBefore(container, originalTextarea);

        // Create toolbar?
        if (typeof config.toolbar === 'function') {
            config.toolbar = config.toolbar(config.inline);
            container.appendChild(config.toolbar);
        }

        // Create overlay.
        var overlay = this.overlay = doc.createElement('div');
        overlay.className = 'rte-overlay';
        overlay.style.position = 'relative';
        overlay.style.left = '0px';
        overlay.style.top = '0px';
        container.appendChild(overlay);

        // Handle toolbar action clicks.
        $(overlay).delegate('[data-action]', 'click', function() {
            var $button = $(this);
            var $placeholder = $button.closest('.rte-enhancement').data('$rte-placeholder');
            var action = $button.attr('data-action');

            if (action == 'remove') {
                $placeholder.remove();

            } else if (action === 'moveCenter') {
                $placeholder.removeAttr('data-alignment');

            } else if (action === 'moveLeft') {
                $placeholder.attr('data-alignment', 'left');

            } else if (action === 'moveRight') {
                $placeholder.attr('data-alignment', 'right');

            } else {
                var oldTop = $placeholder.offset().top;

                if (action === 'moveDown') {
                    $placeholder.closest('body').find('br + br, h1, h2, h3, h4, h5, h6, p').each(function() {
                        if ($placeholder[0].compareDocumentPosition(this) & Node.DOCUMENT_POSITION_FOLLOWING) {
                            $(this).after($placeholder);
                            return false;
                        }
                    });

                    $win.scrollTop($win.scrollTop() + $placeholder.offset().top - oldTop);

                } else if (action === 'moveUp') {
                    var precedings = [ ],
                            precedingsLength;

                    $placeholder.closest('body').find('br + br, h1, h2, h3, h4, h5, h6, p').each(function() {
                        if ($placeholder[0].compareDocumentPosition(this) & Node.DOCUMENT_POSITION_PRECEDING) {
                            precedings.push(this);
                        }
                    });

                    precedingsLength = precedings.length;

                    if (precedingsLength >= 2) {
                        $(precedings[precedingsLength - 2]).after($placeholder);

                    } else {
                        $placeholder.closest('body').prepend($placeholder);
                    }

                    $win.scrollTop($win.scrollTop() + $placeholder.offset().top - oldTop);
                }
            }

            rte.updateOverlay();

            return false;
        });

        // Initialize wysihtml5.
        container.appendChild(originalTextarea);
        originalTextarea.className += ' rte-textarea';

        rtes[rtes.length] = this;
        this.base(originalTextarea, config);

        this.observe('load', function() {

            // Make sure placeholder BUTTONs are replaced with enhancement SPANs.
            var convertNodes = function(parent, oldTagName, newTagName, callback) {
                var childNodes = parent.childNodes;

                if (parent.childNodes) {
                    var childNodesLength = childNodes.length;

                    for (var i = 0; i < childNodesLength; ++ i) {
                        var node = childNodes[i];

                        if (node &&
                                node.tagName &&
                                node.tagName === oldTagName &&
                                wysihtml5.dom.hasClass(node, 'enhancement')) {
                            var newNode = parent.ownerDocument.createElement(newTagName);
                            var nodeAttributes = node.attributes;
                            var nodeAttributesLength = nodeAttributes.length;

                            for (var j = 0; j < nodeAttributesLength; ++ j) {
                                var attribute = nodeAttributes[j];
                                newNode.setAttribute(attribute.name, attribute.value);
                            }

                            if (callback) {
                                callback(newNode);
                            }

                            parent.insertBefore(newNode, node);
                            parent.removeChild(node);

                        } else {
                            convertNodes(node, oldTagName, newTagName, callback);
                        }
                    }
                }
            };

            var textarea = this.textarea;
            var lastTextareaValue;

            if (config.inline && !$(textarea.element).val()) {
                $(textarea.element).val('<br>');
            }

            textarea._originalGetValue = textarea.getValue;
            textarea.getValue = function(parse) {
                var value = this._originalGetValue(parse),
                        dom;

                if (lastTextareaValue === value) {
                    return value;

                } else {
                    lastTextareaValue = value;
                    dom = wysihtml5.dom.getAsDom(value, this.element.ownerDocument);
                    convertNodes(dom, 'SPAN', 'BUTTON');
                    return dom.innerHTML;
                }
            };

            var composer = this.composer;
            var lastComposerValue;

            composer._originalGetValue = composer.getValue;
            composer.getValue = function(parse) {
                var value = this._originalGetValue(parse);

                if (lastComposerValue === value) {
                    return value;

                } else {
                    lastComposerValue = value;
                    dom = wysihtml5.dom.getAsDom(value, this.element.ownerDocument);
                    convertNodes(dom, 'BUTTON', 'SPAN', function(node) {
                        node.innerHTML = 'Enhancement';
                    });
                    return dom.innerHTML;
                }
            };

            composer.setValue(textarea.getValue());

            // Some style clean-ups.
            composer.iframe.style.overflow = 'hidden';
            composer.iframe.contentDocument.body.style.overflow = 'hidden';
            composer.iframe.contentDocument.body.className += ' rte-loaded';
            textarea.element.className += ' rte-source';

            // Make sure only one toolbar is visible at a time.
            if (this !== rtes[0]) {
                this.toolbar.hide();
            }

            this.on('focus', function() {
                $(textarea.element).parentsUntil('form').addClass('state-focus');
                $(textarea.element).trigger('input');

                for (var i = 0, length = rtes.length; i < length; ++ i) {
                    rtes[i].toolbar.hide();
                }

                this.toolbar.show();
            });

            this.on('blur', function() {
                $(textarea.element).parentsUntil('form').removeClass('state-focus');
            });

            $(composer.element).bind('keyup', function() {
                $(textarea.element).trigger('input');
            });

            // Track changes.
            var IGNORE_KEYS = [ 16, 17, 18, 37, 38, 39, 40, 91 ],
                    downRange,
                    collapseSelection,
                    wrapInDel,
                    handleDelete;

            // Move the cursor to the beginning or the end of the selection.
            collapseSelection = function(selection, direction) {
                if (direction === 'forward') {
                    selection.getSelection().collapseToEnd();

                } else {
                    selection.getSelection().collapseToStart();
                }
            };

            // Wrap the current selection in <del>.
            wrapInDel = function(direction) {
                var selection = composer.selection,
                        range;

                if (!wysihtml5.commands.formatInline.state(composer, null, 'del')) {
                    wysihtml5.commands.formatInline.exec(composer, null, 'del');
                }

                // <del> shouldn't contain any <ins>s.
                $.each(selection.getNodes(1, function(node) {
                    return node.tagName.toLowerCase() === 'ins';

                }), function(i, ins) {
                    $(ins).remove();
                });

                collapseSelection(selection, direction);
            };

            // Handle different types of delete key presses.
            handleDelete = function(selection, range, direction) {
                if (range.collapsed) {

                    // Let the delete go through within <ins>.
                    if ($(selection.getSelectedNode()).closest('ins').length > 0) {
                        return true;

                    // Wrap the character before the cursor in <del>.
                    } else {
                        selection.getSelection().nativeSelection.modify('extend', direction, 'character');

                        if (!wysihtml5.commands.formatInline.state(composer, null, 'del')) {
                            wysihtml5.commands.formatInline.exec(composer, null, 'del');
                        }

                        collapseSelection(selection, direction);
                    }

                } else {
                    wrapInDel(direction);
                }

                return false;
            };

            $(composer.element).bind('keydown', function(event) {
                var which = event.which,
                        selection = composer.selection,
                        range = selection.getRange();

                // BACKSPACE.
                if (which === 8) {
                    return handleDelete(selection, range, 'backward');

                // DELETE.
                } else if (which === 46) {
                    return handleDelete(selection, range, 'forward');

                // For any other key, remember the position for later so that
                // we know where to start wrapping for <ins>.
                } else if ($.inArray(which, IGNORE_KEYS) < 0) {
                    if (!range.collapsed &&
                            !(event.altKey ||
                            event.ctrlKey ||
                            event.metaKey ||
                            event.shiftKey)) {
                        wrapInDel();
                    }

                    if (!downRange) {
                        downRange = selection.getRange().cloneRange();
                    }

                    return true;
                }
            });

            $(composer.element).bind('keyup', function(event) {
                var selection,
                        range;

                if (!downRange ||
                        $.inArray(event.which, IGNORE_KEYS) >= 0) {
                    return;
                }

                selection = composer.selection;
                range = selection.getRange();

                selection.executeAndRestore(function() {
                    range.setStart(downRange.startContainer, downRange.startOffset);
                    selection.setSelection(range);

                    if (!wysihtml5.commands.formatInline.state(composer, null, 'ins')) {
                        wysihtml5.commands.formatInline.exec(composer, null, 'ins');
                    }
                });

                // Move all <ins>s out of and after the <del>.
                $(selection.getSelectedNode()).closest('del').each(function() {
                    var $del = $(this),
                            $ins = $del.find('ins'),
                            insLength = $ins.length;

                    if (insLength > 0) {
                        $del.after($ins);
                        selection.setAfter($ins[insLength - 1]);
                    }
                });

                downRange = null;
            });

            $(composer.element).addClass('rte-trackChanges');
            rte.updateOverlay();

            $(composer.element).keyup($.throttle(200, function() {
                rte.updateOverlay();
            }));
        });
    },

    // Updates the overlay to show enhancements above the underlying
    // placeholders.
    'updateOverlay': function() {
        var rte = this;

        // Hide if viewing source.
        var textarea = this.textarea;
        var overlay = this.overlay;

        overlay.style.display = this.currentView === textarea ? 'none' : 'block';

        // Automatically size the iframe height to match the content.
        var composer = this.composer;
        var composerIframe = composer.iframe;
        var composerIframeWindow = composerIframe.contentWindow;

        $(composerIframe).css('min-height', $(composerIframeWindow.document.body).height() + (rte.config.inline ? 10 : 40));
        $(composerIframeWindow).scrollTop(0);

        // Create enhancements based on the underlying placeholders.
        var $overlay = $(overlay);

        $overlay.children().each(function() {
            $(this).data('rte-visited', false);
        });

        $(composerIframe.contentDocument.body).find('button.enhancement').each(function() {
            var $placeholder = $(this);
            var id = $placeholder.data('rte-enhancementId');

            if (!id) {
                id = createEnhancementId();
                $placeholder.data('rte-enhancementId', id);
            }

            var $enhancement = $('#rte-enhancement-' + id);
            var isMarker = wysihtml5.dom.hasClass($placeholder[0], 'marker');

            if ($enhancement.length === 0) {
                var newEnhancement = rte.config[isMarker ? 'marker' : 'enhancement']();
                newEnhancement.style.position = 'absolute';
                newEnhancement.setAttribute('id', 'rte-enhancement-' + id);
                $enhancement = $(newEnhancement);
                $enhancement.data('$rte-placeholder', $placeholder);
                $overlay.append($enhancement);

                $enhancement.find('.rte-button-editEnhancement a').each(function() {
                    var $anchor = $(this),
                            href = $anchor.attr('href');

                    href = href.replace(/([?&])id=[^&]*/, '$1');
                    href += '&id=' + $placeholder.attr('data-id');

                    $anchor.attr('href', href);
                });
            }

            $enhancement.data('rte-visited', true);

            // Position enhancement to cover the placeholder.
            var placeholderOffset = $placeholder.offset();

            $enhancement.css({
                'height': $placeholder.outerHeight(),
                'left': placeholderOffset.left,
                'top': placeholderOffset.top,
                'width': $placeholder.outerWidth()
            });

            // Copy the enhancement label.
            var $label = $enhancement.find('.rte-enhancement-label');
            var preview = $placeholder.attr('data-preview');

            if (preview) {
                $label.html($('<figure/>', {
                    'html': $('<img/>', {
                        'src': preview
                    })
                }));

            } else {
                $label.text(
                        $placeholder.attr('data-label') ||
                        'Empty ' + (isMarker ? 'Marker' : 'Enhancement'));
            }
        });

        // Remove orphaned enhancements.
        $overlay.children().each(function() {
            var $enhancement = $(this);
            if (!$enhancement.data('rte-visited')) {
                $enhancement.remove();
            }
        });
    }
});

// Add support for strike command.
wysihtml5.commands.strike = {

    'exec': function(composer, command) {
        return wysihtml5.commands.formatInline.exec(composer, command, 'strike');
    },

    'state': function(composer, command) {
        return wysihtml5.commands.formatInline.state(composer, command, 'strike');
    }
};

var textAlignRegex = /cms-textAlign-[0-9a-z\-]+/g;
wysihtml5.commands.textAlign = {

    'exec': function(composer, command, alignment) {
        return wysihtml5.commands.formatBlock.exec(composer, command, null, 'cms-textAlign-' + alignment, textAlignRegex);
    },

    'state': function(composer, command, alignment) {
        return wysihtml5.commands.formatBlock.state(composer, command, null, 'cms-textAlign-' + alignment, textAlignRegex);
    }
};

// Remove support for insertImage so that it can't be used accidentantly,
// since insertEnhancement supercedes its functionality.
delete wysihtml5.commands.insertImage;

// Add support for adding an enhancement.
wysihtml5.commands.insertEnhancement = {

    'exec': function(composer, command, value) {
        var doc = composer.doc;
        var button = doc.createElement('BUTTON');

        if (value) {
            for (var i in value) {
                button.setAttribute(i, value[i]);
            }
        }

        button.setAttribute('class', 'enhancement');
        $(composer.selection.getSelectedNode()).closest('body > *').before(button);
    },

    'state': function(composer) {
        return false;
    }
};

// Add support for adding a marker.
wysihtml5.commands.insertMarker = {

    'exec': function(composer, command, value) {
        var doc = composer.doc;
        var button = doc.createElement('BUTTON');

        if (value) {
            for (var i in value) {
                button.setAttribute(i, value[i]);
            }
        }

        button.setAttribute('class', 'enhancement marker');
        $(composer.selection.getSelectedNode()).closest('body > *').before(button);
    },

    'state': function(composer) {
        return false;
    }
};

// Add support for toggling 'Track Changes' mode.
wysihtml5.commands.trackChanges = {

    'exec': function(composer) {
        $(composer.element).toggleClass('rte-trackChanges');
    },

    'state': function(composer) {
        return $(composer.element).hasClass('rte-trackChanges');
    }
};

// Expose as a jQuery plugin.
$.plugin2('rte', {
    '_defaultOptions': {
        'enhancement': createEnhancement,
        'iframeSrc': CONTEXT_PATH + '/style/rte-content.jsp',
        'marker': createMarker,
        'style': false,
        'toolbar': createToolbar,
        'useLineBreaks': true,

        'parserRules': {
            'tags': {
                'p': {
                    'rename_tag': 'span',
                    'callback': function(node) {
                        var $node = $(node);

                        $node.append($('<br>'));
                        $node.append($('<br>'));
                    }
                }
            }
        }
    },

    '_create': function(element) {
        var $element = $(element),
                options = $.extend(true, { }, this.option()),
                rte;

        if ($element.attr('data-inline') === 'true') {
            options.inline = true;
        }

        rte = new Rte(element, options);

        $element.bind('input-disable', function(event, disable) {
            $element.closest('.rte-container').toggleClass('state-disabled', disable);
            rte[disable ? 'disable' : 'enable']();
        });
    },

    'enable': function() {
        var container = this[0];

        if (container) {
            $.each(rtes, function() {
                var textarea = this.textareaElement;
                if (textarea && $.contains(container, textarea)) {
                    this.enable();
                }
            });
        }

        return this;
    },

    // Sets data related to the enhancement.
    'enhancement': function(data) {
        var $enhancement = this.$caller.closest('.rte-enhancement');
        var $placeholder = $enhancement.data('$rte-placeholder');

        if ($placeholder) {
            $.each(data, function(key, value) {
                var name = 'data-' + key;
                if (value === null || value === undef) {
                    $placeholder.removeAttr(name);
                } else {
                    $placeholder.attr(name, value);
                }
            });
        }

        var label = data.label;
        if (label) {
            $enhancement.find('.rte-enhancement-label').text(label);
        }

        return this;
    }
});

// Make sure that the editorial toolbar is visible as long as possible.
$win.bind('resize.rte scroll.rte', $.throttle(100, function() {
    $.each(rtes, function() {
        var $toolbar = $(this.config.toolbar),
                $header,
                headerBottom,
                $container,
                containerTop,
                windowTop;

        if (!$toolbar.is(':visible')) {
            return;
        }

        if ($toolbar.closest('.rte-container').length === 0) {
            return;
        }

        $header = $('.toolHeader');
        headerBottom = $header.offset().top + $header.outerHeight() - ($header.css('position') === 'fixed' ? $win.scrollTop() : 0);
        $container = $(this.container);
        containerTop = $container.offset().top;
        windowTop = $win.scrollTop() + headerBottom;

        // Completely in view.
        if (windowTop < containerTop) {
            $container.css('padding-top', 0);
            $toolbar.removeClass('rte-toolbar-fixed');
            $toolbar.attr('style', this._toolbarOldStyle);
            this._toolbarOldStyle = null;

        } else {
            this._toolbarOldStyle = this._toolbarOldStyle || $toolbar.attr('style') || ' ';

            // Partially in view.
            if (windowTop < containerTop + $container.height()) {
                $container.css('padding-top', $toolbar.outerHeight());
                $toolbar.addClass('rte-toolbarContainer-fixed');
                $toolbar.css({
                    'left': $toolbar.offset().left,
                    'position': 'fixed',
                    'top': headerBottom,
                    'width': $toolbar.width()
                });

            // Completely out of view.
            } else {
                $toolbar.addClass('rte-toolbarContainer-fixed');
                $toolbar.css({
                    'top': -10000,
                    'position': 'fixed'
                });
            }
        }
    });
}));

}(jQuery, window));