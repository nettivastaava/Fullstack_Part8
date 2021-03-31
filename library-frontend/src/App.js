import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import { ALL_BOOKS, ALL_AUTHORS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const authorResult = useQuery(ALL_AUTHORS)
  const bookResult = useQuery(ALL_BOOKS)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const [errorMessage, setErrorMessage] = useState(null)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('login')
  }

  if (bookResult.loading || authorResult.loading)  {
    return <div>loading...</div>
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        <Authors
          show={page === 'authors'} authors={authorResult.data.allAuthors} token={token}
        />
        <Books
          show={page === 'books'} books={bookResult.data.allBooks}
        />
        <LoginForm
            setToken={setToken}
            setError={notify}
            show={page === 'login'}
            setPage={setPage}
        />
      </div>
    )
  }

  return(
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={()=> setPage('recommend')}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>
      <Authors
        show={page === 'authors'} authors={authorResult.data.allAuthors} token={token}
      />
      <Books
        show={page === 'books'}
      />
      <NewBook
        show={page === 'add'}
      />
      <Recommendations
        show={page === 'recommend'} books={bookResult.data.allBooks}
      />
    </div>
  )
}

export default App