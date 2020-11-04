const got = require('got');
const qs = require('querystring');

const getUsername = async (user, slackApiToken) => {
    const response = await got.post('https://slack.com/api/users.info', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: qs.stringify({
            token: slackApiToken,
            user,
        }),
    });

    const body = JSON.parse(response.body);

    if (!body.ok) {
        console.log(body.error);
        return null;
    }

    return body.user.name;
};

module.exports = getUsername;
