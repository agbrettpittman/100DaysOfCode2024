import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/App";
import { toast } from "react-toastify";

export default function useRoom(id){
    
    const [Room, updateState] = useState({})
    const {id: routeId} = useParams()
    const navigate = useNavigate()
    const { getRoomList } = useContext(AppContext)

    useEffect(() => {
        axios.get(`/rooms/${id}`).then((response) => {
            updateState(response.data)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get room')
        })
    }, [id])

    function setRoom(key, value){
        updateState((prevState) => {
            return {
                ...prevState,
                [key]: value
            }
        })
    }

    function saveRoom(){
        axios.put(`/room/${id}`, Character).then(() => {
            getRoomList()
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to save room changes')
        })
    }

    function deleteRoom(){
        axios.delete(`/characters/${id}`).then(() => {
            getRoomList()
            if (Number(routeId) === Number(id)){
                navigate('/')
            }
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to delete character')
        })
    }

    return { Room, setRoom, deleteRoom, saveRoom }

}