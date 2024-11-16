import { useEffect, useState, useRef, useCallback } from "react";
import { db } from '@utils/db'

export default function useCharacter(id){
    
    const [Character, updateState] = useState({})

    useEffect(() => {
        db.characters.get(Number(id)).then((result) => {
            updateState(result)
        })
    }, [id])

    function setCharacter(key, value){
        updateState((prev) => {
            return {
                ...prev,
                [key]: value
            }
        })
        db.characters.update(Number(id), {[key]: value})
    }

    return { Character, setCharacter }

}