var OudyAPI = require('oudyapi'),
    jQuery = require('jquery'),
    formSerializer = require('form-serializer'),
    OudyJS,
    events = jQuery({});

module.exports = {
    state: null,
    init: function(element) {
        OudyJS = this;
        jQuery(element).on('click', '[href]:not([noj],[oudyview],[href*="#"]):internal', function() {
            OudyJS.request({
                uri: jQuery(this).URI(),
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
        OudyAPI.on('before:oudyjs', function(event, request) {
            OudyJS.trigger('before', request);
        });
        OudyAPI.on('success:oudyjs', function(event, response) {
            OudyJS.trigger('success', response);
            OudyJS.render(response.response);
        });
        OudyAPI.on('complete:oudyjs', function(event, response) {
            OudyJS.trigger('complete', response);
        });
    },
    refresh: function() {
        state = history.state;
        state.push = false;
        this.request(state);
    },
    request: function(request) {
        this.state = jQuery.extend({}, request);
        request.interface = 'oudyjs';
        OudyAPI.send(request);
    },
    render: function(page) {
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
        OudyJS.trigger('render', page);
    },
    on: events.on.bind(events),
    one: events.one.bind(events),
    trigger: events.trigger.bind(events)
};