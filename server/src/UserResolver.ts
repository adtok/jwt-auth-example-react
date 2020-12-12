import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from './entities/User';
import { hash, compare } from 'bcrypt';
import { MyContext } from './MyContext';
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!';
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(
    @Ctx() { payload }: MyContext
  ) {
    console.log(payload)
    return `your user id is ${payload!.userId}`
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true})
  async me(
    @Ctx() context: MyContext,
  ) {
    const authorization = context.req.headers['authorization']

    if (!authorization) return null;

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
      context.payload = payload as any;
      return await User.findOne(payload.userId)
    } catch (err) {
      console.log(err)
      return null;
    }
    return null;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext){
    sendRefreshToken(res, '');

    return true;
  }

  // dont actually use this in a public api
  // call in a forgot password method or something normally
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(
    @Arg('userId', () => Int) userId: number
  ) {
    await getConnection()
      .getRepository(User)
      .increment({id: userId}, 'tokenVersion', 1);

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() { res }: MyContext): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('could not find user');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error('incorrect password');
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async register(@Arg('email') email: string, @Arg('password') password: string) {
    const passwordHash = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: passwordHash,
      });
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }
}
