# I am using manual commands for the initial setup. I know ai can do this, and it is true that I am using AI like claude and gemini for brainstorming. It is just that, if I don't manual input the commands, what's the point of my brain if I forget?

Commands Used:
# installing api for the rest. I prefer using react with inertai though, but since this will be paired with next, we should use next. And the assessment is REST api anyway
php artisan install:api 

# artisan commands
php artisan make:controller Api/ProjectController --resource
php artisan make:model Project
php artisan make:migration --model=Project
php artisan make:seeder ProjectSeeder
php artisan make:factory ProjectFactory
php artisan make:policy ProjectPolicy
php artisan make:request StoreProjectRequest
php artisan make:request UpdateProjectRequest
php artisan make:enum Enum/ProjectPriorityEnum
php artisan make:enum Enum/ProjectStatusEnum

# installing passport
composer require laravel/passport
php artisan vendor:publish --tag=passport-migrations
php artisan migrate
php artisan passport:client --password
php artisan passport:client --personal


# installing sail
composer require laravel/sail --dev
php artisan install:sail
./vendor/bin/sail up -d

Hmm policy is kinda useless for now. My initial thought would be adding what I've done in another project with the wild card permission in Policy and also in form request. But that would mean I need roles and permissions. Implementing Roles and Permissions would be a lot more taxing.

# We'll be using next js
## Frontend
pnpm create next-app@latest my-app --yes
for the ui, this would heavily rely on AI except for the integration. this will hurt a lot in tokens. following koda theme

setting multiple components and one page for app router. layout should be default

adding the docker compose. referencing my old setups in 2 projects

checking with ai if requirements have been met

shrink-0? first time I've used this.

let ai handle with the project list symmetry

ssh to server

adding .env.production environmental variables based on the example. Both folder should be included

the traefik is already automatic since this will be on my self-hosted server

I'm sorry if there's a power outage, this site will be gone

I was planning to add oauth, but it is not worth it. If I was learning how, it would've been implemented

holy, laravel deployment has a lot of permission errors

psql -u postgres -d koda -c "ALTER SCHEMA public OWNER to humfurie;

damn, so it needs to manually create table first? then alter it later?