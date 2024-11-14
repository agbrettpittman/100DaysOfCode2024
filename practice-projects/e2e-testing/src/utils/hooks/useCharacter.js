import { useEffect, useState, useRef, useCallback } from "react";
import { db } from '@utils/db'

export default function useCharacter(id){
    
    const [Character, setCharacter] = useState({})

    useEffect(() => {
        db.characters.get(Number(id)).then((result) => {
            setCharacter(result)
        })
    }, [id])

    function updateState(key, value){
        setCharacter((prev) => {
            return {
                ...prev,
                [key]: value
            }
        })
        db.characters.update(Number(id), {[key]: value})
    }

    return [Character, updateState]

}