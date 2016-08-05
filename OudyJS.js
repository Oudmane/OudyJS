var OudyAPI = require('oudyapi'),
    jQuery = require('jquery'),
    formSerializer = require('form-serializer');

module.exports = {
    state: null,
    init: function(element) {
        $this = this;
        jQuery(element).on('click', '[href]:not([noj],[oudyview],[href*="#"]):internal', function() {
            $this.request({
                uri: jQuery(this).URI(),
                method: 'GET',
                push: true
            });
            return false;
        });
        jQuery(element).on('submit', '[action]:not([noj]):internal', function() {
            $this.request({
                uri: jQuery(this).URI(),
                method: jQuery(this).attr('method'),
                data: jQuery(this).serializeObject(),
                push: false
            });
            return false;
        });
        window.onpopstate = function(event) {
            event.state.push = false;
            $this.request(event.state);
        };
        history.replaceState({uri:location.pathname}, '', location.pathname);
        OudyAPI.callbacks['oudyjs'] = this.render;
    },
    refresh: function() {
        state = history.state;
        state.push = false;
        this.request(state);
    },
    request: function(request) {
        $this = this;
        this.state = jQuery.extend({}, request);
        request.beforeSend = function(request) {
            $this.events.beforeSend(request);
        };
        request.interface = 'oudyjs';
        OudyAPI.send(request);
    },
    render: function(page) {
        this.events.beforeRender(page);
        document.title = page.title;
        jQuery.each(page.html, function(position) {
            jQuery('[render="'+position+'"]').html(page.html[position]);
        });
        jQuery.each(page.template.classes, function(position) {
            jQuery('[render="'+position+'"]').attr('class', page.template.classes[position].join(' '));
        });
        this.state.uri = page.uri ? page.uri : page.url.path;
        if(this.state.push)
            history.pushState(this.state, page.title, this.state.uri);
        else
            history.replaceState(this.state, page.title, this.state.uri);
        this.events.render(page);
    },
    events: {
        open: function(event) {},
        close: function(event) {},
        message: function(event) {},
        error: function(event) {},
        beforeSend: function(request) {},
        beforeRender: function(page) {},
        render: function(page) {}
    }
};