import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { BlogType, CommentType, UserType } from "../schema/schema";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import Comment from "../models/comment.model";
import { Document } from "mongoose";
import { hashPassword, verifyPassHash } from "../utils/passwordHash";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    // get all user
    users: {
      type: new GraphQLList(UserType),
      async resolve() {
        return await User.find();
      },
    },
    //get all blog
    blogs: {
      type: new GraphQLList(BlogType),
      async resolve() {
        return await Blog.find();
      },
    },
    //   get all comments
    comments: {
      type: new GraphQLList(CommentType),
      async resolve() {
        return await Comment.find();
      },
    },
  },
});

const mutations = new GraphQLObjectType({
  name: "mutations",
  fields: {
    signup: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { name, email, password }) {
        let existingUser: Document<any, any, any>;
        try {
          existingUser = await User.findOne({ email: email });
          if (existingUser) return new Error("User already exist!");
          const hashPass = await hashPassword(password);
          const user = await User.create({ name, email, password: hashPass });
          return user;
        } catch (error) {
          return new Error("Sign up failed .Try again!");
        }
      },
    },
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { email, password }) {
        try {
          let user = await User.findOne({ email });
          if (!user) return new Error("user not exist");
          const isMatched = await verifyPassHash(password, user.password);
          if (!isMatched) return new Error("Wrong password");
          return user;
        } catch (error) {
          return new Error(error.message);
        }
      },
    },
    addBlog: {
      type: BlogType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { title, content, date }) {
        try {
          const blog = await Blog.create({ title, content, date });
          return blog;
        } catch (error) {
          return new Error(error);
        }
      },
    },
    // update blog
    updateBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { id, title, content }) {
        try {
          const blog = await Blog.findById(id);
          if (!blog) {
            throw new Error("The blog does not exist");
          }
          return Blog.findByIdAndUpdate(id, { title, content }, { new: true });
        } catch (error) {
          return new Error(error);
        }
      },
    },
    // delete blog
    removeBlog: {
      type: BlogType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, { id }) {
        try {
          const res = await Blog.findByIdAndDelete(id);
          return res;
        } catch (error) {
          return new Error(error.message);
        }
      },
    },
  },
});

export default new GraphQLSchema({ query: RootQuery, mutation: mutations });
