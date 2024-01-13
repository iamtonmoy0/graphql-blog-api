import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { BlogType, CommentType, UserType } from "../schema/schema";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import Comment from "../models/comment.model";
import { Document } from "mongoose";
import { hashPassword } from "../utils/passwordHash";

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

const mutations=new GraphQLObjectType({
	name:"mutations",
	fields:{
		signup:{
			type:UserType,
			args:{
				name:{type:new GraphQLNonNull(GraphQLString)},
				email:{type:new GraphQLNonNull(GraphQLString)},
				password:{type:new GraphQLNonNull(GraphQLString)},
			},
			async resolve(parent,{name,email,password}){
				let existingUser:Document<any,any,any>
				try {
					existingUser=await User.findOne({email:email})
					if(existingUser)return new Error("User already exist!")
					const hashPass=await hashPassword(password)
					const user=await User.create({name,email,password:hashPass})
					return user
				} catch (error) {
					return new Error("Sign up failed .Try again!")
				}
			}
		}

	}
})

export default new GraphQLSchema({query:RootQuery})