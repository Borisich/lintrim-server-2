import koa from 'koa';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import koaBody from 'koa-bodyparser';
import koaRouter from 'koa-router';
import { makeExecutableSchema } from 'graphql-tools';
import cors1 from 'koa2-cors';
import cors from '@koa/cors';
import cors2 from 'koa-cors';

import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

import models from './models';

const typeDefs =  mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers =  mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

let schema = makeExecutableSchema({typeDefs, resolvers});
const app = new koa();
const router = new koaRouter();
const PORT = 8081;

const koaOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    allowMethods: ['GET, POST, OPTIONS, PUT, PATCH, DELETE'],
    allowHeaders: ['X-Requested-With, Content-Type, x-access-token']
};

const qraphqlEndpoint = '/graphql';

// koaBody is needed just for POST.
router.post(qraphqlEndpoint, koaBody(), graphqlKoa({ schema, context: { models } }));
router.get(qraphqlEndpoint, graphqlKoa({ schema, context: { models } }));
router.get('/graphiql', graphiqlKoa({ endpointURL: qraphqlEndpoint }));

app.use(router.routes());
app.use(router.allowedMethods());
//app.use(cors2(koaOptions));

models.sequelize.sync({force: false}).then(() => {
    console.log('connected to DB');
    app.listen(PORT);
})
