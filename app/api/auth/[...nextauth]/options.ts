import Auth0Provider from "next-auth/providers/auth0";
export const options = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: "https://dev-ru0lboqi.us.auth0.com",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      var roles: string[] = []
      if (profile) {
        roles = profile['cronuseo/roles']? profile['cronuseo/roles'] as string[] : []
      }
      const body = {
        identifier: user.id,
        username: user.email,
        roles: roles
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CRONUSEO_MGT_API_BASE!}/api/v1/o/super/users/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              API_KEY: process.env.CRONUSEO_API_KEY!,
              Authorization: `Bearer ${account.id_token}`,
            },
            body: JSON.stringify(body),
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          account.organization_id = data.organization_id;
          return true;
        } else {
          // Handle errors
          console.error("Error with status code:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      return false;
    },
    async jwt({ token, account, profile }: any) {
      if (profile) {
        token.id = profile.sub;
      }
      if (account) {
        token.id_token = account.id_token
        token.organization_id = account.organization_id
      }
      return token;
    },
    async session({ session, token, user }: any) {
      session.user.id = token.id;
      session.id_token = token.id_token
      session.user.organization_id = token.organization_id
      return session;
    },
  },
};
