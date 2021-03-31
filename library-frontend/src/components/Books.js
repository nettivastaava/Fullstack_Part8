import { useQuery, useLazyQuery } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { ALL_GENRES, ALL_BOOKS } from '../queries'

const Books = (props) => {
  const genresResult = useQuery(ALL_GENRES)
  const [getBooks, result] = useLazyQuery(ALL_BOOKS)
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])


  useEffect(() => {
    if (genresResult.data) {
      setGenres(genresResult.data.allGenres)
      getBooks()
    }
  }, [genresResult, getBooks])

  useEffect(() => {    
    if (result.data) {      
      setBooks(result.data.allBooks)    
    }  
  }, [result])

  if (genresResult.loading)  {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const showGenre = (genre) => {    
    getBooks({ variables: { genre: genre } })  
    
    if (!genre) {
      setGenre('')
    } else {
      setGenre(genre)
    }
  }

  return (
    <div>
      <h2>books</h2>
      
      <div>
        {genres.map(g => 
          <button onClick={() => showGenre(g)}>{g}</button>
        )}
        <button onClick={() => showGenre('')}>all genres</button>
      </div>
      <p>in genre patterns</p>
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

export default Books