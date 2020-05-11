const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { combineResolvers } = require("graphql-resolvers");

const User = require("../db/models/user");
const { isAuthenticated } = require("./middleware");

const resolvers = {
  Query: {
    users: combineResolvers(isAuthenticated, async () => await User.find()),
    user: combineResolvers(isAuthenticated, async (_, { id }) => {
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),
  },
  Mutation: {
    signup: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email });
        if (user) {
          throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(input.password, 12);
        const newUser = new User({ ...input, password: hashedPassword });
        const result = newUser.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          input.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Email or password is incorrect");
        }

        const secret = process.env.JWT_SECRET_KEY || "mysecretkey";
        const token = jwt.sign({ email: user.email }, secret, {
          expiresIn: "1d",
        });
        return { token };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = resolvers;
