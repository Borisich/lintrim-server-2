export default `
type User {
  id: Int!
  email: String
  firstName: String
  lastName: String
  phone: String
  password: String
}


type Query {
  getUser(id: Int!): User
  getAllUsers: [User!]
  world: String
}

type Mutation {
  updateProfile(user: String, token: String!): Response
}`