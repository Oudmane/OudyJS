var OudyJS = {
    state: null,
    init: function(element) {
        $(element).on('click', '[href]:not([noj],[oudyview]):internal', function() {
            OudyJS.request({
                uri: $(this).URI(),
                method: 'GET',
                push: true
            });
            return false;
        });
        $(element).on('submit', '[action]:not([noj]):internal', function() {
            OudyJS.request({
                uri: $(this).URI(),
                method: $(this).attr('method'),
                data: $(this).serializeObject(),
                push: false
            });
            return false;
        });
        window.onpopstate = function(event) {
            event.state.push = false;
            OudyJS.request(event.state);
        };
        history.replaceState({uri:location.pathname}, '', location.pathname);
        OudyAPI.callbacks['oudyjs'] = this.render;
    },
    refresh: function() {
        state = history.state;
        state.push = false;
        OudyJS.request(state);
    },
    request: function(request) {
        this.state = $.extend({}, request);
        request.beforeSend = function(request) {
            if(request) {
                request.withCredentials = true;
                request.setRequestHeader('Client', 'c');
                request.setRequestHeader('Interface', 'oudyjs');
            }
            OudyJS.events.beforeSend(request);
        };
        request.id = 'oudyjs';
        request.render = 'oudyjs';
        request.success = this.render;
        request.cache = false;
        OudyAPI.send(request);
    },
    render: function(page) {
        document.title = page.title;
        $.each(page.html, function(position) {
            $('[render="'+position+'"]').html(page.html[position]);
        });
        $.each(page.template.classes, function(position) {
            $('[render="'+position+'"]').attr('class', page.template.classes[position].join(' '));
        });
        OudyJS.state.uri = page.uri ? page.uri : page.url.path;
        if(OudyJS.state.push)
            history.pushState(OudyJS.state, page.title, OudyJS.state.uri);
        else
            history.replaceState(OudyJS.state, page.title, OudyJS.state.uri);
        OudyJS.events.render(page);
    },
    events: {
        open: function(event) {
            
        },
        close: function(event) {
            
        },
        message: function(event) {
            
        },
        error: function(event) {
            
        },
        beforeSend: function(request) {
            
        },
        render: function(page) {
            
        }
    }
};
jQuery.fn.URI = function() {
    switch(this.prop('tagName')) {
        case 'A':
            return this[0].href.replace(location.origin, '');
            break;
        case 'FORM':
            return this[0].action.replace(location.origin, '');
            break;
        default:
            return $(this).attr('href');
            break;
    }
};
jQuery.expr[':'].external = function (a) {
    var PATTERN_FOR_EXTERNAL_URLS = /^(\w+:)?\/\//;
    var href = $(a).URI();
    return href !== undefined && href.search(PATTERN_FOR_EXTERNAL_URLS) !== -1;
};
jQuery.expr[':'].internal = function (a) {
    return $(a).URI() !== undefined && !$.expr[':'].external(a);
};