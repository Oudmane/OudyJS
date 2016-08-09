var OudyAPI = require('oudyapi'),
    jQuery = require('jquery'),
    formSerializer = require('form-serializer'),
    OudyJS;

module.exports = {
    state: null,
    init: function(element) {
        OudyJS = this;
        jQuery(element).on('click', '[href]:not([noj],[oudyview],[href*="#"]):internal', function() {
            OudyJS.request({
                uri: jQuery(this).URI(),
                method: 'GET',
                push: true
            });
            return false;
        });
        jQuery(element).on('submit', '[action]:not([noj]):internal', function() {
            OudyJS.request({
                uri: jQuery(this).URI(),
                method: jQuery(this).attr('method'),
                data: jQuery(this).serializeObject(),
                push: false
            });
            return false;
        });
        window.onpopstate = function(event) {
            event.state.push = false;
            OudyJS.request(event.state);
        };
        history.replaceState({uri:location.pathname+location.search}, '', location.pathname+location.search);
        OudyAPI.callbacks['oudyjs'] = this.render;
    },
    refresh: function() {
        state = history.state;
        state.push = false;
        this.request(state);
    },
    request: function(request) {
        this.state = jQuery.extend({}, request);
        request.beforeSend = function(request) {
            OudyJS.events.beforeSend(request);
        };
        request.interface = 'oudyjs';
        OudyAPI.send(request);
    },
    render: function(page) {
        OudyJS.events.beforeRender(page);
        document.title = page.title;
        jQuery.each(page.html, function(position) {
            jQuery('[render="'+position+'"]').html(page.html[position]);
        });
        jQuery.each(page.template.classes, function(position) {
            jQuery('[render="'+position+'"]').attr('class', page.template.classes[position].join(' '));
        });
        OudyJS.state.uri = page.uri ? page.uri : page.url.path;
        if(OudyJS.state.push)
            history.pushState(OudyJS.state, page.title, OudyJS.state.uri);
        else
            history.replaceState(OudyJS.state, page.title, OudyJS.state.uri);
        OudyJS.events.render(page);
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