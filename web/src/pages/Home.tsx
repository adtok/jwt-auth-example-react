import React from 'react';
import { useUsersQuery } from '../generated/graphql';

interface HomeProps {}

export const Home: React.FC<HomeProps> = () => {
  const { data, loading } = useUsersQuery({ fetchPolicy: 'network-only' });

  if (loading || !data) {
    return <div>Home page</div>;
  }

  return (
    <div>
      <div>users:</div>
      <ul>{data.users.map(x => (<li key={x.id}>{x.email}, {x.id}</li>))}</ul>
    </div>
  );
};
