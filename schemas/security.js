//import { GraphQLObjectType  } from 'graphql'
export default `

type Response {
  ok: Boolean!
  message: String
  token: String
}

type Query {
  updateToken(token: String!): Response
}

type Mutation {
  register(email: String!, password: String!, emailURL: String): Response
  confirmEmail(confirmString: String!): Response
  login(email: String!, password: String!): Response
  resetPassword(resetString: String!, password: String!): Response
  updatePassword(oldPassword: String!, newPassword: String!, token: String!): Response
  recoverPassword(email: String!, emailURL: String): Response
}`