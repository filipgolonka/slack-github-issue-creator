const express = require('express');
const bodyParser = require('body-parser');
const { GithubClient } = require('./GithubClient');
const validateRequest = require('./validateRequest');
const createModalAction = require('./actions/createModal');
const createGithubIssue = require('./actions/createGithubIssue');

const createServer = (config) => {
    const app = express();

    const githubClient = GithubClient({
        token: config.githubToken,
        baseUrl: config.githubBaseUrl,
    });

    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/', (req, res) => res.send('Hello World!'));

    app.get('/health', (req, res) => res.send('OK'));

    app.post('/create-github-issue', async (req, res) => {
        try {
            const {isValid, reason} = validateRequest(req, config.slackSigningSecret);
            if (!isValid) {
                console.log(reason);
                res.status(403);

                return res.send();
            }

            const payloadParsed = JSON.parse(req.body.payload);

            const {type} = payloadParsed;

            if (type === 'message_action') {
                await createModalAction(payloadParsed, config.slackApiToken, config.channelMap);
            } else if (type === 'view_submission') {
                await createGithubIssue(githubClient, payloadParsed);
            } else {
                res.status(500);
                console.error(`Action "${type}" is not recognized`);

                return res.send();
            }

            res.status(200);
            return res.send();
        } catch (error) {
            console.error(error);

            res.status(500);
            return res.send('An error occurred, try again later')
        }
    });

    app.post('/external-select', async (req, res) => {
        try {
            const payload = JSON.parse(req.body.payload);
            const {action_id: actionId, value} = payload;

            if (actionId !== 'repository') {
                console.log(`Unrecognized external-select action "${actionId}"`);
                res.status(500);
                return res.send(`Unrecognized external-select action "${actionId}"`);
            }

            const result = await githubClient.findRepository({name: value});

            const options = result.search.edges.map(item => {
                return {
                    text: {
                        type: 'plain_text',
                        text: item.node.nameWithOwner,
                    },
                    value: item.node.id,
                }
            });

            res.status(200);
            return res.send({options});
        } catch (error) {
            console.error(error);

            res.status(500);
            return res.send('An error occurred, try again later')
        }
    });

    app.post('/slash-command', async (req, res) => {
        try {
            const { isValid, reason } = validateRequest(req, config.slackSigningSecret);
            if (!isValid) {
                console.log(reason);
                res.status(403);

                return res.send();
            }

            const { body } = req;

            const payload = {
                trigger_id: body.trigger_id,
                channel: {
                    name: body.channel_name,
                    id: body.channel_id,
                },
                team: {
                    domain: body.team_domain,
                },
                message: {
                    user: body.user_id,
                },
                title: {
                    text: body.text,
                },
                user: {
                    username: body.user_name,
                }
            };

            await createModalAction(payload, config.slackApiToken, config.channelMap);

            res.status(200);
            return res.send();
        } catch (error) {
            console.error(error);

            res.status(500);
            return res.send('An error occurred, try again later')
        }
    });

    return app;
}

module.exports = createServer;
