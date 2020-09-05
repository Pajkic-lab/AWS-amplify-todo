import React, { useState, useEffect } from 'react';
import { withAuthenticator } from 'aws-amplify-react'
import { API, graphqlOperation } from 'aws-amplify'
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

function App() {

  const [formData, setFormData] = useState({
    idd:'',
    note: '',
    notes: []
  })

  const { notes, note, idd } = formData

  const onChange = e => {setFormData({
    ...formData, 
    [e.target.name]: e.target.value
  })}

  const onSubmit = async e => {
    e.preventDefault()
    if(idd===''){
      const input = { note }
      const result = await API.graphql(graphqlOperation(createNote, { input }))
      const newNote = result.data.createNote
      setFormData({...formData, notes: [...notes, newNote], note:'', idd: '' })
    } else {
      const input = { id: idd, note }
      const result = await API.graphql(graphqlOperation(updateNote, { input }))
      const upNote = result.data.updateNote
      const index = notes.findIndex(note=> note.id === upNote.id)
      const updateNotes = [ ...notes.slice(0, index), upNote, ...notes.slice(index+1) ]
      setFormData({...formData, notes: updateNotes, note:'', idd: '' })
    }
  }

  useEffect( () => {
    async function fetchData() {
      const result = await API.graphql(graphqlOperation(listNotes))    
      setFormData({...formData, notes: notes.concat(result.data.listNotes.items), note:'' })   
    }
    fetchData();
  }, [])

  const onDelete = async id => {
    const input = { id }
    const result = await API.graphql(graphqlOperation(deleteNote, { input }))
    const deletetNoteId = result.data.deleteNote.id
    setFormData({...formData, notes: notes.filter(el=> el.id!==deletetNoteId)})
  }

  const onUpdate = (id, text)=> {
    setFormData({...formData, note: text, idd: id})
  }

  return (
    <div className="App">
      <h1>Amplify Todo</h1>
      <form onSubmit={onSubmit} >
        <input onChange={onChange} name='note' value={note} type='text' placeholder='write note' />
        <button type='submit' >{idd!==''? 'update' : 'submit'}</button>
      </form>

      <div>
        {notes.length>0? notes.map(el=> <div key={el.id} >
          <ul>
          <li onClick={()=>onUpdate(el.id, el.note)}>{el.note}</li>
          </ul>
          <button onClick={()=>onDelete(el.id)}>x</button>
          <hr/>
           </div> 
        ) : <h1>no todos</h1>}
      </div>
    </div>
  );
}

export default withAuthenticator(App, {includeGreetings: true});
