OudyJS = {
    request: function(state) {
        if(!state)
            return;
        request = state;
        request.state = $.extend({}, state);
        request.render = 'oudyjs';
        request.headers = {
            'X-Requested-With': 'OudyJS'
        };
        request.beforeSend = function(event) {
            OudyJS.events.beforeSend(event);
        };
        request.success = function(page) {
            if(!page.url)
                page.url = this.state.uri;
            if(this.state.push)
                history.pushState(this.state, page.title, page.url);
            else
                history.replaceState(this.state, page.title, page.url);
            OudyJS.render(page);
            OudyJS.events.render(page);
        };
        request.complete = function(event) {
            OudyJS.events.complete(event);
        };
        OudyAPI.send(request);
    },
    render: function(page) {
        document.title = page.title;
        $.each(page.html, function(position) {
            $('[data-render="'+position+'"]').html(page.html[position]);
        });
        $.each(page.classes, function(position) {
            $('[data-render="'+position+'"]').attr('class', page.classes[position].join(' '));
        });
        $('body').attr('component', page.component);
        if(page.task)
            $('body').attr('task', page.task);
    },
    init: function(element) {
        $(element).on('click', '[href]:not([noj],[oudyview]):internal', function() {
            OudyJS.request({
                uri: $(this).URI(),
                push: true
            });
            return false;
        });
        $(element).on('submit', '[action]:not([noj]):internal', function() {
            OudyJS.request({
                uri: $(this).URI(),
                method: $(this).attr('method'),
                data: $(this).serialize(),
                push: false
            });
            return false;
        });
        window.onpopstate = function(event) {
            event.state.push = false;
            OudyJS.request(event.state);
        };
        history.replaceState({uri:location.pathname}, '', location.pathname);
    },
    refresh: function() {
        state = history.state;
        state.push = false;
        OudyJS.request(state);
    },
    events: {
        beforeSend: function(event){},
        complete: function(event){},
        render: function(page){}
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