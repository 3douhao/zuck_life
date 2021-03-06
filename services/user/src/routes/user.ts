import joi from 'joi';

import Serializer from '../serializers';
import { IRequest, IUser } from '../interfaces';
import * as UserController from '../controllers/user';

export default function user(Router: Foxx.Router): Foxx.Router {
  Router.get('/', (req: IRequest, res: Foxx.Response): void => {
    const user: ArangoDB.Document<IUser> = UserController.currentUser(req);

    res.send(Serializer.serialize('users', user));
  });

  Router.get('/:username', (req: IRequest, res: Foxx.Response): void => {
    try {
      const { username } = req.pathParams;
      const user: ArangoDB.Document<IUser> = UserController.findUser(username);

      res.send(Serializer.serialize('users', user));
    } catch (error) {
      // Assuming a user with that username was not found
      res.throw('not found');
    }
  }).pathParam('username', joi.string().required(), 'username');

  Router.post('/follow', (req: IRequest, res: Foxx.Response): void => {
    try {
      const { username } = req.body;

      const user: ArangoDB.Document<IUser> = UserController.follow(
        username,
        req,
      );

      res.send(Serializer.serialize('users', user));
    } catch (error) {
      res.throw('not found', 'user not found', error);
    }
  })
    .body(
      joi
        .object({
          username: joi.string().required(),
        })
        .required(),
      'Username To Follow',
    )
    .description('Follows a user with the given username');

  return Router;
}
