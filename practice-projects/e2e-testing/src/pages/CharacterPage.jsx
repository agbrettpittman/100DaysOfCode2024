import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { db } from '@utils/db'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'

export default function CharacterPage() {
    const { id } = useParams()

    const [Character, setCharacter] = useCharacter(id)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')

    return (
        <div>
            <h1>{Character.name}</h1>
            <p class="creationDate">{DisplayCreation}</p>
        </div>
    )
}