import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "github",
      name: "GitHub",
      type: "oauth",
      version: "2.0",
      accessTokenUrl: "",
      profileUrl: "https://api.github.com/user",
      profile: (profile) => {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    },
  ],
};
