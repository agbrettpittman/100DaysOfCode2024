import { useEffect, useState } from "react";
import { db } from '@utils/db'
import { useNavigate, useParams } from "react-router-dom";

export default function useCharacter(id){
    
    const [Character, updateState] = useState({})
    const {id: routeId} = useParams()
    const navigate = useNavigate()

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

    function deleteCharacter(){
        db.characters.delete(Number(id))
        if (Number(routeId) === Number(id)){
            navigate('/')
        }
    }

    return { Character, setCharacter, deleteCharacter }

}