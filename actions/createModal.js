const got = require('got');
const getUsername = require('./helpers/getUsername');
const createModal = require('./helpers/createModal');

const createModalAction = async (payload, slackApiToken, channelMap = {}) => {
    const {
        trigger_id,
        channel: {name: channelName, id: channelId},
        team: {domain: slackDomain},
        message: {text, ts: messageTimestamp, user: userId},
        user: { username: reporter },
        title: { text: titleText } = {},
    } = payload;

    const predefinedChannel = channelMap[channelId];

    const username = await getUsername(userId, slackApiToken);

    return got.post('https://slack.com/api/views.open', {
        headers: {
            Authorization: `Bearer ${slackApiToken}`,
        },
        json: {
            trigger_id,
            view: createModal({ channelName, text, titleText, channelId, slackDomain, messageTimestamp, username, reporter }, predefinedChannel),
        },
    });
};

module.exports = createModalAction;
