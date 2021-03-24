import { gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'
import Select from 'react-select';


const options = [
  { value: 'String', label: 'Robert Martin' },
  { value: 'String', label: 'Martin Fowler' },
  { value: 'String', label: 'Fyodor Dostoevsky' },
  { value: 'String', label: 'Joshua Kerievsky' },
  { value: 'String', label: 'Sandi Metz' }
];



const Authors = (props) => {
  const [option, setOption] = useState(null)
  const [yearBorn, setYearBorn] = useState('')
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]  })


  if (!props.show) {
    return null
  }
  const authors = props.authors

  const submit = async (event) => {
    event.preventDefault()

    var born = parseInt(yearBorn)
    var name = option.label

    editAuthor({ variables: { name, born } })
    
    setYearBorn('')

  }

  

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            defaultValue={option}
            onChange={setOption}
            options={options}
          />  
        </div>
        <div>
          born
          <input
            type='number'
            value={yearBorn}
            onChange={({ target }) => setYearBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors