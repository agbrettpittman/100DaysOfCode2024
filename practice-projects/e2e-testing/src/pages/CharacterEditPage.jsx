import { useParams } from "react-router-dom"
import useCharacter from "@utils/hooks/useCharacter";
import TextField from '@mui/material/TextField';

export default function CharacterEditPage({}){
    
    const { id } = useParams()

    const {Character, setCharacter} = useCharacter(id)

    function updateCharacter(event) {
        setCharacter(event.target.name, event.target.value)
    }

    return (
        <div>
            <TextField
                label="Character Name"
                value={Character.name || ''}
                name="name"
                onChange={updateCharacter}
                variant="outlined"
                fullWidth
            />

        </div>
    )

}