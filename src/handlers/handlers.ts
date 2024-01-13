import { GraphQLList, GraphQLObjectType, GraphQLSchema } from "graphql";
import { BlogType, CommentType, UserType } from "../schema/schema";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import Comment from "../models/comment.model";

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
})

export default new GraphQLSchema({query:RootQuery})