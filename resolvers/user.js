import utils from '../utils';

export default {
    Query: {
        getUser: (parent, {id}, { models }) => {
            return models.User.findOne({where: {id: id}}).then(user => {
                return user
            })
        },
    },
    Mutation: {
        updateProfile: async (parent, args, { models }) => {
            const User = models.User;

            let userId = await utils.checkToken(args.token);
            if (userId) {
                try {
                    await User.update(args.user, {where: {id: userId}})
                } catch (e) {
                    return({
                        ok: false,
                        message: 'failed updating user'
                    });
                }

                return({
                    ok: true,
                    message: 'update succeed',
                });

            } else {
                return({
                    ok: false,
                    message: 'invalid token'
                });
            }
        },
    }
}