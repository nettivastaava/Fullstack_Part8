import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { ME } from '../queries'

const Recommendations = (props) => {
  const userData = useQuery(ME)

  if (userData.loading) {
    return <div>loading...</div>
  }
    
  if (!props.show) {
    return null
  }
  const user = userData.data.me

  let books = props.books
  console.log('fav genre: ', user)
  console.log('books: ', books)

  books = books.filter(b => b.genres.includes(user.favoriteGenre))

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre patterns</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations