import axios from "axios"
import {showAlert} from "./alerts"

//Type is either "password or "string
export const updateSettings=async(data, type)=>{
    try{
        const url=
        type==="password" ?
         "http://127.0.0.1:3000/api/v1/users/updateMyPassword" :
         "http://127.0.0.1:3000/api/v1/users/updateMe"
        const res=await axios({method:"PATCH",
        url,
        data
    })
    if(res.data.status==="success"){
        showAlert("success",`${type.toUpperCase()} Updated Successfully`)

            if (type === 'photo') {
              return res.data.data.user.photo;
            }
          }
    }catch(err){
        showAlert("error",err.response.data.message)
    }
}