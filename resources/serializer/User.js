module.exports = {
  "payment_account_exists" : ["get_auth_user_info"],
  "id" : ["get_auth_user_info"],
  "email" : ["get_auth_user_info"],
  "username" : ["get_auth_user_info"],
  "status" : ["get_auth_user_info"],
  "created" : ["get_auth_user_info"],
  "roles" : {
      "id" : ["get_auth_user_info"],
      "name" : ["get_auth_user_info"],
      "role" : ["get_auth_user_info"]
  },
  "profile" : {
      "first_name" : ["get_auth_user_info"],
      "last_name" : ["get_auth_user_info"],
      "url_photo_small" : ["get_auth_user_info"]
  },
  "access_token" : {
      "access_token" : ["get_auth_user_info"],
      "expires_in" : ["get_auth_user_info"],
      "expires_at" : ["get_auth_user_info"],
      "token_type" : ["get_auth_user_info"],
      "refresh_token" : ["get_auth_user_info"]
  }
}