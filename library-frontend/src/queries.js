import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment bookDetails on Book {
    title
    published
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    id
    born
    bookCount
  }
}
`

export const ALL_BOOKS = gql`
query allBooksByGenre($genre: String) {
  allBooks(genre: $genre) {
    title
    published
    id
    genres
    author {
      name
    }
  }
}
`



export const ALL_GENRES = gql`
query {
  allGenres
}
`

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
    }
    published
    id
    genres
  }
}
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born)  {
      name
      born
      id
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...bookDetails
    }
  }
  
${BOOK_DETAILS}
`