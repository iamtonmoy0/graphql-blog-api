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
import { Document, startSession } from "mongoose";
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
        return await Comment.find().populate("blog").populate("user");
      },
    },
  },
});

const mutations = new GraphQLObjectType({
  name: "mutations",
  fields: {
    // register
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
    // login
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
    // create blog
    addBlog: {
      type: BlogType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        user: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, { title, content, date, user }) {
        const session = await startSession();
        try {
          session.startTransaction();
          const existUser = await User.findById(user);
          if (!existUser) return new Error("User Does not exist");
          const blog = await Blog.create({ title, content, date, user });
          existUser.blogs.push(blog._id);
          await existUser.save({ session });
          return blog;
        } catch (error) {
          return new Error(error);
        } finally {
          await session.commitTransaction();
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
        const session = await startSession();
        try {
          // TODO: need to work on that
          session.startTransaction();
          const res = await Blog.findById(id).populate("user");
          console.log(res);
          if (!res) return new Error("Blog does not exist");
          const user = res.user;
          user.blogs.pull(id);
          await user.save({ session });
          return await res.deleteOne({ session });
        } catch (error) {
          return new Error(error.message);
        } finally {
          session.commitTransaction();
        }
      },
    },
    // add comment
    addComment: {
      type: CommentType,
      args: {
        blog: { type: new GraphQLNonNull(GraphQLID) },
        user: { type: new GraphQLNonNull(GraphQLID) },
        text: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { user, blog, text, date }) {
        const session = await startSession();
        try {
          session.startTransaction();
          // find blog and user
          const existBlog = await Blog.findById(blog);
          const existUser = await User.findById(user);
          if (!existBlog || !existUser) {
            return new Error("Blog and User not exist");
          }
          const comment = await Comment.create(
            { text, date, user, blog },
            { new: true }
          ).populate("user")
          console.log(comment);
          existUser.comments.push(comment._id);
          existBlog.comments.push(comment._id);
          await existBlog.save({ session });
          await existUser.save({ session });
          return comment;
        } catch (error) {
          return new Error(error.message);
        } finally {
          session.commitTransaction();
        }
      },
    },
  },
});

export default new GraphQLSchema({ query: RootQuery, mutation: mutations });
