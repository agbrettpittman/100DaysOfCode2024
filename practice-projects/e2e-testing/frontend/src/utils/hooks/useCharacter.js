import { useEffect, useState, useContext } from "react";
import { db } from '@utils/db'
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/App";

export default function useCharacter(id){
    
    const [Character, updateState] = useState({})
    const {id: routeId} = useParams()
    const navigate = useNavigate()
    const { getCharacterList } = useContext(AppContext)

    useEffect(() => {
        axios.get(`/characters/${id}`).then((response) => {
            updateState(response.data)
        })
    }, [id])

    function setCharacter(key, value){
        updateState((prevState) => {
            return {
                ...prevState,
                [key]: value
            }
        })
    }

    function saveCharacter(){
        axios.put(`/characters/${id}`, Character).then(() => {
            getCharacterList()
        })
    }

    function deleteCharacter(){
        axios.delete(`/characters/${id}`).then(() => {
            getCharacterList()
            if (Number(routeId) === Number(id)){
                navigate('/')
            }
        })
    }

    return { Character, setCharacter, deleteCharacter, saveCharacter }

}