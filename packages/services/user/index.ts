import { env } from "../env";
import { createGoogleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "./model";

class UserService {
  public async getAuthenticationMethods(): Promise<
    GetAuthenticationMethodOutputSchema[]
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(
      env.GOOGLE_OAUTH_CLIENT_ID &&
      env.GOOGLE_OAUTH_CLIENT_SECRET &&
      env.GOOGLE_OAUTH_REDIRECT_URI
    );

    if (isGoogleConfigured) {
      const googleOAuth2Client = createGoogleOAuth2Client();
      const url = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "select_account",
        scope: ["openid", "email", "profile"],
      });
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }
}

export default UserService;
