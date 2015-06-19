(function() {
// Mandrill API key
// lTcREt9DBP2LPqR8E0WEEg
  return {

    events: {
      'app.created': 'init',
      'click .email': 'testEmail'

    },

    requests: {

      mandrillAgentTEST: function(notificationData) {
        var message = helpers.fmt('You were mentioned in ticket <a href="%@">#%@</a> and the comment is below.<br></br><br><i>"%@"</i>', notificationData['ticket_url'], notificationData['ticket_id'], notificationData['comment_text']);

        var currentUser = this.currentUser();

        return {
          url: 'https://mandrillapp.com/api/1.0/messages/send-template.json',
          type: 'POST',
          data: {
            "key": this.setting('mandrill_api_key'),
            "template_name": "notification",
            "template_content": [
              {
                "name": "body",
                "content": message
              }
            ],
            "message": {
                "subject": "Holla! You were mentioned in ticket #" + notificationData['ticket_id'],
                "from_email": "jeremiah@zendesk.com",
                "from_name": "Test Forwarding Notification From Zendesk App",
                "to": [
                  {
                    "email": currentUser.email(),
                    "name": currentUser.name(),
                    "type": "to"
                  }
                ],
                "headers": {
                  "Reply-To": "noreply@zendesk.com"
                }
            }
          }
        };
      }

    },

    init: function() {
      this.switchTo('main');
    },

    testEmail: function() {
      var ticket           = this.ticket(),
          ticket_id        = ticket.id(),
          currentAccount   = this.currentAccount(),
          url              = "https://" + currentAccount.subdomain() + ".zendesk.com",
          notificationData = {
            'comment_text' : 'TEST COMMENT TEXT',
            'ticket_id'    : ticket_id,
            'ticket_url'   : url + '/requests/' + ticket_id
          };

      this.ajax('mandrillAgentTEST', notificationData)
        .done( function(response) {
          console.log('######## testEmail - DONE');
          console.log(response);
          this.switchTo('response', {
            status: response[0].status
          })
        })
        .fail( function(response) {
          console.log('######## testEmail - FAIL');
          console.log(response);
        });
    }

  };

}());