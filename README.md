# Crowdin Notifications API

The Crowdin Notifications API is a standalone serverless function we are using to provide notification features to the [Organized app](https://github.com/sws2apps/organized-app). So if you see that it could also help you with your use case, here’s how it works.

## Step 1: Setup Crowdin project

- Create a project on [Crowdin](https://crowdin.com).

  > Please note it should not be necessary to create a new project if you already have one.

- Create an access token token for Crowdin. These are the only required scopes for the token:

  | Scope                              | Access    |
  | ---------------------------------- | --------- |
  | Projects (List, Get, Create, Edit) | Read only |
  | Translation status                 | Read only |
  | Source files & strings             | Read only |
  | Translations                       | Read only |

- Get the `fileId` of the file you want this API to access.

## Step 2: Create the environment variables

Here are the list of environment variables used by the API:

| Variable                           | Description                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CROWDIN_API_KEY                    | Crowdin API key that can access the project                                                                                            |
| CROWDIN_PROJECT_ID                 | Crowdin Project ID                                                                                                                     |
| CROWDIN_FILE_ID                    | The `fileId` of the file you want to access                                                                                            |
| API_DELAY_TIME <em>(optional)</em> | By default the sources texts on Crowdin will only be available 60 minutes after their creation. Provide a value in minutes to override |

Deploy the API in any platform that supports serverlesss once everything is ready.

## Step 3: Create the strings on Crowdin

- Create source identifier of this format in Crowdin: `YYYYMMDD-XX-title` (eg: `20240827-01-title`).
- Adjust the context of the title string to include any roles that are valid for the notifications. If it is for every users, then set the context to `public`. Separate multiple roles by a comma.
- Create the corresponding body text of this format: `YYYYMMDD-XX-body` (eg: `20240827-01-body`).

  > The two corresponding keys must exist before the API can pick it

- If necessary, provide the needed translations for any languages your applications or services support.

## Step 4: Fetch the notifications

- Access your API in this url `${your-api-host}/:language`, where `language` is the Crowding `threLettersCode` language you want to fetch.
- You will receive a JSON response like the following:

  ```json
  [
    {
      "id": 45738,
      "updatedAt": "2024-08-27T14:29:17.000Z",
      "title": "Test title 1",
      "body": "Body test 1"
    },
    {
      "id": 45744,
      "updatedAt": "2024-08-27T14:29:28.000Z",
      "title": "Test title 2",
      "body": "Body test 2"
    }
  ]
  ```
