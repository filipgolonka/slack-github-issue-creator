const { graphql } = require('@octokit/graphql');

const createIssueQuery = `mutation createIssue($repository: ID!, $title: String!, $description: String) {
  createIssue(input: {repositoryId: $repository, title: $title, body: $description}) {
    issue {
      title,
      body,
      url
    }
  }
}`;

const findRepositoryQuery = `query findRepository($name: String!) {
  search(first: 10, type: REPOSITORY, query: $name) {
    edges {
      node {
        ... on Repository {
          nameWithOwner,
          id
        }
      }
    }
  }
}`;

const GithubClient = (config, graphqlFetcher = graphql) => {
    const graphqlQuery = (query, variables = {}) =>
        graphqlFetcher({
            query,
            ...variables,
            baseUrl: config.baseUrl,
            headers: {
                authorization: `token ${config.token}`,
            },
        });

    const createIssue = async ({ repository, title, description}) => {
        return await graphqlQuery(createIssueQuery, {
            repository,
            title,
            description,
        });
    };

    const findRepository = async ({ name }) => {
        return await graphqlQuery(findRepositoryQuery, { name });
    };

    return {
        createIssue,
        findRepository,
    };
};

module.exports = { GithubClient };
