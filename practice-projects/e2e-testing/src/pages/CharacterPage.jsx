import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { db } from '@utils/db'
import moment from 'moment'

export default function CharacterPage() {
    const { id } = useParams()

    const [Character, setCharacter] = useState({})

    useEffect(() => {
        getCharacter()
    }, [id])

    async function getCharacter() {
        const foundCharacter = await db.characters.get(Number(id))
        setCharacter({
            ...foundCharacter,
            creationDate: moment(foundCharacter.creationDate).format('MMMM Do YYYY, h:mm:ss a')
        })
    }

    return (
        <div>
            <h1>{Character.name}</h1>
            <p class="creationDate">{Character.creationDate}</p>
        </div>
    )
}