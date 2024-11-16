import { useParams } from "react-router-dom"
import useCharacter from "@utils/hooks/useCharacter";
import TextField from '@mui/material/TextField';

export default function CharacterEditPage({}){
    
    const { id } = useParams()

    const {Character, setCharacter} = useCharacter(id)

    return (
        <div>
            <TextField
                label="Character Name"
                value={Character.name || ''}
                onChange={(e) => setCharacter("name", e.target.value)}
                variant="outlined"
                fullWidth
            />

        </div>
    )

}