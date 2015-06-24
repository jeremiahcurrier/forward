(function() {
// Mandrill API key below:
// lTcREt9DBP2LPqR8E0WEEg
  return {
    events: {
      // Framework Events
      'app.created'             : function() {
        this.switchTo('main');
      },
      // DOM Events
      'click .email-test'       : 'testEmail', // Send test email via Mandrill
      'click .toggle-app'       : 'toggleAppContainer' // Open/Close element inside .toggle-app CSS selector
      // Request Events (none yet)
    },

    requests: {
      mandrillAgentTEST: function(notificationData) {
        var messageTemplate = this.renderTemplate('email', {notification: notificationData}),
            currentUser = this.currentUser();
        return {
          url: 'https://mandrillapp.com/api/1.0/messages/send-template.json',
          type: 'POST',
          data: {
            "key": this.setting('mandrill_api_key'),
            "template_name": "notification",
            "template_content": [
              {
                "name": "body",
                "content": messageTemplate
              }
            ],
            "message": {
                "subject": "This is a forward of the contents from Zendesk Ticket #" + notificationData['ticket_id'],
                "from_email": currentUser.email(),
                "from_name": currentUser.name(),
                "to": [
                  {
                    "email": notificationData['toEmail'],
                    "name": "",
                    "type": "to"
                  }
                ],
                "headers": {
                  "Reply-To": "snapchatTEST@zendesk.com"
                }
            }
          }
        };
      }
    },

    testEmail: function() {
      // Get TO email address & optional comment (if present)
      var input = this.$('input').val();
      var comment = this.$('textarea').val();

      // Store TO email address & optional comment (if present) in localStorage
      this.store('forwardAppToEmail', input);
      this.store('forwardAppOptionalComment', comment);

      // Check if TO email address is present
      if (this.store('forwardAppToEmail') === '') {
        services.notify('Did you forget to enter an email address before clicking save?', 'alert');
      } else {
      var ticket           = this.ticket(),
          ticket_id        = ticket.id(),
          currentAccount   = this.currentAccount(),
          url              = "https://" + currentAccount.subdomain() + ".zendesk.com",
          notificationData = {
            'comment_text' : 'TEST COMMENT TEXT',
            'ticket_id'    : ticket_id,
            'ticket_url'   : url + '/requests/' + ticket_id,
            'toEmail'      : this.store('forwardAppToEmail')
          };
      if (this.store('forwardAppToEmail') === null) {
        services.notify('Please enter the email address you want to send this ticket to', 'error');
      } else {
        this.ajax('mandrillAgentTEST', notificationData) // pass notificationData to renderTemplate and use that variable as 
          .done( function(data) { // looks like the .done is firing no matter what? 
            console.log('response:');
            console.log(data.status);
            console.log('done');
            this.switchTo('main');
            services.notify('Ticket forwarded to <strong>' + this.store('forwardAppToEmail') + '</strong> successfully!', 'notice');
            this.store('forwardAppToEmail', null); // clear out stored toEmail value
          })
          .fail( function(data) {
            console.log('response:');
            console.log(data.status);
            console.log('fail');
            services.notify('Ticket failed to be forwarded to <strong>' + this.store('forwardAppToEmail') + '</strong>', 'error');
            this.store('forwardAppToEmail', null); // clear out stored toEmail value
          });
        }
      }
    },

    toggleAppContainer: function(){ // ZOMG you can totes collapse ur app now hon!
      var $container  = this.$('.app-container'),
          $icon       = this.$('.toggle-app i');
      if ($container.is(':visible')){
        $container.hide();
        $icon.prop('class', 'icon-plus');
      } else {
        $container.show();
        $icon.prop('class', 'icon-minus');
      }
    }

  };

}());