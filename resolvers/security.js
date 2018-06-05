import utils from '../utils';
import sendEmail from '../emailer';

export default {
    Query: {
        updateToken: async (parent, args, { models }) => {
            console.log('update token request');
            let userId = await utils.checkToken(args.token);
            if (userId) {
                //обновим payload для токена
                let User = models.User;

                let user;

                try {
                    user = await User.findOne({where: {id: userId}});
                    if (user){
                        let newToken = utils.signToken(user.get({plain: true}));
                        return({
                            ok: true,
                            message: 'token generated',
                            token: newToken
                        });
                    } else {
                        return({
                            ok: false,
                            message: 'no user found'
                        });
                    }
                } catch (e) {
                    return({
                        ok: false,
                        message: 'failed to find user'
                    });
                }
            } else {
                return({
                    ok: false,
                    message: 'invalid token'
                });
            }
        },
    },
    Mutation: {
        register: async (parent, args, { models }) => {
            console.log('register');
            const User = models.User;
            let onError = (user) => {
                //В любой непонятной ситуации удаляй юзера!
                user.destroy({force: true})
            };

            const token = utils.getUniqueString();
            const link = `${args.emailURL}${token}`;

            let newUser = {
                email: args.email,
                password: args.password,
                uniqueString: token,
            };

            let user;

            try {
                user = await User.create(newUser)
            } catch (e) {
                return({
                    ok: false,
                    message: 'create user error'
                });
            }

            const data = {
                to: 'iv.xromov@mail.ru',
                subject: 'Активация аккаунта', //'Nodemailer is unicode friendly ✔',
                text: `Для активации аккаунта перейдите по ссылке: ` + link, //'Hello to myself!',
                html: `<p>Для активации аккаунта перейдите по ссылке: </p><p><a href=${link}>link</a></p>`,
            };

            let emailSended;

            try {
                emailSended = await sendEmail(data);
            } catch (e){
                console.log(e);
                onError(user);
                return({
                    ok: false,
                    message: 'failed to send mail'
                });
            }

            if (emailSended) {
                let message = "Reg Successful";
                return({
                    ok: true,
                    message,
                });
            } else {
                onError(user);
                return({
                    ok: false,
                    message: 'failed to send mail'
                });
            }
        },
        confirmEmail: async (parent, args, { models }) => {
            const User = models.User;

            let user;

            try {
                user = await User.findOne({where: {uniqueString: args.confirmString}})
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed finding user',
                });
            }

            if (user){
                let updatedUser = {
                    uniqueString: null
                };

                try {
                    await User.update(updatedUser, {where: {uniqueString: args.confirmString}});
                    let token = utils.signToken(user.get({plain: true}));
                    return({
                        ok: true,
                        message: 'Login Successful',
                        token
                    });
                } catch (e) {
                    return({
                        ok: false,
                        message: 'Update user error',
                    });
                }

            } else {
                return({
                    ok: false,
                    message: 'Wrong confirmString value',
                });
            }
        },

        login: async (parent, args, { models }) => {
            const User = models.User;

            let user;

            try {
                user = await User.findOne({where: {email: args.email}})
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed finding user',
                });
            }

            if (user){
                user = user.get({plain: true});

                if (user.uniqueString) {
                    return({
                        ok: false,
                        message: 'Account is not confirmed or password reset in progress',
                    });
                } else {
                    if (user.password === args.password) {
                        let token = utils.signToken(user);
                        return({
                            ok: true,
                            message: 'Login Successful',
                            token
                        });
                    } else {
                        return({
                            ok: false,
                            message: 'Wrong Password',
                        });
                    }
                }
            } else {
                return({
                    ok: false,
                    message: 'User not found',
                });
            }
        },

        resetPassword: async (parent, args, { models }) => {
            const User = models.User;

            let user;

            try {
                user = await User.findOne({where: {uniqueString: args.resetString}})
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed finding user',
                });
            }

            if (user) {
                user = user.get({plain: true});
                let updatedUser = {
                    password: args.password,
                    uniqueString: null
                };

                try {
                    await User.update(updatedUser, {where: {uniqueString: args.resetString}})
                } catch(e){
                    return({
                        ok: false,
                        message: 'failed updating user',
                    });
                }

                let token = utils.signToken(user);

                return({
                    ok: true,
                    message: 'Password reset successful',
                    token
                });
            } else {
                return({
                    ok: false,
                    message: 'Wrong resetString value',
                });
            }
        },

        updatePassword: async (parent, args, { models }) => {
            const User = models.User;
            let userId = await utils.checkToken(args.token);

            if (userId) {
                let oldPassword = args.oldPassword;
                let newPassword = args.newPassword;

                let user;

                try {
                    user = await User.findOne({where: {id: userId}})
                } catch(e) {
                    return({
                        ok: false,
                        message: 'failed finding user',
                    });
                }

                let updatedUser;
                if (user){
                    user = user.get({plain: true});
                    updatedUser = {
                        password: newPassword
                    };
                } else {
                    return({
                        ok: false,
                        message: 'user not found'
                    });
                }

                if (oldPassword === user.password) {
                    try {
                        await User.update(updatedUser, {where: {id: userId}});
                    } catch (e) {
                        return({
                            ok: false,
                            message: 'failed updating user'
                        });
                    }

                    return({
                        ok: true,
                        message: 'Update Successfull'
                    });
                } else {
                    return({
                        ok: false,
                        message: 'wrong password'
                    });
                }
            } else {
                return({
                    ok: false,
                    message: 'invalid token'
                });
            }
        },

        recoverPassword: async (parent, args, { models }) => {
            const User = models.User;
            let email = args.email;

            if (!email) {
                return({
                    ok: false,
                    message: 'no email provided'
                });
            }

            const token = utils.getUniqueString();
            let link = `${args.emailURL}${token}`;//`${'http://localhost:3000/login/reset/'}${token}`;
            let data = {
                to: 'iv.xromov@mail.ru',
                subject: 'Восстановление пароля', //'Nodemailer is unicode friendly ✔',
                text: `Для восстановления пароля перейдите по ссылке: ` + link, //'Hello to myself!',
                html: `<p>Для восстановления пароля перейдите по ссылке: </p><p><a href=${link}>link</a></p>`,
            };

            let user;

            try {
                user = await User.findOne({where: {email: email}})
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed finding user'
                });
            }

            if (! user) {
                return({
                    ok: false,
                    message: 'no user with provided email'
                });
            } else {

            }

            try {
                await User.update({uniqueString: token}, {where: {email: email}})
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed updating user'
                });
            }


            let emailSended;
            try {
                emailSended = await sendEmail(data);
            } catch (e) {
                return({
                    ok: false,
                    message: 'failed sending email'
                });
            }

            if (emailSended) {
                return({
                    ok: true,
                    message: 'email sended successfully'
                });
            } else {
                return({
                    ok: false,
                    message: 'failed sending email'
                });
            }
        },
    }
}