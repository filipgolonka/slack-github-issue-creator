module.exports = ({ channelName, text, titleText, slackDomain, channelId, messageTimestamp, username, reporter }, predefinedChannel) => {
    const title = titleText ? titleText : `Issue created from Slack message on #${channelName}`;

    let message = '';
    if (messageTimestamp) {
        const link = `https://${slackDomain}.slack.com/archives/${channelId}/p${messageTimestamp.replace('.', '')}`;
        message = `Link to Slack discussion: ${link}\n\n`;
    }

    message = `${message}${text ? text : ''}`;

    if (username) {
        message = `${message}\n\nAuthored by @${username.replace(/\./gi, '-')}`;
    }

    if (reporter && reporter !== username) {
        message = `${message}\n\nReported by @${reporter.replace(/\./gi, '-')}`;
    }

    const repositoryField = {
        type: 'input',
        block_id: 'repository',
        element: {
            type: 'external_select',
            action_id: 'repository',
            placeholder: {
                type: 'plain_text',
                text: 'Select repository',
            },
            min_query_length: 3,
        },
        label: {
            type: 'plain_text',
            text: 'Repository',
            emoji: true
        },
    };

    if (predefinedChannel) {
        repositoryField.element.initial_option = {
            text: {
                type: 'plain_text',
                text: predefinedChannel.name,
            },
            value: predefinedChannel.value,
        };
    }

    return {
        title: {
            type: 'plain_text',
            text: 'Create Github issue'
        },
        submit: {
            type: 'plain_text',
            text: 'Submit'
        },
        callback_id: 'new-issue-modal',
        blocks: [
            repositoryField,
            {
                type: 'input',
                block_id: 'title',
                element: {
                    type: 'plain_text_input',
                    action_id: 'title',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Fill in issue title'
                    },
                    initial_value: title,
                },
                label: {
                    type: 'plain_text',
                    text: 'Issue title'
                }
            },
            {
                type: 'input',
                block_id: 'description',
                element: {
                    type: 'plain_text_input',
                    action_id: 'description',
                    multiline: true,
                    placeholder: {
                        type: 'plain_text',
                        text: 'Fill in issue description'
                    },
                    initial_value: message,
                },
                label: {
                    type: 'plain_text',
                    text: 'Issue description',
                    emoji: true
                },
            },
            {
                block_id: 'channel',
                type: 'input',
                optional: true,
                label: {
                    type: 'plain_text',
                    text: 'Select a channel to post the result on',
                },
                element: {
                    action_id: 'channel',
                    type: 'conversations_select',
                    response_url_enabled: true,
                    default_to_current_conversation: true,
                },
            },
        ],
        type: 'modal'
    }
}
