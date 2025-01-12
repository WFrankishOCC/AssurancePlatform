# Deploying the Assurance Platform on Microsoft Azure Cloud

!!! info "Azure Deployment"

    The following procedure makes use of Docker, Azure Webapps, and Azure Database for Postgresql.
    These instructions make use of the Azure Portal.
    A future version will focus on scripted deployment, using either the Azure CLI, the Azure Python SDK, or Terraform.

## Database

!!! info "Instructions"

    Instructions based on those [here](https://docs.microsoft.com/en-us/azure/postgresql/quickstart-create-server-database-portal).

- In the [Azure portal](https://portal.azure.com) click "+ Create a New
  Resource", and select "Azure Database for PostgreSQL", and click "Create". A
  "Single Server" should be sufficient.
- Select your Subscription, Resource Group (creating one if desired), and
  Region, and then choose a "Server name", "Admin username", and "Password".
  Make sure you keep note of these!
- Configure a firewall rule to allow your local machine to connect to the
  database server: from the overview page of the Resource, click on "Connection
  Security" on the left sidebar, then click "+ Add current client IP address",
  and save. Also ensure that "Allow access to Azure services" is set to "Yes".
  You may also need to disable "Enforce SSL connection" to be able to connect
  via psql.
- Use `psql` to connect to Postgres, and create the "eap" database. For
  Mac/homebrew you should be able to install this via `brew install postgresql`.

```shell
psql --host=SERVER_NAME.postgres.database.azure.com --port=5432 --username=ADMIN_USERNAME@SERVER_NAME --dbname=postgres
postgres=> CREATE DATABASE eap;
postgres=> \c eap;
postgres=> \q
```

## Create backend docker image

This step can be skipped if you are using a GitHub Action to build the Docker
image, as is currently done for the `dev` and `main` branches.

- Install docker following instructions
  [here](https://docs.docker.com/engine/install/).
- Change to the `eap_backend/` directory.

```shell
docker build -t DOCKER_USERNAME/eap_backend:latest -f Dockerfile .
docker push DOCKER_USERNAME/eap_backend:latest
```

(in order to push to dockerhub, you will need to
[sign-up](https://hub.docker.com/signup) and do `docker login`.)

## Create backend webapp

- In the [Azure portal](https://portal.azure.com) click "+ Create a New
  Resource", and select "Web App".
- Choose your subscription, resource group (suggest you use the same as for the
  database), and choose a "Name" (this will be part of the URL, needs to be
  unique amongst Azure webapps). For "Publish", select "Docker Container" and
  "Linux".
- Set the region to be the same as for the database.
- Create a new App Service Plan if you don't already have one in the resource
  group, and for "Sku and size", I would suggest "B1".
- Proceed to the Docker tab, and set the container to the one you built and
  pushed in the previous step. Click "Apply" and "Review and create".
- Once the Webapp has been created, go to its summary page in the portal, and
  click on "Configuration" on the left sidebar, and add the following new
  settings (remember to save and restart the app once you're done):
  - WEBSITES_PORT=8000.
  - DBNAME=eap
  - DBHOST=NAME_OF_THE_DATABASE_YOU_JUST_CREATED.postgres.database.azure.com
  - DBUSER=NAME_OF_THE_DATABASE_USER_YOU_JUST_CREATED@NAME_OF_THE_DATABASE
  - DBPASSWORD=THE_PASSWORD_FOR_THE_USER_YOU_JUST_MADE
  - SUPERUSER_USERNAME=NAME_OF_THE_SUPERUSER_YOU_WANT_TO_CREATE
  - SUPERUSER_PASSWORD=THE_PASSWORD_FOR_THE_SUPERUSER_YOU_JUST_MADE
  - SUPERUSER_EMAIL=EMAIL_ADDRESS_FOR_THE_SUPERUSER_YOU_JUST_MADE
  - GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
  - GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
- Test that the backend is working (will take a few minutes to start up the
  first time) by going to
  https://BACKEND_WEBAPP_NAME.azurewebsites.net/api/cases, and you should get an
  empty list.
- You may also want to turn on Continuous deployment from the Deployment Center
  settings, to have Azure pull the latest container every time one is available.

## Create frontend docker image

This step can be skipped if you are using a github Action to build the Docker
image, as is currently done for the `dev` and `main` branches.

- Change to the `frontend` directory.
- Build and push the docker image:

```shell
docker build -t DOCKER_USERNAME/eap_frontend:latest --build-arg BASE_URL="https://BACKEND_WEBAPP_NAME.azurewebsites.net/api" -f Dockerfile .
docker push DOCKER_USERNAME/eap_frontend:latest
```

## Create frontend webapp

Follow exactly the same process as for the backend webapp, but when it comes to
adding settings in the "Configuration" page:

- No need to set the DBNAME etc. variables.
- set WEBSITES_PORT to 3000
- set REACT_APP_BASE_URL to https://BACKEND_WEBAPP_NAME.azurewebsites.net/api
- GITHUB_CLIENT_ID should be the same as for the backend webapp.
- GITHUB_REDIRECT_URI should be https://FRONTEND_WEBAPP_NAME/login

## Nearly there...

At this stage, the only thing standing in our way is CORS (Cross-Origin Resource
Sharing). To fix this, go back to the Configuration panel of the backend server,
where you previously set the port to be 8000, and create a new environment
variable "CORS_ORIGIN_WHITELIST" with the value
`http://localhost:3000,https://FRONTEND_WEBAPP_NAME.azurewebsites.net`.


!!! warning "Save"

    Remember to click save.

Then, under the "API" heading in the left sidebar, click on "CORS", tick the box
labelled "Enable Access-Control-Allow-Credentials", and put
`https://FRONTEND_WEBAPP_NAME.azurewebsites.net` into the "Allowed Origins" box.

Click "Save" here again, and restart the backend webapp from the "Overview"
page.

Wait a few seconds, then check the frontend website to see that everything
works.

## Accessing and Modifying the Django Admin Page

Django's built-in admin interface is a powerful tool to make changes to your database, including deleting content. Here's how to access and use it:

1. **Accessing the Admin Page**:
    - Navigate to `https://BACKEND_WEBAPP_NAME.azurewebsites.net/admin`. This is the default location for the Django admin site.
    - You will be prompted to login. Use the `SUPERUSER_USERNAME` and `SUPERUSER_PASSWORD` you set up previously.

2. **Navigating the Interface**:
    - Once logged in, you'll see a dashboard listing all the available models (database tables).
    - Clicking on a model will show you a list of all its entries.

3. **Modifying Content**:
    - To edit an entry, click on its name or the edit icon beside it.
    - To delete an entry, select the checkbox beside it and choose the "Delete" action from the dropdown at the bottom of the list. Confirm the deletion in the next screen.

4. **Logging Out**:
    - Always remember to log out after you're done making changes. You can do this by clicking the "Log out" link in the top right corner of the page.

!!! warning "Caution"
    Always be cautious when making changes in the admin interface, especially when deleting content. There's no undo button for deleted data!
