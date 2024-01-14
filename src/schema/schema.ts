import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import blogModel from "../models/blog.model";
import commentModel from "../models/comment.model";
import userModel from "../models/user.model";

export const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    blogs: {
      type: new GraphQLList(BlogType),
      async resolve(parent) {
        return await blogModel.find({ user: parent.id });
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent) {
        return await commentModel.find({ user: parent.id });
      },
    },
  }),
});

export const BlogType = new GraphQLObjectType({
  name: "Blog",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    content: {
      type: GraphQLString,
    },
    date: { type: GraphQLString },
    user: {
      type: UserType,
      async resolve(parent) {
        return await userModel.findById(parent.user);
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent) {
        return await commentModel.find({ blog: parent.id });
      },
    },
  }),
});

export const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) },
    user: {
      type: UserType,
      async resolve(parent) {
        return await userModel.findById(parent.id);
      },
    },
    blog: {
      type: BlogType,
      async resolve(parent) {
        return await blogModel.findById(parent.id);
      },
    },
  }),
});
