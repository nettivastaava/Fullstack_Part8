const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Author = require('./mongo/models/author')
const Book = require('./mongo/models/book')
const User = require('./mongo/models/user')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')

const { PubSub } = require('apollo-server')
const pubsub = new PubSub()


const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

console.log('connecting to', config.MONGO_URL)

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
    allGenres: [String]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      born: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }    
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate("author")
      console.log('books, ', books)
      if (!args.author && !args.genre) {
        return books
      } else return books.filter(book => {
        const authorFilter = (book.author.name === args.author || args.author === undefined)
        const genreFilter = (book.genres.find(genre => genre === args.genre) || args.genre === undefined)
        return authorFilter && genreFilter
      })
    },
    allAuthors: () => {
      return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    allGenres: async () => {
      const books = await Book.find({})
      const genres = books.map(book => book.genres)
      .reduce((previous, current) => previous.concat(current))
      console.log('dup ', genres)
      const uniqueGenres = [...new Set(genres)];
      console.log('uniq ', uniqueGenres)
      return uniqueGenres
    }
    },
  Author: {
    name: (root) => root.name,
    born: (root) => root.born,
    bookCount: async (root) =>  {
      const author = await Author.findById(root.id)
      console.log(author)
      return author.bookCount
    },
    id: (root) => root.id
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")    
      }
      
      const author = await Author.findOne({ name: args.author })

      if (author) {
        const book = new Book({ 
          ...args,
          author: author,
        })
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        await Author.findOneAndUpdate(
          { name: args.author }, 
          { bookCount: author.bookCount + 1 })
          .catch(e => console.error(e))
        return book
      } else {
  
        const createdAuthor = new Author({ 
          name: args.author, 
          born: null, 
          bookCount: 1
        })
        try {
          await createdAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

        const book = new Book({ 
          ...args,
          author: createdAuthor,
        })
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        
        return book
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")    
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.born

      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: (root, args) => {
      const user = new User({ ...args })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      console.log('user', user)
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {    
    bookAdded: {      
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])    
    },  
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null    
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )      
      const currentUser = await User
        .findById(decodedToken.id)
        return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
