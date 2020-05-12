const Project = require("../db/models/project");
const User = require("../db/models/user");

const resolvers = {
  Query: {
    project: async (_, { id }) => {
      const project = await Project.findOne({ _id: id });
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      return project;
    },
    projects: async () => {
      return await Project.find();
    },
  },
  Mutation: {
    createProject: async (_, { input }) => {
      try {
        const newProject = new Project({ ...input });
        const result = await newProject.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateProject: async (_, { id, input }) => {
      try {
        const project = await Project.findOneAndUpdate(
          { _id: id },
          { ...input },
          { new: true }
        );
        return project;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    addUserToProject: async (_, { id, input }) => {
      try {
        const project = await User.findOne({ _id: id });
        const user = await Project.findOne({ _id: input.user });
        if (!user || !project) {
          throw new Error(
            `Project with id: ${id} or user with id: ${input.user} could not be found`
          );
        }

        user.projects.push(id);
        project.users.push(input.user);
        await user.save();
        return await project.save();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Project: {
    users: async ({ users }) => {
      const usersRes = await User.find({ _id: { $in: users } });
      return usersRes || [];
    },
  },
};

module.exports = resolvers;
