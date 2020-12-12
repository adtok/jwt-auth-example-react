import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useLoginMutation, MeDocument, MeQuery } from "../generated/graphql";
import { getAccessToken, setAccessToken } from "../accessToken";

// interface LoginProps {}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation({});

  return (
    <div>
      <div>Login</div>
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await login({
                variables: {
                  email,
                  password,
                },
                update: (store, { data }) => {
                  if (!data) return null;

                  store.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                      me: data.login.user,
                    },
                  });
                },
              });
              console.log(response);

              if (response && response.data) {
                setAccessToken(response.data.login.accessToken);
                console.log(getAccessToken());
              }
            } catch (error) {
              console.log(error);
            }

            history.push("/");
          }}
        >
          <div>
            <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};
