# Oauth2
Oauth2 server with NodeJS and Postgres
For running auth server you must create postgres table "user" with fields "id","salt","password"
Rules for salt and passwords must be equals rules in encodePassword method in services/user.js

1. azubu_dump.sql contains the necessary dump

2. All settings you can find in config/config.json and config/parameters.json

3. Than you must run npm install

4. After configuration you must run createDb.js (node createDb.js) for creating tables in mongodb

5. node bin/server.js will run oauth server

This server provide authorization via oauth2 with connecting postgres database

Main idea that auth server provide authorization via oauth2 and returns access_token
and main server (for example which was written via Symfony2) can accept requests with that access_token.

Also auth server can write information about login/registration into metric tables.

In that way, main server will not have high load during login.
 

Request examples:
POST/GET  /oauth/token
<pre>
client-password
{
    "grant_type":"password",
    "client_id":"1_31y1ntqa27cw4g44o04sckcww44w0gsw804wco0kkgwkcoog40",
    "client_secret":"1gaizro7v45c4woss4k4s8cwgw0cwk4gk4og8cg8ws8owg8c0c",
    "username":"pololome",
    "password":"testtest"
}
client_credentials
{
	"grant_type":"client_credentials",
	"client_id":"1_31y1ntqa27cw4g44o04sckcww44w0gsw804wco0kkgwkcoog40",
    "client_secret":"1gaizro7v45c4woss4k4s8cwgw0cwk4gk4og8cg8ws8owg8c0c",
}
refresh-token
{
    "grant_type":"refresh_token",
    "client_id":"azubu_desktop",
    "client_secret":"dfjhvsbh3jh21d",
    "refresh_token":"40436a49bdbc5f5c2c0e383756b8863de4854ce7712523e220e4fd4df98beaf6"
}
</pre>
Also you can send request to /metric/registration with access_token for writing metric registration info