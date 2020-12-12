import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { useRegisterMutation } from '../generated/graphql';

// interface RegisterProps {}

export const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [register] = useRegisterMutation()

  return (
    <div>
      <div>Register</div>
      <div>
        <form onSubmit={async e => {
          e.preventDefault()
          console.log('form submitted')
          const response = await register({
            variables: {
              email,
              password
            }
          })

          history.push('/');
          console.log(response);
        }}>
          <div>
            <input type="email" placeholder="email" onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit">register</button>
        </form>
      </div>
    </div>
  );;
}
