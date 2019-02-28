/**
 * Created by Bien on 2018-01-12.
 */
const sendgrid = require('@sendgrid/mail');


sendgrid.setApiKey(process.env.SENDGRID_KEY);

const msg = {
    to: 'test@example.com',
    from: 'test@example.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sendgrid.send(msg);
