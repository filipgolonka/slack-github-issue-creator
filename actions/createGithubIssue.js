const got = require('got');

const createGithubIssue = async (githubClient, payload) => {
    const {
        response_urls,
        view: {
            state: {
                values,
            },
        },
    } = payload;

    const {
        repository: {
            repository: {
                selected_option: {
                    value: repository
                },
            },
        },
        title: {
            title: {
                value: title,
            },
        },
        description: {
            description: {
                value: description,
            },
        },
    } = values;

    const githubResponse = await githubClient.createIssue({
        repository,
        title,
        description,
    });

    await got.post(response_urls[0].response_url, {
        json: {
            text: `The issue has been created! Url: ${githubResponse.createIssue.issue.url}`,
        },
    });
};

module.exports = createGithubIssue;
