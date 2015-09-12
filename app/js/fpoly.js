

var fpoly = angular.module('fpoly', []);


/*
 * fAlert : displaying notification (using bootstrap alerts) for different level
 *
 * Config object allow following configuration :
 *    - elementId : html ID of the element to add the notificaiton to - default 'messages'
 *    - moveFocus : move the focus of the page to the notification element - default true
 *    - timeout : close the notification after a timeout periode (in ms) - default 0 : no timeout
 */
fpoly.factory('fAlert', function ($timeout) {

    function defaultValue(config, key, theDefault) {
        if (config == null || config[key] == null) {
            return theDefault;
        }

        return config[key];
    }

    return {

        success: function (message, config) {
            this.message(message, 'success', config);
        },

        info: function (message, config) {
            this.message(message, 'info', config);
        },

        warning: function (message, config) {
            this.message(message, 'warning', config);
        },

        error: function (message, config) {
            this.message(message, 'danger', config);
        },

        message: function (message, type, config) {
            var elementId = defaultValue(config, 'elementId', 'messages');

            var uniqueId = _.uniqueId('-alert-');
            var id = elementId + uniqueId;

            var html = '<div class="alert alert-' + type + ' alert-dismissable fade in" id="' + id + '">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                message;

            //display detail info
            if(config != null && config.detail != null){
                var detailId = 'toggle-detail-' + uniqueId;
                html += '<br/><a data-toggle="collapse" data-target="#' + detailId + '" class="message-detail">Detail&nbsp;<span class="caret"></span></a>';
                html += '<div class="collapse" id="' + detailId + '">' + config.detail + '</div>';
            }

            html += '</div>';
            $('#' + elementId).append(html);

            //enable alert transition
            $('#' + id).alert();

            var timeout = defaultValue(config, 'timeout', 0);
            if (timeout !== 0) {
                //display it only for a period of time
                $timeout(function () {
                        $('#' + id).alert('close');
                    },
                    timeout
                );
            }

            //move up the focus
            if (defaultValue(config, 'moveFocus', true)) {
                window.scrollTo(0, 0);
            }
        }
    };
});//fAlert
