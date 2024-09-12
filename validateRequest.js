const crypto = require('crypto');
const qs = require('qs');

const isValidTimestamp = (req) => {
    const currentTimestamp = (new Date()).getTime();
    const requestTimestamp = req.headers['x-slack-request-timestamp'];

    return Math.abs(currentTimestamp / 1000 - requestTimestamp) <= 60 * 5;
}

const isValidSignature = (req, signingSecret) => {
    const slackSignature = req.headers['x-slack-signature'];
    const requestBody = qs.stringify(req.body, { format:'RFC1738' });
    const timestamp = req.headers['x-slack-request-timestamp'];

    const sigBasestring = `v0:${timestamp}:${requestBody}`;

    const mySignature = 'v0=' +
        crypto.createHmac('sha256', signingSecret)
            .update(sigBasestring, 'utf8')
            .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(mySignature, 'hex'),
        Buffer.from(slackSignature, 'hex')
    );
}

const validateRequest = (req, signingSecret) => {
    if (!isValidTimestamp(req)) {
        return {
            isValid: false,
            reason: 'Replay attack detected',
        }
    }

    if (!isValidSignature(req, signingSecret)) {
        return {
            isValid: false,
            reason: 'Signature mismatch',
        }
    }

    return {
        isValid: true,
        reason: '',
    }
};

module.exports = validateRequest;
