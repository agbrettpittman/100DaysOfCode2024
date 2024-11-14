import { useParams } from "react-router-dom"
import { db } from '@utils/db'
import { useLiveQuery } from "dexie-react-hooks";

export default function CharacterEditPage({}){
    
    const { id } = useParams()

    async function getCharacter(){
        const foundCharacter = await db.characters.get(Number(id))
        console.log(foundCharacter)
    }

    return (
        <div>
            <h1>Edit Character</h1>
            <button onClick={getCharacter}>Get Character</button>
        </div>
    )

}