import { useEffect, useState } from "react";
import { db } from '@utils/db'
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function useCharacter(id){
    
    const [Character, updateState] = useState({})
    const {id: routeId} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`/characters/${id}`).then((response) => {
            updateState(response.data)
        })
    }, [id])

    function setCharacter(key, value){
        let newCharacter = {...Character}
        newCharacter[key] = value
        axios.put(`/characters/${id}`, newCharacter).then( res => {
            updateState(res.data)
        })
    }

    function deleteCharacter(){
        axios.delete(`/characters/${id}`).then(() => {
            if (Number(routeId) === Number(id)){
                navigate('/')
            }
        })
    }

    return { Character, setCharacter, deleteCharacter }

}