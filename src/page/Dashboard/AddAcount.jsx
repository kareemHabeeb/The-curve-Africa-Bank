import React, {useState} from 'react'
import Header from '../../components/Header'
import {useDispatch, useSelector} from "react-redux";
import {addNewAccount} from "../../redux/usersSlice";
import {useNavigate} from "react-router-dom"
import "./css/AddAccount.css"
import "../../components/css/ButtonStyle.css"
import axios from "axios";
import Swal from 'sweetalert2'


const AddAcount = () => {
    // const user = useSelector(state => state.users.loggedInUser);
    const accessToken = useSelector(state => state.apiInfo.accessToken);
    const [accountName, setAccountName] = useState("");
    const [amount, setAmmount] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(false);

    const addAccount=async(e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const config = {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
            
            const response = await axios.post(`${apiUrl}/accounts`, {
                accountName: accountName,
                amount: Number(amount)
            }, config);
            Swal.fire({
                icon: "success",
                title: "Account added successfully",
                text: response.data.message,
            });
            navigate("/dashboard");
        }catch(error){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response.data.message,
            });
        }finally{
            setLoading(false);
        }
        // navigate("/dashboard")
    }
  return (
    <>
        <Header/>
        <div className="AddAccount_Page">
            <div className="AddAccount_Card">
                <div className="AddAccount_Header">
                    <h2>Add New Account</h2>
                    <p>Create an additional account for your profile</p>
                </div>
                <form className="AddAccount_Form" onSubmit={addAccount}>
                    <div className="AddAccount_Field">
                        <label htmlFor="accountName">Account Name</label>
                        <input id="accountName" placeholder="e.g. Savings" value={accountName} onChange={(e)=> setAccountName(e.target.value)} required/>
                    </div>
                    
                    <div className="AddAccount_Field">
                        <label htmlFor="amount">Initial Amount</label>
                        <input id="amount" placeholder="e.g. 20000" value={amount} onChange={(e)=> setAmmount(e.target.value)} required />
                    </div>
                    <button type="submit" className="Btn Btn--primary" disabled={loading}>{loading ? "Adding..." : "Add Account"}</button>
                </form>
            </div>
        </div>
    </>
  )
}

export default AddAcount